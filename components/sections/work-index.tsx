"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Group, Project } from "@/content/projects";

const CALM = [0.22, 1, 0.36, 1] as const;

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** A quiet labelled block — the eyebrow carries the label, the prose carries the weight. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 first:mt-0">
      <p className="eyebrow mb-3">{label}</p>
      {children}
    </div>
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
        {project.trigger && (
          <Field label="What sets it running">
            <p className="text-sm text-ink-soft">{project.trigger}</p>
          </Field>
        )}
        <Field label="Agents and components">
          <ul>
            {project.agents.map((a) => (
              <li
                key={a}
                className="border-t border-line py-2.5 text-sm text-ink-soft first:border-t-0 first:pt-0"
              >
                {a}
              </li>
            ))}
          </ul>
        </Field>
        <Field label="Skills developed">
          <p className="text-sm text-ink-soft">{project.skills.join(" · ")}</p>
        </Field>
        <Field label="Stack">
          <p className="text-sm text-ink-soft">{project.stack.join(" · ")}</p>
        </Field>
      </div>
    </div>
  );
}

/**
 * The index of work. Oversized ghosted numerals in a hairline ruled list; open a
 * row and it unfolds with a verdigris rule and the full case. One row open at a
 * time, so the page never becomes a wall.
 */
export function WorkIndex({ group, startAt }: { group: Group; startAt: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  return (
    <ol>
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
                className="group flex w-full items-start gap-6 py-7 text-left md:gap-10"
              >
                {/* fixed-width column so the numeral growing never shifts the title */}
                <span
                  className={cn(
                    "numeral w-14 shrink-0 leading-none transition-all duration-500 ease-[var(--ease-calm)] md:w-24",
                    isOpen
                      ? "text-[2.6rem] text-ink md:text-[3.2rem]"
                      : "text-[1.8rem] text-ink/25 group-hover:text-ink/45 md:text-[2.2rem]",
                  )}
                >
                  {n}
                </span>

                <span className="flex-1 pt-1">
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "h-px bg-accent transition-all duration-500 ease-[var(--ease-calm)]",
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

                  <span className="mt-2 block max-w-xl text-ink-soft">
                    {project.summary}
                  </span>

                  <span className="mt-3 block text-sm text-ink-faint">
                    {project.role} · {project.period}
                    <span className="md:hidden"> · {project.stateLabel}</span>
                  </span>
                </span>

                {/* state, kept quiet: a filled mark only for the ones still running */}
                <span className="hidden shrink-0 items-center gap-2.5 pt-2 text-right md:flex">
                  <span className="eyebrow whitespace-nowrap">
                    {project.stateLabel}
                  </span>
                  <span
                    className={cn(
                      "block h-1.5 w-1.5 rounded-full",
                      project.state === "live"
                        ? "bg-accent"
                        : "border border-ink/30 bg-transparent",
                    )}
                  />
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
                  <div className="md:pl-[6.5rem]">
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
