/* The front door. A spacebar game: clear five gates and the site opens.

   Everything here is pure and deterministic — no random course, no clock read
   inside the model, time passed in as dt. That means the whole game can be
   simulated in a test, which is the only honest way to know it is both
   winnable and losable before shipping it in front of the site.

   The world is a fixed 100 x 100 logical box; the canvas scales to it. */

export const WORLD = 100;

/** Where the mark sits horizontally. Everything else scrolls past it. */
export const MARK_X = 24;
export const MARK_R = 2.4;

export const GRAVITY = 190; // units per second squared
export const FLAP = -62; // instantaneous upward velocity, units per second
export const SPEED = 34; // world units per second the course travels
export const GAP = 30; // vertical opening, world units
export const GATE_W = 6;

/** A fixed course, so a second attempt rewards what you learned on the first. */
const GAP_CENTRES = [50, 42, 60, 36, 64];
const FIRST_GATE_X = 78;
const GATE_SPACING = 44;

export const GATES = GAP_CENTRES.map((gapCentre, i) => ({
  gapCentre,
  x: FIRST_GATE_X + i * GATE_SPACING,
}));

export type Status = "ready" | "playing" | "dead" | "won";

export type Game = {
  /** milliseconds since the run began */
  t: number;
  /** how far the course has travelled, world units */
  scrolled: number;
  y: number;
  vy: number;
  passed: number;
  status: Status;
};

export function initial(): Game {
  return { t: 0, scrolled: 0, y: WORLD / 2, vy: 0, passed: 0, status: "ready" };
}

/** Screen-space left edge of a gate at the current scroll. */
export function gateX(scrolled: number, i: number): number {
  return GATES[i].x - scrolled;
}

export function flap(g: Game): Game {
  if (g.status === "dead" || g.status === "won") return g;
  return { ...g, status: "playing", vy: FLAP };
}

export function step(g: Game, dt: number): Game {
  if (g.status !== "playing" || dt <= 0) return g;

  const s = dt / 1000;
  const vy = g.vy + GRAVITY * s;
  const y = g.y + vy * s;
  const scrolled = g.scrolled + SPEED * s;
  const t = g.t + dt;

  // ceiling and floor
  if (y - MARK_R <= 0 || y + MARK_R >= WORLD) {
    return { ...g, t, scrolled, y: Math.min(Math.max(y, MARK_R), WORLD - MARK_R), vy, status: "dead" };
  }

  let passed = g.passed;
  for (let i = 0; i < GATES.length; i++) {
    const left = gateX(scrolled, i);
    const right = left + GATE_W;
    const overlapping = MARK_X + MARK_R > left && MARK_X - MARK_R < right;
    if (overlapping) {
      const top = GATES[i].gapCentre - GAP / 2;
      const bottom = GATES[i].gapCentre + GAP / 2;
      if (y - MARK_R < top || y + MARK_R > bottom) {
        return { ...g, t, scrolled, y, vy, status: "dead" };
      }
    }
    if (right < MARK_X - MARK_R && i + 1 > passed) passed = i + 1;
  }

  if (passed >= GATES.length) return { ...g, t, scrolled, y, vy, passed, status: "won" };
  return { ...g, t, scrolled, y, vy, passed };
}

/**
 * What a competent player does: hold the mark near the centre of whichever gate
 * is coming, flapping only when it has fallen below that line. Used by the tests
 * to prove the course is clearable, and nowhere in the shipped game.
 */
export function autopilotShouldFlap(g: Game): boolean {
  const next = GATES.findIndex((_, i) => gateX(g.scrolled, i) + GATE_W >= MARK_X - MARK_R);
  const aim = next === -1 ? WORLD / 2 : GATES[next].gapCentre;
  // flap a little before the aim line, because a flap takes time to arrest a fall
  return g.y > aim - 1.5 && g.vy > -10;
}
