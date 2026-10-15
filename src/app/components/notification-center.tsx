"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { BellIcon } from "@/app/components/portal-icons";

type NotificationCenterProps = {
  expanded?: boolean;
  reducedMotion?: boolean;
  sidebar?: boolean;
};

export function NotificationCenter({ expanded = false, reducedMotion = false, sidebar = false }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    function closeOnOutsideInteraction(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className={`notification-center${sidebar ? " notification-center-sidebar" : ""}`} ref={containerRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        aria-label="Notificaciones"
        className="notification-trigger"
        onClick={() => setOpen((value) => !value)}
        title="Notificaciones"
        type="button"
      >
        <BellIcon />
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              animate={{ width: "auto" }}
              className="sidebar-action-label sidebar-reveal-label"
              exit={{ width: 0 }}
              initial={{ width: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: expanded ? 0.08 : 0, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              Notificaciones
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {open && (
          <motion.section
            animate={sidebar
              ? { clipPath: "inset(0 0% 0 0)", opacity: 1 }
              : { opacity: 1, scale: 1 }}
            aria-label="Notificaciones"
            className="notification-panel"
            exit={sidebar
              ? { clipPath: "inset(0 100% 0 0)" }
              : { opacity: 0, scale: 0.97 }}
            id={panelId}
            initial={sidebar
              ? { clipPath: "inset(0 100% 0 0)", opacity: 0 }
              : { opacity: 0, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <BellIcon className="notification-panel-icon" />
            <div>
              <strong>Sin notificaciones</strong>
              <p>Cuando haya novedades, aparecerán aquí.</p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
