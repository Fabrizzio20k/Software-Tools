"use client";

import { useState } from "react";
import { PageReveal } from "@/app/components/page-reveal";
import { BellIcon } from "@/app/components/portal-icons";

export function NotificationComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  return (
    <PageReveal>
      <section className="portal-page admin-page">
        <div className="page-intro admin-intro">
          <span className="page-symbol"><BellIcon /></span>
          <div>
            <p className="eyebrow">Administración</p>
            <h1>Notificaciones</h1>
            <p>Un lugar para preparar avisos dirigidos a todas las personas del portal.</p>
          </div>
        </div>

        <div className="admin-notification-banner" role="status">
          <span className="admin-notification-banner-icon" aria-hidden="true">i</span>
          <div>
            <strong>Publicación pendiente de activar</strong>
            <p>Este borrador solo se muestra en tu navegador. Aún no se guarda ni se envía a nadie. El envío se habilitará al conectar almacenamiento compartido y entrega en tiempo real.</p>
          </div>
        </div>

        <div className="admin-notification-grid">
          <div className="admin-card admin-notification-editor">
            <span className="admin-section-index">01 / Redactar</span>
            <h2>Nuevo aviso</h2>
            <p className="admin-notification-help">Así quedará el contenido cuando se active la publicación.</p>
            <div className="admin-notification-fields">
              <label htmlFor="notification-title">Título</label>
              <input id="notification-title" maxLength={100} onChange={(event) => setTitle(event.target.value)} placeholder="Ej. Mantenimiento programado" type="text" value={title} />
              <span className="admin-character-count">{title.length}/100</span>
              <label htmlFor="notification-message">Mensaje</label>
              <textarea id="notification-message" maxLength={2000} onChange={(event) => setMessage(event.target.value)} placeholder="Escribe los detalles que todos deben conocer…" rows={6} value={message} />
              <span className="admin-character-count">{message.length}/2000</span>
            </div>
            <div className="admin-notification-footer">
              <span>Destinatarios: todos los usuarios del portal</span>
              <button className="admin-button is-primary" disabled title="La publicación aún no está configurada" type="button">Publicar aviso</button>
            </div>
          </div>

          <aside aria-label="Vista previa de la notificación" className="admin-notification-preview-wrap">
            <span className="admin-section-index">02 / Vista previa</span>
            <div className="admin-notification-preview">
              <div className="admin-notification-preview-top"><span className="admin-notification-preview-icon"><BellIcon /></span><span>ING Software · Aviso</span><span>Ahora</span></div>
              <strong>{title.trim() || "Título de tu aviso"}</strong>
              <p>{message.trim() || "Tu mensaje aparecerá aquí mientras lo redactas."}</p>
            </div>
            <p className="admin-notification-preview-note">La vista previa es local y desaparece al salir de esta página.</p>
          </aside>
        </div>
      </section>
    </PageReveal>
  );
}
