"use client";

import { replayEntryGame } from "@/components/layout/entry-game";

/** Puts the entry game back up, for anyone who wants another go. */
export function ReplayGameLink() {
  return (
    <button
      type="button"
      onClick={replayEntryGame}
      className="border-b border-line pb-0.5 text-ink-soft transition-colors hover:border-accent hover:text-ink"
    >
      Play the door game
    </button>
  );
}
