import Link from "next/link";
import { PageReveal } from "@/app/components/page-reveal";
import { BellIcon, UsersIcon } from "@/app/components/portal-icons";

export default function AdminPage() {
  return (
    <PageReveal>
      <section className="portal-page admin-page">
        <div className="page-intro admin-intro">
          <div>
            <p className="eyebrow">Administración</p>
            <h1>Configura tu espacio</h1>
            <p>Gestiona las personas que entran al portal y comunícate con ellas.</p>
          </div>
        </div>
        <div className="admin-dashboard-grid">
          <Link className="admin-dashboard-card" href="/admin/users">
            <span className="admin-dashboard-icon"><UsersIcon /></span>
            <span className="admin-dashboard-index">01 / Acceso</span>
            <strong>Usuarios</strong>
            <span>Crear, importar y gestionar cuentas y grupos de Keycloak.</span>
            <span className="admin-dashboard-arrow" aria-hidden="true">↗</span>
          </Link>
          <Link className="admin-dashboard-card" href="/admin/notifications">
            <span className="admin-dashboard-icon"><BellIcon /></span>
            <span className="admin-dashboard-index">02 / Comunicación</span>
            <strong>Notificaciones</strong>
            <span>Prepara avisos para el portal. Publicación pendiente de activar.</span>
            <span className="admin-dashboard-arrow" aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </PageReveal>
  );
}
