import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const adminGroup = "/Admins";
const maxUsersPerOperation = 100;

export type KeycloakGroup = {
  id: string;
  name: string;
  path: string;
};

export type KeycloakUser = {
  email: string;
  enabled: boolean;
  firstName: string;
  groups: KeycloakGroup[];
  id: string;
  lastName: string;
  username: string;
};

export type UserInput = {
  email: string;
  firstName: string;
  groupId: string;
  lastName: string;
  username: string;
};

type KeycloakConfig = {
  adminBaseUrl: string;
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
};

class KeycloakAdminError extends Error {
  constructor(message: string, readonly status = 500) {
    super(message);
  }
}

function getConfig(): KeycloakConfig {
  const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID;
  const clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET;

  if (!issuer || !clientId || !clientSecret) {
    throw new KeycloakAdminError("La administración de usuarios no está configurada.");
  }

  const issuerUrl = new URL(issuer);
  const realmMatch = issuerUrl.pathname.match(/^\/realms\/([^/]+)$/);
  if (!realmMatch) throw new KeycloakAdminError("El issuer de Keycloak no tiene un realm válido.");

  return {
    adminBaseUrl: new URL(`/admin/realms/${realmMatch[1]}/`, issuerUrl.origin).toString(),
    clientId,
    clientSecret,
    tokenUrl: new URL("protocol/openid-connect/token", `${issuer}/`).toString(),
  };
}

async function getAccessToken(config: KeycloakConfig) {
  const response = await fetch(config.tokenUrl, {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  if (!response.ok) throw new KeycloakAdminError("Keycloak rechazó las credenciales de administración.", response.status);

  const payload = await response.json() as { access_token?: unknown };
  if (typeof payload.access_token !== "string") throw new KeycloakAdminError("Keycloak no devolvió un token de administración.");
  return payload.access_token;
}

async function adminFetch(path: string, init: RequestInit = {}, accessToken?: string) {
  const config = getConfig();
  const token = accessToken ?? await getAccessToken(config);
  const url = new URL(path, config.adminBaseUrl);
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...init, cache: "no-store", headers });
  if (response.ok) return response;

  const payload = await response.json().catch(() => null) as { errorMessage?: unknown } | null;
  const message = typeof payload?.errorMessage === "string"
    ? payload.errorMessage
    : "Keycloak no pudo completar la operación.";
  throw new KeycloakAdminError(message, response.status);
}

function toGroup(value: unknown): KeycloakGroup | null {
  if (!value || typeof value !== "object") return null;
  const group = value as { id?: unknown; name?: unknown; path?: unknown };
  if (typeof group.id !== "string" || typeof group.name !== "string") return null;
  return { id: group.id, name: group.name, path: typeof group.path === "string" ? group.path : `/${group.name}` };
}

function toUser(value: unknown, groups: KeycloakGroup[]): KeycloakUser | null {
  if (!value || typeof value !== "object") return null;
  const user = value as Record<string, unknown>;
  if (typeof user.id !== "string" || typeof user.username !== "string") return null;
  return {
    email: typeof user.email === "string" ? user.email : "",
    enabled: user.enabled !== false,
    firstName: typeof user.firstName === "string" ? user.firstName : "",
    groups,
    id: user.id,
    lastName: typeof user.lastName === "string" ? user.lastName : "",
    username: user.username,
  };
}

export async function isPortalAdmin() {
  const session = await getServerSession(authOptions);
  return Boolean(session?.user?.groups.includes(adminGroup));
}

export async function listGroups(accessToken?: string) {
  const response = await adminFetch("groups?briefRepresentation=true&max=200", {}, accessToken);
  const payload = await response.json() as unknown[];
  return payload.map(toGroup).filter((group): group is KeycloakGroup => group !== null)
    .sort((left, right) => left.path.localeCompare(right.path, "es"));
}

export async function listUsers() {
  const token = await getAccessToken(getConfig());
  const response = await adminFetch("users?briefRepresentation=true&first=0&max=200", {}, token);
  const payload = await response.json() as unknown[];

  const users = await Promise.all(payload.map(async (value) => {
    if (!value || typeof value !== "object" || typeof (value as { id?: unknown }).id !== "string") return null;
    const id = (value as { id: string }).id;
    const groupsResponse = await adminFetch(`users/${encodeURIComponent(id)}/groups?briefRepresentation=true&max=200`, {}, token);
    const groupsPayload = await groupsResponse.json() as unknown[];
    const groups = groupsPayload.map(toGroup).filter((group): group is KeycloakGroup => group !== null);
    return toUser(value, groups);
  }));

  return users.filter((user): user is KeycloakUser => user !== null && !user.username.startsWith("service-account-"))
    .sort((left, right) => left.username.localeCompare(right.username, "es"));
}

function validateUserInput(value: unknown): UserInput {
  if (!value || typeof value !== "object") throw new KeycloakAdminError("Hay una fila de usuario inválida.", 400);
  const user = value as Record<string, unknown>;
  const input = {
    email: typeof user.email === "string" ? user.email.trim().toLowerCase() : "",
    firstName: typeof user.firstName === "string" ? user.firstName.trim() : "",
    groupId: typeof user.groupId === "string" ? user.groupId.trim() : "",
    lastName: typeof user.lastName === "string" ? user.lastName.trim() : "",
    username: typeof user.username === "string" ? user.username.trim().toLowerCase() : "",
  };

  if (!input.username || !/^[a-z0-9][a-z0-9._-]{1,63}$/i.test(input.username)) {
    throw new KeycloakAdminError("Cada usuario necesita un username válido.", 400);
  }
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    throw new KeycloakAdminError("Cada usuario necesita un correo válido.", 400);
  }
  if (!input.firstName || !input.lastName || input.firstName.length > 100 || input.lastName.length > 100 || input.email.length > 254) {
    throw new KeycloakAdminError("Cada usuario necesita nombre y apellido válidos.", 400);
  }
  if (!input.groupId) throw new KeycloakAdminError("Cada usuario debe pertenecer a un grupo.", 400);
  return input;
}

export async function createUsers(values: unknown) {
  if (!Array.isArray(values) || !values.length || values.length > maxUsersPerOperation) {
    throw new KeycloakAdminError(`La carga debe contener entre 1 y ${maxUsersPerOperation} usuarios.`, 400);
  }

  const users = values.map(validateUserInput);
  const usernames = new Set<string>();
  const emails = new Set<string>();
  for (const user of users) {
    if (usernames.has(user.username) || emails.has(user.email)) {
      throw new KeycloakAdminError("No repitas usernames ni correos dentro de la misma carga.", 400);
    }
    usernames.add(user.username);
    emails.add(user.email);
  }

  const token = await getAccessToken(getConfig());
  const groups = await listGroups(token);
  const groupIds = new Set(groups.map((group) => group.id));
  if (users.some((user) => !groupIds.has(user.groupId))) {
    throw new KeycloakAdminError("Uno de los grupos elegidos ya no existe.", 400);
  }

  const created: string[] = [];
  const failures: { email: string; message: string }[] = [];
  for (const user of users) {
    try {
      const response = await adminFetch("users", {
        body: JSON.stringify({
          email: user.email,
          emailVerified: false,
          enabled: true,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
        }),
        method: "POST",
      }, token);
      const location = response.headers.get("location");
      const userId = location?.split("/").pop();
      if (!userId) throw new KeycloakAdminError("Keycloak no devolvió el usuario creado.");

      try {
        await adminFetch(`users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(user.groupId)}`, { method: "PUT" }, token);
        const membershipsResponse = await adminFetch(`users/${encodeURIComponent(userId)}/groups?briefRepresentation=true&max=200`, {}, token);
        const memberships = await membershipsResponse.json() as unknown[];
        for (const membership of memberships.map(toGroup).filter((group): group is KeycloakGroup => group !== null)) {
          if (membership.id !== user.groupId) {
            await adminFetch(`users/${encodeURIComponent(userId)}/groups/${encodeURIComponent(membership.id)}`, { method: "DELETE" }, token);
          }
        }
        created.push(user.username);
      } catch (error) {
        const rolledBack = await adminFetch(`users/${encodeURIComponent(userId)}`, { method: "DELETE" }, token).then(() => true).catch(() => false);
        if (!rolledBack) throw new KeycloakAdminError(`No se pudo terminar ni revertir la cuenta ${user.username}; revísala en Keycloak.`);
        throw error;
      }
    } catch (error) {
      failures.push({
        email: user.email,
        message: error instanceof Error ? error.message : "No se pudo crear el usuario.",
      });
    }
  }

  return { created, failures };
}

function validateIds(values: unknown) {
  if (!Array.isArray(values) || !values.length || values.length > maxUsersPerOperation || values.some((id) => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) || new Set(values).size !== values.length) {
    throw new KeycloakAdminError(`Selecciona entre 1 y ${maxUsersPerOperation} usuarios.`, 400);
  }
  return values as string[];
}

async function validateActionTargets(values: unknown, token: string) {
  const ids = validateIds(values);
  const session = await getServerSession(authOptions);
  if (session?.user?.id && ids.includes(session.user.id)) {
    throw new KeycloakAdminError("No puedes modificar tu propia cuenta desde esta pantalla.", 400);
  }
  const targets = await Promise.all(ids.map(async (id) => {
    const response = await adminFetch(`users/${encodeURIComponent(id)}`, {}, token);
    return response.json() as Promise<{ username?: string; serviceAccountClientId?: string }>;
  }));
  if (targets.some((user) => user.serviceAccountClientId || user.username?.startsWith("service-account-"))) {
    throw new KeycloakAdminError("No se pueden modificar cuentas técnicas desde esta pantalla.", 400);
  }
  return ids;
}

export async function setUsersEnabled(values: unknown, enabled: boolean) {
  const token = await getAccessToken(getConfig());
  const ids = await validateActionTargets(values, token);
  return performBulkAction(ids, (id) => adminFetch(`users/${encodeURIComponent(id)}`, {
    body: JSON.stringify({ enabled }),
    method: "PUT",
  }, token));
}

export async function deleteUsers(values: unknown) {
  const token = await getAccessToken(getConfig());
  const ids = await validateActionTargets(values, token);
  return performBulkAction(ids, (id) => adminFetch(`users/${encodeURIComponent(id)}`, { method: "DELETE" }, token));
}

async function performBulkAction(ids: string[], action: (id: string) => Promise<Response>) {
  const failedIds: string[] = [];
  let completed = 0;
  for (let index = 0; index < ids.length; index += 10) {
    const batch = ids.slice(index, index + 10);
    const results = await Promise.allSettled(batch.map(action));
    results.forEach((result, resultIndex) => {
      if (result.status === "fulfilled") completed++;
      else failedIds.push(batch[resultIndex]);
    });
  }
  return { completed, failedIds };
}

export function getKeycloakError(error: unknown) {
  if (error instanceof KeycloakAdminError) return { message: error.message, status: error.status };
  return { message: "No se pudo completar la operación con Keycloak.", status: 500 };
}
