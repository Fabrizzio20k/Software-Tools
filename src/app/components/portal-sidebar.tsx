"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AuthButtons } from "@/app/components/auth-buttons";
import { MenuIcon } from "@/app/components/portal-icons";
import { PortalNavigation } from "@/app/components/portal-navigation";

type PortalSidebarProps = {
  groups: string;
  name: string;
};

export function PortalSidebar({ groups, name }: PortalSidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
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
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                initial={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16 }}
              >
                ING Software
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <div className="sidebar-navigation-wrap">
        <PortalNavigation expanded={expanded} />
      </div>

      <div className="portal-account">
        <div aria-hidden="true" className="portal-avatar">
          {name.slice(0, 1).toUpperCase()}
        </div>
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="portal-account-copy"
              exit={{ opacity: 0, x: -6 }}
              initial={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.16 }}
            >
              <strong>{name}</strong>
              <span>{groups}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AuthButtons authenticated iconOnly={!expanded} />
      </div>
    </motion.aside>
  );
}
