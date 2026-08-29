/* A deliberately small slice of cron, for the gate on the repository link.
   The option sets are constrained so the puzzle is always solvable by reading
   the plain-English readout, and the readout is a pure function so it can be
   tested without a browser. */

export type Parts = {
  minute: string;
  hour: string;
  dom: string;
  month: string;
  dow: string;
};

export const FIELDS: { key: keyof Parts; label: string; options: string[] }[] = [
  { key: "minute", label: "minute", options: ["*", "0", "15", "30", "*/15"] },
  { key: "hour", label: "hour", options: ["*", "6", "8", "9", "18"] },
  { key: "dom", label: "day of month", options: ["*", "1", "15"] },
  { key: "month", label: "month", options: ["*", "1", "6"] },
  { key: "dow", label: "day of week", options: ["*", "1-5", "1", "0,6"] },
];

export const START: Parts = {
  minute: "*",
  hour: "*",
  dom: "*",
  month: "*",
  dow: "*",
};

/** The brief the visitor is solving for, and the expression that satisfies it. */
export const BRIEF = "Every weekday at 08:00.";
export const TARGET = "0 8 * * 1-5";

/** The answer, used to restore the fields for a visitor who already solved it. */
export const SOLVED: Parts = {
  minute: "0",
  hour: "8",
  dom: "*",
  month: "*",
  dow: "1-5",
};

export function expression(p: Parts): string {
  return `${p.minute} ${p.hour} ${p.dom} ${p.month} ${p.dow}`;
}

export function isSolved(p: Parts): boolean {
  return expression(p) === TARGET;
}

const ORDINAL: Record<string, string> = { "1": "1st", "15": "15th" };
const MONTH: Record<string, string> = { "1": "January", "6": "June" };
const DOW: Record<string, string> = {
  "1-5": "on weekdays",
  "1": "on Mondays",
  "0,6": "at weekends",
};

function when(minute: string, hour: string): string {
  const hh = (h: string) => `${h.padStart(2, "0")}:`;

  if (minute === "*" && hour === "*") return "Every minute";
  if (minute === "*") return `Every minute of the ${hh(hour)}00 hour`;
  if (minute === "*/15" && hour === "*") return "Every fifteen minutes";
  if (minute === "*/15") return `Every fifteen minutes of the ${hh(hour)}00 hour`;
  if (hour === "*") return `${minute} minutes past every hour`;
  return `At ${hh(hour)}${minute.padStart(2, "0")}`;
}

/**
 * Plain English for the current expression. This is the whole hint system: read
 * it, and the puzzle solves itself. It is a toy, not a barrier.
 */
export function describe(p: Parts): string {
  const parts: string[] = [when(p.minute, p.hour)];

  const dayRules: string[] = [];
  if (p.dom !== "*") dayRules.push(`on the ${ORDINAL[p.dom] ?? p.dom}`);
  if (p.dow !== "*") dayRules.push(DOW[p.dow] ?? `on day ${p.dow}`);

  if (dayRules.length === 0) {
    parts.push("every day");
  } else if (dayRules.length === 1) {
    parts.push(dayRules[0]);
  } else {
    // the classic cron trap: a day-of-month and a day-of-week are ORed, not ANDed
    parts.push(`${dayRules[0]} or ${dayRules[1]} — cron treats those as either, not both`);
  }

  if (p.month !== "*") parts.push(`in ${MONTH[p.month] ?? `month ${p.month}`}`);

  return parts.join(" ") + ".";
}
