import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/* `output: export` has no server to run this on, so it must be emitted as a
   static file at build time. */
export const dynamic = "force-static";


/* The site only rebuilds when it is pushed, so the build time is when the
   content last changed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
