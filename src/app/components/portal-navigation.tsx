"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AppsIcon, BlogIcon, HelpIcon } from "@/app/components/portal-icons";

const navigation = [
  { href: "/apps", label: "Apps", Icon: AppsIcon },
  { href: "/blog", label: "Blog", Icon: BlogIcon },
  { href: "/preguntas", label: "Ayuda", Icon: HelpIcon },
];

type PortalNavigationProps = {
  expanded?: boolean;
};

export function PortalNavigation({ expanded = true }: PortalNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="portal-navigation">
      {navigation.map(({ href, label, Icon }) => {
        const active = pathname === href;

        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`portal-navigation-link${active ? " is-active" : ""}`}
            href={href}
            key={href}
          >
            {active && (
              <motion.span
                className="portal-navigation-active"
                layoutId="portal-navigation-active"
                transition={{ bounce: 0, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <Icon className="portal-navigation-icon" />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  animate={{ opacity: 1, width: "auto" }}
                  className="portal-navigation-label"
                  exit={{ opacity: 0, width: 0 }}
                  initial={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        );
      })}
    </nav>
  );
}
