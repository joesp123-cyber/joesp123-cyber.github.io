"use client";

import { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";

/**
 * Lenis swallows the browser's native anchor jump, so in-page links have to be
 * handed to it explicitly. Delegated from the document, which keeps every
 * current and future #anchor working without threading a ref through the tree.
 */
function AnchorScroll() {
  const lenis = useLenis();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const link = (e.target as HTMLElement)?.closest?.("a");
      const href = link?.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -72 });
      else target.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);
  return null;
}

/**
 * Gentle smooth scroll. Disabled entirely for users who prefer reduced motion,
 * and never applied to touch momentum.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{ lerp: 0.09, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 }}
    >
      <AnchorScroll />
      {children}
    </ReactLenis>
  );
}
