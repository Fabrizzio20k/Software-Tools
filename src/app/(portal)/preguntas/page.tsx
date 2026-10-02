import { PageReveal } from "@/app/components/page-reveal";

export default function PreguntasPage() {
  return (
    <PageReveal>
      <section className="portal-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Ayuda</p>
            <h1>Preguntas frecuentes</h1>
            <p>Lo esencial para comenzar a usar el portal.</p>
          </div>
        </div>

        <div className="faq-list">
          <details className="faq-item" open>
            <summary>¿Necesito crear más cuentas para ingresar?</summary>
            <p>
              No. Basta con iniciar sesión con tu cuenta de Google. No necesitas crear cuentas adicionales para acceder al portal.
            </p>
          </details>
        </div>
      </section>
    </PageReveal>
  );
}
