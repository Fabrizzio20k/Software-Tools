"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AuthButtons } from "@/app/components/auth-buttons";
import { NotificationCenter } from "@/app/components/notification-center";
import { MenuIcon } from "@/app/components/portal-icons";
import { PortalNavigation } from "@/app/components/portal-navigation";
import { ThemeToggle } from "@/app/components/theme-toggle";

type PortalSidebarProps = {
  groups: string;
  image?: string | null;
  name: string;
  isAdmin: boolean;
};

export function PortalSidebar({ groups, image, name, isAdmin }: PortalSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Cerrar menú"
            className="sidebar-backdrop"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
            type="button"
          />
        )}
      </AnimatePresence>
      <motion.aside
        animate={{ width: expanded ? 252 : 76 }}
        className={`portal-sidebar${expanded ? " is-expanded" : ""}`}
        transition={reduceMotion ? { duration: 0 } : { bounce: 0, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="portal-sidebar-glow" />
        <div className="portal-sidebar-top">
          <button
            aria-expanded={expanded}
            aria-label={expanded ? "Contraer menú" : "Expandir menú"}
            className="sidebar-toggle"
            onClick={() => setExpanded((value) => !value)}
            type="button"
          >
            <MenuIcon />
          </button>
          <Link aria-label="Ir a aplicaciones" className="sidebar-brand" href="/apps">
            <Image alt="" className="portal-brand-icon" height={36} priority src="/icons/code.png" width={36} />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                animate={{ width: "auto" }}
                className="sidebar-reveal-label"
                exit={{ width: 0 }}
                initial={{ width: 0 }}
                  transition={reduceMotion ? { duration: 0 } : { delay: expanded ? 0.08 : 0, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  ING Software
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <div className="sidebar-navigation-wrap">
          <PortalNavigation expanded={expanded} reducedMotion={reduceMotion ?? false} showAdmin={isAdmin} />
        </div>

        <div className="portal-account">
          <div aria-hidden="true" className="portal-avatar">
            {image ? (
              <Image
                alt=""
                className="portal-avatar-image"
                fill
                sizes="46px"
                src={image}
              />
            ) : (
              name.slice(0, 1).toUpperCase()
            )}
          </div>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                animate={{ width: "auto" }}
                className="portal-account-copy"
                exit={{ width: 0 }}
                initial={{ width: 0 }}
                transition={reduceMotion ? { duration: 0 } : { delay: expanded ? 0.08 : 0, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <strong>{name}</strong>
                <span>{groups}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <NotificationCenter expanded={expanded} reducedMotion={reduceMotion ?? false} sidebar />
          <ThemeToggle expanded={expanded} persistentLabel />
          <AuthButtons authenticated iconOnly={!expanded} persistentLabel />
        </div>
      </motion.aside>
    </>
  );
}
