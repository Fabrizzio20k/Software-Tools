"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type PageRevealProps = {
  children: ReactNode;
  className?: string;
};

export function PageReveal({ children, className }: PageRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
