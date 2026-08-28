/* The work. One entry per system, each read as problem -> solution -> approach.

   The data itself lives in projects.json so that the private portfolio document
   can be regenerated from exactly the same source without parsing TypeScript.
   Edit the JSON; this file only puts types and derived counts on top of it.

   state drives the marker and the counts:  live | built | archived
   trigger is what actually sets it running, or null if nothing does.
   Clients are described here, never named — the names live in the private doc. */

import data from "./projects.json";

export type Project = {
  name: string;
  role: string;
  period: string;
  state: "live" | "built" | "archived";
  stateLabel: string;
  trigger: string | null;
  summary: string;
  problem: string;
  solution: string;
  approach: string;
  agents: string[];
  skills: string[];
  stack: string[];
};

export type Group = { id: string; label: string; note: string; items: Project[] };

export const GROUPS = data.groups as Group[];
export const STACK = data.stack as [string, string][];

export const ALL: Project[] = GROUPS.flatMap((g) => g.items);
export const LIVE_COUNT = ALL.filter((p) => p.state === "live").length;
export const TOTAL_COUNT = ALL.length;
