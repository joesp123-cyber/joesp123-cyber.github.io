import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LenisProvider } from "@/components/layout/lenis-provider";
import { IntroOverlay } from "@/components/layout/intro-overlay";
import { EntryGame } from "@/components/layout/entry-game";
import { Nav } from "@/components/layout/nav";
import { SITE } from "@/content/site";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: `${SITE.name} — ${SITE.role}`,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
    url: SITE.url,
    type: "website",
    siteName: SITE.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
  },
};

/* Tells a search engine that this page is *about a named person*, which is the
   only query it has any chance of winning: someone typing the name. Without it
   the page is just prose that happens to mention one. The WebSite node is what
   lets Google show the site name above the result instead of the bare domain. */
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en-GB",
      publisher: { "@id": `${SITE.url}/#person` },
    },
    {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      name: SITE.name,
      url: SITE.url,
      email: `mailto:${SITE.email}`,
      jobTitle: SITE.role,
      description: SITE.description,
      sameAs: [SITE.github],
      knowsAbout: [
        "Artificial intelligence engineering",
        "Multi-agent systems",
        "Document intelligence",
        "Retrieval-augmented generation",
        "Full-stack web development",
      ],
    },
  ],
};

/**
 * Decide before first paint whether the entrance overlay plays, and stamp the
 * answer on <html>. Running this in an effect instead would paint the hero for
 * a frame and then cover it, which reads as a glitch.
 */
const INTRO_GATE = `(function(){try{
  var seen = sessionStorage.getItem('jw-intro');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!seen && !reduced) document.documentElement.dataset.intro='play';
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={manrope.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <noscript>
          {/* the scroll reveals start at opacity 0 and are never triggered
              without JS, so pin them visible */}
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        {/* Renders the preferred-source button in the footer. Loaded after the
            page is interactive so it never delays the first paint. */}
        <Script src="https://news.google.com/swg/js/v1/publisher.js" strategy="afterInteractive" />
        <IntroOverlay />
        <EntryGame />
        <LenisProvider>
          <Nav />
          <main id="top">{children}</main>
        </LenisProvider>
      </body>
    </html>
  );
}
