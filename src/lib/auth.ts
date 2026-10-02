import "server-only";
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const clientId = process.env.AUTH_KEYCLOAK_ID;
const clientSecret = process.env.AUTH_KEYCLOAK_SECRET;
const issuer = process.env.AUTH_KEYCLOAK_ISSUER;
const secret = process.env.AUTH_SECRET;

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

export const authOptions: NextAuthOptions = {
  secret,
  session: { strategy: "jwt" },
  providers: [
    KeycloakProvider({
      clientId,
      clientSecret,
      issuer,
    }),
  ],
  callbacks: {
    jwt({ token, profile }) {
      if (profile) token.groups = getGroups(profile);
      return token;
    },
    session({ session, token }) {
      session.user.groups = token.groups ?? [];
      return session;
    },
  },
};
