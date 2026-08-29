import { SITE, CREDITS } from "@/content/site";
import { ReplayGameLink } from "@/components/layout/replay-game";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm tracking-[0.2em] uppercase">{SITE.name}</p>
          <p className="mt-2 text-sm text-ink-soft">{SITE.role}</p>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <li>
            <a
              href={SITE.github}
              className="border-b border-line pb-0.5 text-ink-soft transition-colors hover:border-accent hover:text-ink"
            >
              GitHub
            </a>
          </li>
          <li>
            <ReplayGameLink />
          </li>
          <li>
            <a
              href={`mailto:${SITE.email}`}
              className="border-b border-line pb-0.5 text-ink-soft transition-colors hover:border-accent hover:text-ink"
            >
              Email
            </a>
          </li>
        </ul>
      </div>

      <div className="shell border-t border-line py-6">
        <p className="text-sm leading-relaxed text-ink-faint">
          Photography by{" "}
          {CREDITS.map((c, i) => (
            <span key={c.url}>
              <a href={c.url} className="transition-colors hover:text-ink">
                {c.name}
              </a>
              {i < CREDITS.length - 2 ? ", " : i === CREDITS.length - 2 ? " and " : ""}
            </span>
          ))}{" "}
          on Unsplash
        </p>
      </div>
    </footer>
  );
}
