"use client";

import { signIn, signOut } from "next-auth/react";
import { SignOutIcon } from "@/app/components/portal-icons";

type AuthButtonsProps = {
  authenticated: boolean;
  className?: string;
  iconOnly?: boolean;
};

export function AuthButtons({ authenticated, className, iconOnly = false }: AuthButtonsProps) {
  if (authenticated) {
    return (
      <button
        className={`auth-button auth-button-quiet${className ? ` ${className}` : ""}`}
        onClick={() => signOut({ callbackUrl: "/" })}
        aria-label={iconOnly ? "Cerrar sesión" : undefined}
        title={iconOnly ? "Cerrar sesión" : undefined}
        type="button"
      >
        {iconOnly ? <SignOutIcon className="auth-button-icon" /> : "Cerrar sesión"}
      </button>
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
