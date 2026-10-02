import { AppsDirectory } from "@/app/components/apps-directory";
import { PageReveal } from "@/app/components/page-reveal";

export default function AppsPage() {
  return (
    <PageReveal>
      <section className="portal-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Herramientas</p>
            <h1>Tu espacio de trabajo</h1>
            <p>Herramientas esenciales para construir, revisar y mejorar software.</p>
          </div>
        </div>
        <AppsDirectory />
      </section>
    </PageReveal>
  );
}
