"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const CALM = [0.22, 1, 0.36, 1] as const;

/**
 * prefers-reduced-motion, but only after the first client render.
 *
 * Reading it during render swaps a motion element for a plain one, and the
 * server has no media query to read — so a reduced-motion visitor hydrated a
 * <div> onto markup React had emitted as a motion.div with inline initial
 * styles, and every page load threw a hydration error. Deferring by one render
 * keeps the first client pass identical to the server.
 */
function useReducedAfterMount() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && !!reduced;
}

type Tag = "div" | "section" | "li" | "span" | "h2";
const MOTION = {
  div: motion.div,
  section: motion.section,
  li: motion.li,
  span: motion.span,
  h2: motion.h2,
};

/**
 * Soft fade + gentle rise as the element enters view. Reveals once.
 * No-ops under prefers-reduced-motion; a <noscript> rule in the root layout
 * keeps [data-reveal] content visible when JavaScript is unavailable.
 */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 16,
  className,
}: {
  children: React.ReactNode;
  as?: Tag;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedAfterMount();
  const Comp = MOTION[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Comp
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: CALM }}
    >
      {children}
    </Comp>
  );
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: CALM } },
};

/** Container that cascades its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedAfterMount();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedAfterMount();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div data-reveal className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
