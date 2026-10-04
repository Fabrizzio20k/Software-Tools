"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ArrowUpRightIcon, GridIcon, ListIcon } from "@/app/components/portal-icons";

const apps = [
  { description: "Calidad, seguridad y mantenibilidad del código.", href: "https://sonarqube.ingsoftware.lat/sessions/init/saml?return_to=/", image: "/images/sonar.webp", name: "SonarQube", tone: "sonar" },
  { description: "Planificación y seguimiento del trabajo en equipo.", href: "https://openproject.ingsoftware.lat", image: "/images/openproject.webp", name: "OpenProject", tone: "openproject" },
  { description: "Automatización para integración y entrega continua.", href: "https://jenkins.ingsoftware.lat", image: "/images/jenkins.webp", name: "Jenkins", tone: "jenkins" },
  { description: "Únete al grupo general para conversar y recibir novedades del curso.", href: "https://discord.com", image: "/images/discord.webp", name: "Discord", tone: "discord" },
];

type View = "grid" | "list";

export function AppsDirectory() {
  const [view, setView] = useState<View>("grid");
  const reduceMotion = useReducedMotion();

  return (
    <div className="apps-directory">
      <div className="section-heading">
        <div>
          <h2>Aplicaciones</h2>
          <span>{apps.length} disponibles</span>
        </div>
        <div aria-label="Vista de aplicaciones" className="view-toggle" role="group">
          <button aria-label="Ver como cuadrícula" aria-pressed={view === "grid"} className="view-toggle-button" onClick={() => setView("grid")} type="button">
            {view === "grid" && <motion.span className="view-toggle-active" layoutId="apps-view" />}
            <GridIcon />
          </button>
          <button aria-label="Ver como lista" aria-pressed={view === "list"} className="view-toggle-button" onClick={() => setView("list")} type="button">
            {view === "list" && <motion.span className="view-toggle-active" layoutId="apps-view" />}
            <ListIcon />
          </button>
        </div>
      </div>

      <motion.div animate={{ opacity: 1 }} className={`app-grid is-${view}`} initial={false} layout>
        {apps.map((app, index) => (
          <motion.a
            aria-label={`Abrir ${app.name} en una pestaña nueva`}
            className={`app-card app-card-${app.tone}`}
            href={app.href}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            key={app.name}
            rel="noreferrer"
            target="_blank"
            transition={{ delay: reduceMotion ? 0 : index * 0.045, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="app-card-visual">
              <div className="app-icon-tile"><Image alt="" fill sizes="96px" src={app.image} /></div>
            </div>
            <div className="app-card-copy">
              <h3>{app.name}</h3>
              <p>{app.description}</p>
            </div>
            <ArrowUpRightIcon className="app-external-icon" />
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
