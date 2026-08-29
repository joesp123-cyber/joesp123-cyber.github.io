"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/**
 * Restrained parallax for full-bleed imagery. Small offset for depth, never
 * drama. `amount` is the peak travel in pixels across the scroll pass.
 * Static under reduced motion.
 */
export function Parallax({
  children,
  amount = 40,
  className,
}: {
  children: React.ReactNode;
  amount?: number;
  className?: string;
}) {
  // deferred by a render for the same reason as Reveal: reading the media query
  // during render makes a reduced-motion client hydrate a different tree than
  // the server produced
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && !!prefersReduced;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className}>
      {/* The moving layer is oversized by `amount` on top and bottom so the peak
          travel can never pull an image edge into view (no background slivers). */}
      <motion.div
        style={{ y, top: -amount, bottom: -amount }}
        className="absolute inset-x-0 will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
