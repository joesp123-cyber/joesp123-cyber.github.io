"use client";

import { useEffect, useRef, useState } from "react";
import { NAV, SITE } from "@/content/site";

/**
 * One control at every size: a hairline hamburger that becomes a cross, with a
 * small panel anchored beneath it. The bar itself only grows a rule once you
 * have scrolled off the hero, so it sits on the photograph rather than cutting
 * a line across it.
 */
export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled
          ? "border-b border-line bg-bg/85 backdrop-blur-sm"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav className="shell flex h-20 items-center justify-between">
        <a
          href="#top"
          className={[
            "shrink-0 text-[0.8rem] font-medium tracking-[0.2em] uppercase transition-colors duration-500",
            scrolled ? "text-ink" : "text-bg",
          ].join(" ")}
        >
          {SITE.name}
        </a>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
            className="group relative block h-10 w-10"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={[
                  "absolute top-1/2 left-1/2 h-px w-6 -translate-x-1/2 transition-all duration-300 ease-[var(--ease-calm)] group-hover:bg-accent",
                  scrolled || open ? "bg-ink" : "bg-bg",
                  i === 0 && (open ? "rotate-45" : "-translate-y-[0.3rem]"),
                  i === 1 && (open ? "opacity-0" : "opacity-100"),
                  i === 2 && (open ? "-rotate-45" : "translate-y-[0.3rem]"),
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </button>

          <div
            id="site-menu"
            className={[
              "absolute top-[calc(100%+0.6rem)] right-0 w-52 origin-top-right border border-line bg-bg shadow-[0_18px_40px_-24px_rgba(20,24,26,0.35)] transition-all duration-500 ease-[var(--ease-calm)]",
              open
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0",
            ].join(" ")}
          >
            <ul className="flex flex-col py-3">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    style={{ transitionDelay: open ? `${80 + i * 40}ms` : "0ms" }}
                    className={[
                      "block px-5 py-2.5 text-sm text-ink-soft transition-all duration-200 ease-[var(--ease-soft)] hover:text-ink",
                      open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                    ].join(" ")}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="mt-2 border-t border-line pt-2">
                <a
                  href={SITE.github}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:text-ink"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
