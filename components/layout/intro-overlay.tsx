"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/content/site";

/**
 * The limestone layer the site arrives from. The wordmark settles, then the
 * whole layer wipes upward. Plays once per session — a second visit inside the
 * same tab goes straight to the page, because a three-second entrance is
 * charming exactly once.
 *
 * Whether it plays at all is decided pre-paint by the inline script in the root
 * layout, which sets data-intro on <html>. Without that gate there is a flash of
 * the hero before the overlay covers it.
 */
export function IntroOverlay() {
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.intro !== "play") {
      setGone(true);
      return;
    }
    sessionStorage.setItem("jw-intro", "seen");
    // hold on the wordmark, wipe, then unmount so it can never trap a click
    const lift = setTimeout(() => setExiting(true), 1650);
    const drop = setTimeout(() => {
      setGone(true);
      document.documentElement.removeAttribute("data-intro");
    }, 3200);
    return () => {
      clearTimeout(lift);
      clearTimeout(drop);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="intro-overlay" data-exiting={exiting} aria-hidden="true">
      <div className="intro-logo text-center">
        <p className="text-xl font-light tracking-[0.18em] uppercase md:text-2xl">
          {SITE.name}
        </p>
        <div className="mx-auto mt-5 h-px w-10 bg-accent" />
      </div>
    </div>
  );
}
