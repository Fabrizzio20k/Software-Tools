import "server-only";
import type { NextAuthOptions } from "next-auth";
import { decode } from "next-auth/jwt";
import KeycloakProvider from "next-auth/providers/keycloak";

const clientId = process.env.AUTH_KEYCLOAK_ID;
const clientSecret = process.env.AUTH_KEYCLOAK_SECRET;
const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
const secret = process.env.AUTH_SECRET;
const sessionMaxAge = 7 * 24 * 60 * 60;

function isExpired(timestamp: unknown) {
  return typeof timestamp === "number" && timestamp <= Math.floor(Date.now() / 1000);
}

function getGroups(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [];

  const groups = (profile as { groups?: unknown }).groups;
  return Array.isArray(groups)
    ? groups.filter((group): group is string => typeof group === "string")
    : [];
}

if (!clientId || !clientSecret || !issuer || !secret) {
  throw new Error("Faltan variables privadas para configurar la autenticación.");
}

export const authSecret = secret;
const keycloakClientId = clientId;
const keycloakIssuer = issuer;

export function getKeycloakLogoutUrl(idToken: string | undefined, postLogoutRedirectUri: string) {
  const url = new URL(`${keycloakIssuer}/protocol/openid-connect/logout`);

  url.searchParams.set("client_id", keycloakClientId);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
  if (idToken) url.searchParams.set("id_token_hint", idToken);

  return url;
}

export const authOptions: NextAuthOptions = {
  secret,
  session: { strategy: "jwt", maxAge: sessionMaxAge },
  jwt: {
    maxAge: sessionMaxAge,
    async decode(params) {
      const token = await decode(params);
      return isExpired(token?.absoluteExpiresAt) ? null : token;
    },
  },
  providers: [
    KeycloakProvider({
      clientId,
      clientSecret,
      issuer,
    }),
  ],
  callbacks: {
    jwt({ token, account, profile }) {
      if (!token.absoluteExpiresAt) {
        token.absoluteExpiresAt = Math.floor(Date.now() / 1000) + sessionMaxAge;
      }
      if (profile) token.groups = getGroups(profile);
      if (account?.id_token) token.idToken = account.id_token;
      return token;
    },
    session({ session, token }) {
      session.user.groups = token.groups ?? [];
      return session;
    },
  },
};
