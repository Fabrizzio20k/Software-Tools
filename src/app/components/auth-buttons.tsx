"use client";

import { signIn } from "next-auth/react";
import { SignOutIcon } from "@/app/components/portal-icons";

type AuthButtonsProps = {
  authenticated: boolean;
  className?: string;
  iconOnly?: boolean;
};

export function AuthButtons({ authenticated, className, iconOnly = false }: AuthButtonsProps) {
  if (authenticated) {
    return (
      <form action="/api/auth/logout" method="post">
        <button
          className={`auth-button auth-button-quiet${className ? ` ${className}` : ""}`}
          aria-label={iconOnly ? "Cerrar sesión" : undefined}
          title={iconOnly ? "Cerrar sesión" : undefined}
          type="submit"
        >
          <SignOutIcon className="auth-button-icon" />
          {!iconOnly && <span>Cerrar sesión</span>}
        </button>
      </form>
    );
  }

  return (
    <button
      className={`auth-button auth-button-primary${className ? ` ${className}` : ""}`}
      onClick={() => signIn("keycloak", { callbackUrl: "/apps" })}
      type="button"
    >
      Iniciar sesión
    </button>
  );
}
