import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserAdminConsole } from "@/app/components/user-admin-console";
import { authOptions } from "@/lib/auth";
import { isPortalAdmin } from "@/lib/keycloak-admin";

export default async function AdminUsersPage() {
  if (!await isPortalAdmin()) redirect("/apps");
  const session = await getServerSession(authOptions);
  return <UserAdminConsole currentUserId={session?.user?.id} />;
}
