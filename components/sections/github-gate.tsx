"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { SITE } from "@/content/site";
import {
  BRIEF,
  FIELDS,
  START,
  SOLVED,
  describe,
  expression,
  isSolved,
  type Parts,
} from "@/lib/cron";

const KEY = "jw-repo-unlocked";
const EVENT = "jw-repo-unlocked";

/**
 * Whether this visitor has already opened the repository. Read after mount so
 * the server-rendered markup and the first client render agree — reading
 * localStorage during render would be a hydration mismatch.
 */
export function useUnlocked() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setUnlocked(localStorage.getItem(KEY) === "1");
      } catch {
        /* private mode, blocked storage — stay locked, the gate still works */
      }
    };
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return unlocked;
}

function markUnlocked() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* nothing to persist to; the unlock still holds for this page view */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function GithubGate() {
  const [parts, setParts] = useState<Parts>(START);
  const [open, setOpen] = useState(false);
  const alreadyUnlocked = useUnlocked();

  const solved = isSolved(parts);

  // hold the unlock for a beat after the last field lands, so it reads as a
  // consequence of the answer rather than a flicker while you are still choosing
  useEffect(() => {
    if (!solved) return;
    const t = setTimeout(() => {
      setOpen(true);
      markUnlocked();
    }, 450);
    return () => clearTimeout(t);
  }, [solved]);

  // a returning visitor arrives unlocked; put the answer back in the fields so
  // the row does not sit on "every minute every day" under an unlocked link
  useEffect(() => {
    if (alreadyUnlocked) setParts(SOLVED);
  }, [alreadyUnlocked]);

  const shown = open || alreadyUnlocked;

  return (
    <div id="github" className="scroll-mt-24">
      <Reveal>
        <p className="eyebrow mb-4">The repository</p>
        <h2 className="max-w-xl text-2xl md:text-3xl">
          Everything here runs on a schedule. Write one and the link is yours.
        </h2>
        <p className="mt-5 max-w-xl text-ink-soft">
          {shown
            ? "Solved. The schedule below is the one that would run this site's own agents on a weekday morning."
            : `${BRIEF} Set the five fields until the line underneath says so. It tells you what you have built as you go, so there is nothing to guess.`}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-10 max-w-2xl">
          <div className="grid grid-cols-5 border-t border-line">
            {FIELDS.map((field) => (
              <label
                key={field.key}
                className="flex flex-col gap-3 border-b border-line px-1 py-6 text-center first:pl-0 last:pr-0"
              >
                <span className="eyebrow text-[0.55rem] leading-tight md:text-[0.65rem]">
                  {field.label}
                </span>
                <select
                  value={parts[field.key]}
                  disabled={shown}
                  onChange={(e) =>
                    setParts((p) => ({ ...p, [field.key]: e.target.value }))
                  }
                  aria-label={field.label}
                  className="numeral cursor-pointer appearance-none bg-transparent text-center text-2xl leading-none text-ink transition-colors duration-200 ease-[var(--ease-soft)] hover:text-accent focus-visible:text-accent disabled:cursor-default disabled:opacity-70 md:text-3xl"
                >
                  {field.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <p
            aria-live="polite"
            className="mt-5 text-ink-soft transition-colors duration-500 ease-[var(--ease-calm)]"
          >
            <span className="numeral mr-3 text-sm tracking-[0.2em] text-ink-faint">
              {expression(parts)}
            </span>
            {describe(parts)}
          </p>

          <div
            className={[
              "grid transition-all duration-700 ease-[var(--ease-calm)]",
              shown ? "mt-8 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            ].join(" ")}
          >
            <div className="overflow-hidden">
              {/* mounted only once solved. A collapsed-but-rendered anchor is
                  not a gate: it sits in the source, and keyboard and screen
                  reader users reach it without ever seeing the puzzle. */}
              {shown && (
                <>
                  <div className="rule mb-5" />
                  <a
                    href={SITE.github}
                    className="numeral text-lg text-ink underline decoration-line underline-offset-[6px] transition-colors duration-200 ease-[var(--ease-soft)] hover:text-accent hover:decoration-accent md:text-xl"
                  >
                    github.com/joesp123-cyber
                  </a>
                  <p className="mt-3 text-sm text-ink-faint">
                    Unlocked. It stays open on this device.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
