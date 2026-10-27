import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/* `output: export` has no server to run this on, so it must be emitted as a
   static file at build time. */
export const dynamic = "force-static";

/* Named so the choice is on record rather than implied by the wildcard: the
   point of this site is to be found, and these are the crawlers behind
   ChatGPT, Claude, Perplexity, Gemini and Copilot answers. */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
