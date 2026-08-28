import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { WorkIndex } from "@/components/sections/work-index";
import { Footer } from "@/components/layout/footer";
import { GROUPS, STACK, TOTAL_COUNT, LIVE_COUNT } from "@/content/projects";
import {
  HERO,
  INTRO,
  STATEMENT,
  INTERSTITIAL,
  PRINCIPLES,
  CTA,
  SITE,
} from "@/content/site";

const [VENTURES, INDEPENDENT] = GROUPS;

export default function Home() {
  return (
    <>
      {/* ---- Hero: full-bleed, the headline down in the shadow ---- */}
      <section className="relative h-[92svh] min-h-[560px] w-full overflow-hidden">
        <Parallax amount={40} className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Louvre shadows striping a pale concrete wall"
            fill
            priority
            sizes="100vw"
            className="scale-105 object-cover object-center"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/50 via-ink/10 to-transparent" />
        {/* the nav sits in limestone on the photograph; without this its
            legibility depends on whichever frame happens to be behind it */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/35 to-transparent" />

        <div className="relative flex h-full items-end">
          <div className="shell pb-20 md:pb-28">
            <Reveal delay={0.25}>
              <p className="mb-5 text-sm tracking-[0.22em] text-bg/80 uppercase">
                {HERO.eyebrow}
              </p>
              <h1 className="max-w-3xl text-4xl leading-[1.05] text-bg sm:text-5xl md:text-6xl">
                {HERO.headline}
              </h1>
            </Reveal>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="scroll-cue h-10 w-px bg-bg/60" />
        </div>
      </section>

      {/* ---- Positioning, with the offset portrait ---- */}
      <section className="shell py-28 md:py-36">
        <div className="grid items-center gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <Reveal>
              <p className="text-2xl leading-snug tracking-tight text-ink md:text-4xl md:leading-[1.2]">
                {INTRO.positioning}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="rule my-10" />
              <p className="max-w-xl text-lg text-ink-soft">{INTRO.body}</p>
              <p className="mt-6 text-lg font-medium text-ink">{INTRO.emphasis}</p>
            </Reveal>
          </div>
          <Reveal className="md:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="/images/order.jpg"
                alt="Stacked white balcony fins receding along a facade"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---- The work, part one ---- */}
      <section id="work" className="scroll-mt-20 border-t border-line bg-bg-lift">
        <div className="shell py-28 md:py-36">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow mb-4">Selected work</p>
            <h2 className="text-3xl md:text-5xl">
              {TOTAL_COUNT} systems, and what each one was actually for
            </h2>
            <div className="rule my-10" />
            <p className="max-w-xl text-lg text-ink-soft">
              Open a row for the problem it was built against, what it does, and
              the decisions behind it. {LIVE_COUNT} of the {TOTAL_COUNT} are in
              production today.
            </p>
          </Reveal>

          <Reveal className="mb-8 max-w-xl">
            <h3 className="text-xl md:text-2xl">{VENTURES.label}</h3>
            <p className="mt-2 text-ink-soft">{VENTURES.note}</p>
          </Reveal>
          <WorkIndex group={VENTURES} startAt={1} />
        </div>
      </section>

      {/* ---- A breath between the two halves of the index. Fourteen rows in one
             run reads as a wall; this is the beat that stops it. ---- */}
      <section className="border-t border-line bg-bg-tint">
        <div className="shell py-20 md:py-28">
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">{INDEPENDENT.label}</p>
            <p className="text-2xl leading-snug tracking-tight text-ink md:text-3xl md:leading-[1.25]">
              {INTERSTITIAL}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---- The work, part two ---- */}
      <section className="border-t border-line bg-bg-lift">
        <div className="shell py-24 md:py-32">
          <WorkIndex
            group={INDEPENDENT}
            startAt={VENTURES.items.length + 1}
          />
        </div>
      </section>

      {/* ---- A line worth stopping on ---- */}
      <section className="relative h-[70svh] min-h-[440px] w-full overflow-hidden">
        <Parallax amount={50} className="absolute inset-0">
          <Image
            src="/images/rhythm.jpg"
            alt="The dark angular eave of a concrete building against a bank of cloud"
            fill
            sizes="100vw"
            className="scale-105 object-cover"
          />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/35 to-ink/10" />
        <div className="relative flex h-full items-center">
          <div className="shell">
            <Reveal>
              <p className="max-w-2xl text-2xl leading-snug tracking-tight text-bg md:text-4xl md:leading-[1.25]">
                {STATEMENT}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- How I work — mirror of the positioning block ---- */}
      <section id="approach" className="scroll-mt-20 border-t border-line">
        <div className="shell py-28 md:py-36">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <Reveal className="md:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src="/images/grid.jpg"
                  alt="A chequered concrete facade dissolving into shadow"
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="md:col-span-7">
              <Reveal>
                <p className="eyebrow mb-4">How I work</p>
                <h2 className="text-3xl md:text-5xl">
                  Four rules I have paid to learn
                </h2>
                <div className="rule my-10" />
              </Reveal>
              <Stagger>
                {PRINCIPLES.map((p) => (
                  <StaggerItem key={p.title}>
                    <div className="border-t border-line py-6 last:border-b">
                      <h3 className="text-lg md:text-xl">{p.title}</h3>
                      <p className="mt-2 max-w-lg text-ink-soft">{p.body}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Stack ---- */}
      <section id="stack" className="scroll-mt-20 border-t border-line bg-bg-tint">
        <div className="shell py-28 md:py-36">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow mb-4">Full stack</p>
            <h2 className="text-3xl md:text-5xl">What I build it with</h2>
            <div className="rule mt-10" />
          </Reveal>
          <Reveal>
            <dl className="grid border-t border-line md:grid-cols-2 md:gap-x-16">
              {STACK.map(([label, body]) => (
                <div
                  key={label}
                  className="grid border-b border-line py-5 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <dt className="eyebrow pt-1 text-ink">{label}</dt>
                  <dd className="mt-1 text-ink-soft sm:mt-0">{body}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ---- Invitation ---- */}
      <section id="contact" className="scroll-mt-20 border-t border-line">
        <div className="shell py-24 text-center md:py-32">
          <Reveal>
            <div className="rule mx-auto mb-10" />
            <p className="mx-auto max-w-2xl text-2xl tracking-tight text-ink md:text-3xl">
              {CTA.line}
            </p>
            <div className="mt-10">
              <a
                href={`mailto:${SITE.email}`}
                className="inline-block border border-ink px-8 py-4 text-sm tracking-[0.12em] uppercase transition-colors duration-200 ease-[var(--ease-soft)] hover:border-accent hover:bg-accent hover:text-bg"
              >
                {CTA.label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
