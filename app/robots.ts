import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/* `output: export` has no server to run this on, so it must be emitted as a
   static file at build time. */
export const dynamic = "force-static";


export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
