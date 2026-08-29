"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  GAP,
  GATES,
  GATE_W,
  MARK_R,
  MARK_X,
  WORLD,
  flap,
  gateX,
  initial,
  step,
  type Game,
} from "@/lib/flappy";

const KEY = "jw-entered";

/* Read straight off the CSS tokens so the game can never drift from the site. */
const INK = "#14181a";
const LINE = "rgba(20, 24, 26, 0.16)";
const ACCENT = "#356659";
const BG = "#efefeb";

/** How many world units of course are visible across the canvas. */
const VIEW_W = 112;

export function EntryGame() {
  const [needed, setNeeded] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Game["status"]>("ready");
  const [passed, setPassed] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useRef<Game>(initial());
  const raf = useRef(0);
  const last = useRef(0);

  /* Decide after mount, so the server markup and the first client render match.
     A reflex game is exactly what prefers-reduced-motion is for, so those
     visitors go straight in. */
  useEffect(() => {
    let skip = false;
    try {
      skip = localStorage.getItem(KEY) === "1";
    } catch {
      /* storage blocked — play it, it is only a few seconds */
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) skip = true;
    setNeeded(!skip);
  }, []);

  const enter = useCallback(() => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* nothing to persist to; this visit still gets in */
    }
    setLeaving(true);
    window.setTimeout(() => setNeeded(false), 900);
  }, []);

  /* Hold the page still underneath while the door is shut. */
  useEffect(() => {
    if (!needed) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [needed]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width: cssW, height: cssH } = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(cssW * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }

    const g = game.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cssW, cssH);

    /* Horizontal scale is fixed to a set span of world units rather than derived
       from the canvas height. Tying it to height meant a wide screen showed far
       more of the course than a narrow one, so the same model played easier on a
       desktop than on a phone. Everyone now sees the same run-up. */
    const ux = cssW / VIEW_W;
    const uy = cssH / WORLD;
    const x = (v: number) => v * ux;
    const y = (v: number) => v * uy;

    // gates, as pairs of louvres
    ctx.fillStyle = INK;
    GATES.forEach((gate, i) => {
      const left = x(gateX(g.scrolled, i));
      const w = x(GATE_W);
      if (left > cssW || left + w < 0) return;
      const top = y(gate.gapCentre - GAP / 2);
      const bottom = y(gate.gapCentre + GAP / 2);
      ctx.fillRect(left, 0, w, top);
      ctx.fillRect(left, bottom, w, cssH - bottom);
    });

    // the mark keeps square proportions off the vertical unit, and tilts with
    // how fast it is falling
    ctx.save();
    ctx.translate(x(MARK_X), y(g.y));
    ctx.rotate(Math.max(-0.5, Math.min(0.9, g.vy / 130)));
    ctx.fillStyle = ACCENT;
    const r = y(MARK_R);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();

    // a hairline floor, so falling reads as falling
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, cssH - 0.5);
    ctx.lineTo(cssW, cssH - 0.5);
    ctx.stroke();
  }, []);

  /* The loop. State lives in a ref so a frame costs no React render; only the
     things the copy depends on are lifted into state. */
  useEffect(() => {
    if (!needed) return;

    const frame = (now: number) => {
      const dt = last.current ? Math.min(now - last.current, 48) : 0;
      last.current = now;

      const before = game.current;
      const after = step(before, dt);
      game.current = after;

      if (after.passed !== before.passed) setPassed(after.passed);
      if (after.status !== before.status) {
        setStatus(after.status);
        if (after.status === "won") {
          draw();
          window.setTimeout(enter, 500);
          return;
        }
      }

      draw();
      raf.current = requestAnimationFrame(frame);
    };

    raf.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf.current);
  }, [needed, draw, enter]);

  const press = useCallback(() => {
    const g = game.current;
    if (g.status === "won") return;
    if (g.status === "dead") {
      game.current = initial();
      setStatus("ready");
      setPassed(0);
      return;
    }
    game.current = flap(g);
    setStatus(game.current.status);
  }, []);

  useEffect(() => {
    if (!needed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        press();
      }
      if (e.key === "Escape") enter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [needed, press, enter]);

  if (needed !== true) return null;

  const line =
    status === "dead"
      ? `Down after ${passed} of ${GATES.length}. Space to go again.`
      : status === "won"
        ? "Through. Come in."
        : status === "ready"
          ? "Space to rise. Five gates and the door opens."
          : `${passed} of ${GATES.length}`;

  return (
    <div
      data-entry-gate
      className="fixed inset-0 z-90 flex flex-col items-center justify-center bg-bg px-6 transition-transform duration-[900ms] ease-[cubic-bezier(0.7,0,0.3,1)]"
      style={{ transform: leaving ? "translateY(-100%)" : "none" }}
    >
      <div className="w-full max-w-3xl">
        <p className="eyebrow mb-3">Before you come in</p>
        <h1 className="text-2xl md:text-3xl">Keep it in the air.</h1>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            press();
          }}
          aria-label="Flap. Or press the space bar."
          className="mt-8 block w-full cursor-pointer border border-line bg-bg-lift p-0"
        >
          <canvas
            ref={canvasRef}
            className="block h-[46svh] max-h-[420px] min-h-[220px] w-full"
          />
        </button>

        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-4">
          <p aria-live="polite" className="text-ink-soft">
            <span className="numeral mr-3 text-lg text-ink">
              {passed}/{GATES.length}
            </span>
            {line}
          </p>
          <button
            type="button"
            onClick={enter}
            className="text-sm text-ink-faint underline decoration-line underline-offset-4 transition-colors duration-200 ease-[var(--ease-soft)] hover:text-ink hover:decoration-accent"
          >
            Skip and go straight in
          </button>
        </div>
      </div>
    </div>
  );
}
