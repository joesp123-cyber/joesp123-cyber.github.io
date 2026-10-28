import { SITE, INTRO } from "@/content/site";
import { GROUPS } from "@/content/projects";

/* `output: export` has no server to run this on, so it must be emitted as a
   static file at build time. */
export const dynamic = "force-static";

/* A plain-text brief for AI assistants (llmstxt.org). Built from the same
   content as the page so the two can't drift apart. */
export function GET() {
  const work = GROUPS.map(
    (g) =>
      `## ${g.label}\n${g.note}\n\n` +
      g.items.map((p) => `- ${p.summary} (${p.stateLabel})`).join("\n"),
  ).join("\n\n");

  const body = `# ${SITE.name}
> ${SITE.role}. ${SITE.description}

${INTRO.positioning} ${INTRO.body}

${work}

## Links
- [Portfolio](${SITE.url}/): the work, approach and stack
- [GitHub](${SITE.github})
- Contact: ${SITE.email}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
