"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/users", label: "Usuarios" },
  { href: "/admin/notifications", label: "Notificaciones" },
];

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav aria-label="Administración" className="admin-subnav">
      {links.map(({ href, label }) => (
        <Link aria-current={pathname === href ? "page" : undefined} href={href} key={href}>{label}</Link>
      ))}
    </nav>
  );
}
