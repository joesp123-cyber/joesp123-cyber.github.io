/* Exhaustive test of the cron gate's pure logic.

   Run: node --test lib/cron.test.mjs
   The .ts is stripped to plain JS at load, so there is no build step and no
   test-runner dependency to keep current. */

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "cron.ts"), "utf8")
  .replace(/^export type[\s\S]*?^};$/gm, "")
  .replace(/:\s*Record<string,\s*string>/g, "")
  .replace(/:\s*\{ key: keyof Parts; label: string; options: string\[\] \}\[\]/g, "")
  .replace(/:\s*Parts\b/g, "")
  .replace(/:\s*string\[\]/g, "")
  .replace(/:\s*string\b/g, "")
  .replace(/:\s*boolean\b/g, "")
  .replace(/\bexport /g, "");

const mod = new Function(
  src + "; return { FIELDS, START, SOLVED, BRIEF, TARGET, expression, isSolved, describe };",
)();
const { FIELDS, START, SOLVED, TARGET, expression, isSolved, describe } = mod;

const every = (parts) => {
  const out = [];
  const walk = (i, acc) => {
    if (i === FIELDS.length) return out.push(acc);
    for (const o of FIELDS[i].options) walk(i + 1, { ...acc, [FIELDS[i].key]: o });
  };
  walk(0, {});
  return out;
};

const ALL = every();

test("the target is reachable from the offered options", () => {
  const hits = ALL.filter(isSolved);
  assert.equal(hits.length, 1, "exactly one combination should solve it");
  assert.equal(expression(hits[0]), TARGET);
});

test("SOLVED and TARGET cannot drift apart", () => {
  assert.equal(expression(SOLVED), TARGET);
  assert.ok(isSolved(SOLVED));
  for (const f of FIELDS) {
    assert.ok(
      f.options.includes(SOLVED[f.key]),
      `${f.key}: the answer "${SOLVED[f.key]}" is not one of the offered options`,
    );
  }
});

test("the puzzle does not start solved", () => {
  assert.equal(isSolved(START), false);
  assert.equal(expression(START), "* * * * *");
});

test("every reachable state describes itself without crashing or leaking raw cron", () => {
  for (const p of ALL) {
    const text = describe(p);
    assert.ok(text.length > 0, `empty description for ${expression(p)}`);
    assert.ok(text.endsWith("."), `no full stop for ${expression(p)}`);
    assert.ok(/^[A-Z0-9]/.test(text), `not sentence case for ${expression(p)}`);
    assert.ok(
      !text.includes("undefined") && !text.includes("*"),
      `raw token leaked into "${text}" for ${expression(p)}`,
    );
  }
  assert.equal(ALL.length, 5 * 5 * 3 * 3 * 4);
});

test("the solved state reads back as the brief", () => {
  const solved = { minute: "0", hour: "8", dom: "*", month: "*", dow: "1-5" };
  assert.equal(expression(solved), TARGET);
  assert.equal(describe(solved), "At 08:00 on weekdays.");
});

test("known descriptions", () => {
  const cases = [
    [{ minute: "*", hour: "*", dom: "*", month: "*", dow: "*" }, "Every minute every day."],
    [{ minute: "*/15", hour: "*", dom: "*", month: "*", dow: "*" }, "Every fifteen minutes every day."],
    [{ minute: "30", hour: "*", dom: "*", month: "*", dow: "1" }, "30 minutes past every hour on Mondays."],
    [{ minute: "0", hour: "18", dom: "*", month: "*", dow: "0,6" }, "At 18:00 at weekends."],
    [{ minute: "0", hour: "9", dom: "1", month: "6", dow: "*" }, "At 09:00 on the 1st in June."],
  ];
  for (const [parts, expected] of cases) assert.equal(describe(parts), expected);
});

test("the day-of-month / day-of-week OR trap is spelled out", () => {
  const both = { minute: "0", hour: "8", dom: "15", month: "*", dow: "1" };
  assert.match(describe(both), /either, not both/);
});
