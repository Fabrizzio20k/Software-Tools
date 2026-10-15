import { getServerSession } from "next-auth";
import { UserAdminConsole } from "@/app/components/user-admin-console";
import { authOptions } from "@/lib/auth";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  return <UserAdminConsole currentUserId={session?.user?.id} />;
}
