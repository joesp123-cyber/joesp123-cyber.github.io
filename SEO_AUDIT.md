# SEO Audit: joesp123-cyber.github.io

**Date:** 2026-10-27  
**Tool:** `seo-audit/scripts/audit.py` from [claude-code-skills](https://github.com/joesp123-cyber/claude-code-skills), run against the static build in `out/`  
**Score:** 95 → **100** / 100  
**Page speed:** not measured. The sandbox couldn't reach PageSpeed Insights. Run `/seo-audit https://joesp123-cyber.github.io` from a normal machine to get Core Web Vitals.

## Already right before this pass
These were already in place, so nobody should "fix" them:
- Unique title and description
- Canonical URL
- `lang="en-GB"` and a viewport tag
- One H1
- Image alt text
- Open Graph and Twitter cards with a 1200×630 image
- Valid Person JSON-LD
- `robots.txt` and `sitemap.xml`

## Fixed

| # | Finding | Fix | Where |
|---|---|---|---|
| 1 | No WebSite structured data | Added a `WebSite` node, linked to the Person by `@id`, so Google can show the site name above the result | `app/layout.tsx` |
| 2 | No `/llms.txt` | Generated at build time from the same content as the page, so the two can't drift apart | `app/llms.txt/route.ts` |
| 3 | No explicit rules for AI crawlers | Named the ChatGPT, Claude, Perplexity and Gemini crawlers as allowed. The site exists to be found, and blocking them would remove it from AI answers | `app/robots.ts` |
| 4 | Sitemap had no `<lastmod>` | Uses the build time. The site only rebuilds on push, so that's when the content last changed | `app/sitemap.ts` |
| 5 | Share image had no alt text | Added an `og:image:alt` with the card text | `app/opengraph-image.alt.txt` |

## Next steps (need you, not code)
1. **Google Search Console:** add the property, verify it, and submit `sitemap.xml`. This is how you see impressions and clicks at all.
2. **Bing Webmaster Tools:** import from Search Console. Bing also feeds Copilot and other AI answers.
3. **Entity signals:** add LinkedIn and any other official profiles to `sameAs` in `app/layout.tsx`, and use the same one-line description on each.
4. **Ranking for your name is the realistic goal for a one-page site.** To rank for services ("AI agent developer UK"), each service needs its own page. Run `/seo-keywords` first.
