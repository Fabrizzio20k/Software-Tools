import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminNavigation } from "@/app/components/admin-navigation";
import { isPortalAdmin } from "@/lib/keycloak-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  if (!await isPortalAdmin()) redirect("/apps");

  return (
    <div className="admin-area">
      <AdminNavigation />
      {children}
    </div>
  );
}
