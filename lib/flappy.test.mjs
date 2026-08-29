/* Simulation tests for the entry game.

   Run: npm test
   The point of these is the pair at the bottom: prove a competent player gets
   through, and prove an idle one does not. A gate nobody can pass and a gate
   everybody passes are both broken, and neither is visible by reading the code.

   The .ts is stripped to plain JS at load so there is no build step in the way. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "flappy.ts"), "utf8")
  .replace(/^export type[\s\S]*?^};$/gm, "")
  .replace(/^export type .*$/gm, "")
  .replace(/:\s*Game\b/g, "")
  .replace(/:\s*number\b/g, "")
  .replace(/:\s*boolean\b/g, "")
  .replace(/\bexport /g, "");

const m = new Function(
  src +
    "; return { WORLD, MARK_X, MARK_R, GRAVITY, FLAP, SPEED, GAP, GATE_W, GATES," +
    " initial, gateX, flap, step, autopilotShouldFlap };",
)();

const FRAME = 16; // ms, one animation frame at 60fps

/** Run the game to a conclusion, asking `policy` each frame whether to flap. */
function play(policy, maxMs = 60_000) {
  let g = m.flap(m.initial()); // the first input starts the run
  let t = 0;
  while (g.status === "playing" && t < maxMs) {
    if (policy(g)) g = m.flap(g);
    g = m.step(g, FRAME);
    t += FRAME;
  }
  return g;
}

test("the course is a fixed five gates, spaced and reachable", () => {
  assert.equal(m.GATES.length, 5);
  for (const gate of m.GATES) {
    assert.ok(
      gate.gapCentre - m.GAP / 2 > m.MARK_R,
      `gap for ${gate.x} opens above the ceiling`,
    );
    assert.ok(
      gate.gapCentre + m.GAP / 2 < m.WORLD - m.MARK_R,
      `gap for ${gate.x} opens below the floor`,
    );
  }
  // the first gate must not be on top of the mark at the start
  assert.ok(m.GATES[0].x - m.MARK_X > 40, "no room to react before the first gate");
});

test("one flap lifts less than the gap, so a gate always needs judgement", () => {
  const apex = (m.FLAP * m.FLAP) / (2 * m.GRAVITY);
  assert.ok(apex > 6, `a flap only lifts ${apex.toFixed(1)} units — too weak to steer`);
  assert.ok(apex < m.GAP, `a flap lifts ${apex.toFixed(1)} units, clearing a whole gap`);
});

test("it does not start until the first input", () => {
  const g = m.initial();
  assert.equal(g.status, "ready");
  assert.equal(m.step(g, 500).y, g.y, "gravity applied before the player started");
  assert.equal(m.flap(g).status, "playing");
});

test("doing nothing loses", () => {
  const g = play(() => false);
  assert.equal(g.status, "dead");
  assert.equal(g.passed, 0);
});

test("flapping constantly loses — it pins you to the ceiling", () => {
  const g = play(() => true);
  assert.equal(g.status, "dead");
});

test("a competent player wins", () => {
  const g = play((s) => m.autopilotShouldFlap(s));
  assert.equal(g.status, "won", `autopilot died after ${g.passed} gates`);
  assert.equal(g.passed, m.GATES.length);
});

test("a win takes long enough to be a game and short enough to be tolerable", () => {
  const g = play((s) => m.autopilotShouldFlap(s));
  assert.ok(g.t > 5_000, `over in ${(g.t / 1000).toFixed(1)}s — too quick to count`);
  assert.ok(g.t < 20_000, `takes ${(g.t / 1000).toFixed(1)}s — too long for a front door`);
});

test("the outcome does not depend on the frame rate", () => {
  for (const frame of [8, 16, 33]) {
    let g = m.flap(m.initial());
    while (g.status === "playing") {
      if (m.autopilotShouldFlap(g)) g = m.flap(g);
      g = m.step(g, frame);
    }
    assert.equal(g.status, "won", `autopilot died at ${Math.round(1000 / frame)}fps`);
  }
});

test("a dead run ignores further input", () => {
  const dead = play(() => false);
  assert.equal(m.flap(dead).status, "dead");
  assert.equal(m.step(dead, FRAME).scrolled, dead.scrolled);
});

test("the mark never leaves the world", () => {
  let g = m.flap(m.initial());
  while (g.status === "playing") {
    if (m.autopilotShouldFlap(g)) g = m.flap(g);
    g = m.step(g, FRAME);
    assert.ok(g.y >= 0 && g.y <= m.WORLD, `mark left the world at y=${g.y}`);
  }
});
