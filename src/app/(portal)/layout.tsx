import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { AuthButtons } from "@/app/components/auth-buttons";
import { PortalNavigation } from "@/app/components/portal-navigation";
import { PortalSidebar } from "@/app/components/portal-sidebar";
import { SiteFooter } from "@/app/components/site-footer";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { authOptions } from "@/lib/auth";

type PortalLayoutProps = { children: ReactNode };

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) redirect("/");

  const groups = session.user.groups.length
    ? session.user.groups.map((group) => group.replace(/^\/+/, "")).join(" · ")
    : "Sin grupo asignado";
  const name = session.user.name ?? "Usuario";

  return (
    <main className="portal-shell">
      <PortalSidebar groups={groups} name={name} />

      <header className="portal-mobile-header">
        <Link className="portal-identity" href="/apps">
          <Image alt="" className="portal-brand-icon" height={32} src="/icons/code.png" width={32} />
          <span>ING Software</span>
        </Link>
        <div className="portal-mobile-actions">
          <ThemeToggle />
          <AuthButtons authenticated iconOnly />
        </div>
        <PortalNavigation />
      </header>

        <div className="portal-main">
          {children}
          <SiteFooter />
        </div>
    </main>
  );
}
