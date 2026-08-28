"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Group, Project } from "@/content/projects";

const CALM = [0.22, 1, 0.36, 1] as const;

/* The numeral column and the gap that follows it. The detail panel indents by
   exactly this much so the prose lands on the same left edge as the summary
   above it — the row has one axis, not four. */
const GUTTER = "md:pl-[8.5rem]";

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <p className="eyebrow mb-3">{label}</p>
      {children}
    </div>
  );
}

/** Filled for the ones actually running, hollow for everything else. */
function StateDot({ live }: { live: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-1.5 w-1.5 shrink-0 rounded-full",
        live ? "bg-accent" : "border border-ink/30",
      )}
    />
  );
}

function Detail({ project }: { project: Project }) {
  return (
    <div className="grid gap-12 pt-2 pb-12 md:grid-cols-12 md:gap-16">
      <div className="md:col-span-7">
        <Field label="The problem">
          <p className="max-w-xl text-ink-soft">{project.problem}</p>
        </Field>
        <Field label="What I built">
          <p className="max-w-xl text-ink-soft">{project.solution}</p>
        </Field>
        <Field label="Approach">
          <p className="max-w-xl text-ink-soft">{project.approach}</p>
        </Field>
      </div>

      <div className="md:col-span-5">
        <Field label="Agents and components">
          <ul>
            {project.agents.map((a) => (
              <li
                key={a}
                className="border-t border-line py-2.5 text-sm text-ink-soft first:border-t-0 first:pt-0 last:border-b"
              >
                {a}
              </li>
            ))}
          </ul>
        </Field>
        <Field label="Skills and stack">
          <p className="text-sm text-ink-soft">{project.skills.join(" · ")}</p>
          <p className="mt-3 text-sm text-ink-faint">{project.stack.join(" · ")}</p>
        </Field>
      </div>
    </div>
  );
}

/**
 * The index of work. Oversized ghosted numerals in a hairline ruled list; open a
 * row and it unfolds with a verdigris rule and the full case. One row open at a
 * time, so the page never becomes a wall.
 *
 * The rule beside an open title hangs in the gutter rather than sitting inline,
 * because an inline rule pushes the title sideways on open and — since the gap
 * applies even at zero width — leaves every closed title misaligned with its own
 * summary. Hanging it keeps one left edge and turns the rule into a margin mark.
 */
export function WorkIndex({ group, startAt }: { group: Group; startAt: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <ol className="max-w-4xl">
      {group.items.map((project, i) => {
        const isOpen = i === openIndex;
        const n = String(startAt + i).padStart(2, "0");
        const panelId = `${group.id}-${i}`;

        return (
          <li key={project.name} className="border-t border-line last:border-b">
            <h4>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="group flex w-full items-start gap-4 py-7 text-left md:gap-10"
              >
                {/* fixed-width column so the numeral growing never shifts the title */}
                <span
                  className={cn(
                    "numeral w-10 shrink-0 leading-none transition-all duration-500 ease-[var(--ease-calm)] md:w-24",
                    isOpen
                      ? "text-[2.6rem] text-ink md:text-[3.4rem]"
                      : "text-[1.8rem] text-ink/30 group-hover:text-ink/50 md:text-[2.4rem]",
                  )}
                >
                  {n}
                </span>

                <span className="min-w-0 flex-1 pt-1">
                  <span className="relative block">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-[0.7em] right-full mr-3 hidden h-0.5 bg-accent transition-all duration-500 ease-[var(--ease-calm)] md:block",
                        isOpen
                          ? "w-8 opacity-100"
                          : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-100",
                      )}
                    />
                    <span
                      className={cn(
                        "block font-semibold tracking-tight transition-all duration-500 ease-[var(--ease-calm)]",
                        isOpen
                          ? "text-[1.5rem] text-ink md:text-[1.9rem]"
                          : "text-lg text-ink-soft group-hover:text-ink md:text-xl",
                      )}
                    >
                      {project.name}
                    </span>
                  </span>

                  <span className="mt-2 block text-ink-soft text-balance">
                    {project.summary}
                  </span>

                  <span className="mt-3 block text-sm text-ink-faint">
                    {project.role} · {project.period}
                  </span>

                  {/* state travels with the content rather than sitting in a
                      far-right column, so it survives every breakpoint */}
                  <span className="mt-1.5 flex items-center gap-2 text-sm text-ink-faint">
                    <StateDot live={project.state === "live"} />
                    <span>
                      {project.stateLabel}
                      {project.trigger ? ` · ${project.trigger}` : ""}
                    </span>
                  </span>
                </span>

                <span className="eyebrow hidden shrink-0 pt-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block">
                  {isOpen ? "Close" : "Open"}
                </span>
              </button>
            </h4>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: CALM }}
                  className="overflow-hidden"
                >
                  <div className={GUTTER}>
                    <Detail project={project} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}
