import { PageReveal } from "@/app/components/page-reveal";

export default function BlogPage() {
  return (
    <PageReveal>
      <section className="portal-page">
        <div className="page-intro">
          <div>
            <p className="eyebrow">Comunidad</p>
            <h1>Blog</h1>
            <p>Ideas, anuncios y aprendizajes de la comunidad.</p>
          </div>
        </div>
        <div className="editorial-grid">
          <article className="editorial-card">
            <div className="editorial-card-top">
              <span>01</span>
              <span aria-hidden="true" className="editorial-symbol editorial-symbol-square" />
            </div>
            <h2>Anuncios</h2>
            <p>Comunicados importantes del curso.</p>
          </article>
          <article className="editorial-card">
            <div className="editorial-card-top">
              <span>02</span>
              <span aria-hidden="true" className="editorial-symbol editorial-symbol-circle" />
            </div>
            <h2>Guías</h2>
            <p>Material para avanzar cada semana.</p>
          </article>
          <article className="editorial-card">
            <div className="editorial-card-top">
              <span>03</span>
              <span aria-hidden="true" className="editorial-symbol editorial-symbol-line" />
            </div>
            <h2>Proyectos</h2>
            <p>Hitos y entregables de los equipos.</p>
          </article>
          <article className="editorial-card">
            <div className="editorial-card-top">
              <span>04</span>
              <span aria-hidden="true" className="editorial-symbol editorial-symbol-grid" />
            </div>
            <h2>Recursos</h2>
            <p>Lecturas y enlaces para profundizar.</p>
          </article>
        </div>
        <p className="editorial-note">Aún no hay publicaciones. Cuando estén disponibles, aparecerán aquí.</p>
      </section>
    </PageReveal>
  );
}
