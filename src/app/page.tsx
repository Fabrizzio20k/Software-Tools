import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import nubeImage from "../../images/NUBE.png";
import { AuthButtons } from "@/app/components/auth-buttons";
import { ArrowUpRightIcon } from "@/app/components/portal-icons";
import { PageReveal } from "@/app/components/page-reveal";
import { SiteFooter } from "@/app/components/site-footer";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const authenticated = Boolean(session?.user);

  return (
    <main className="welcome-page">
      <div className="welcome-orbit welcome-orbit-one" />
      <div className="welcome-orbit welcome-orbit-two" />
      <PageReveal className="welcome-card">
        <div className="welcome-image-panel">
          <Image alt="Cielo azul con nubes" fill priority sizes="(max-width: 700px) 100vw, 52vw" src={nubeImage} />
        </div>
        <div className="welcome-login-panel">
          <div className="welcome-content">
            <div className="welcome-brand">
              <Image alt="" className="portal-brand-icon" height={36} priority src="/icons/code.png" width={36} />
              <span>ING Software</span>
            </div>
            <h1>Tu espacio<br />de trabajo.</h1>
            <p className="welcome-copy">
              Herramientas y recursos para acompañar tu trabajo durante el curso.
            </p>
            <div className="welcome-actions">
              <AuthButtons authenticated={authenticated} />
              {authenticated && (
                <Link className="text-link" href="/apps">
                  Abrir mi espacio <ArrowUpRightIcon className="inline-icon" />
                </Link>
              )}
            </div>
          </div>
          <SiteFooter />
        </div>
      </PageReveal>
    </main>
  );
}
