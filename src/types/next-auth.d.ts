import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      groups: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    absoluteExpiresAt?: number;
    groups?: string[];
    idToken?: string;
  }
}
