import Link from "next/link";
import EntryCard from "@/components/EntryCard";
import EntryGrid from "@/components/entry-grid/EntryGrid";
import Timeline from "@/components/Timeline";
import Glint from "@/components/Glint";
import { getAllEntriesSorted, getOnThisDayEntry } from "@/data/entries";
import { eras } from "@/data/eras";
import { officialLinks } from "@/data/officialLinks";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Starhwa Encyclopedia",
  url: "https://starhwa.com",
  description:
    "An unofficial fan-maintained archive documenting Park Seonghwa of ATEEZ, from the 2018 debut onward.",
};

export default function Home() {
  const today = new Date();
  const onThisDay = getOnThisDayEntry(today);
  const latest = getAllEntriesSorted().slice(0, 4);
  const featuredEra = eras[eras.length - 1];
  const featuredEntries = getAllEntriesSorted()
    .filter((e) => e.eraId === featuredEra.id)
    .slice(0, 3);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-28">
          <div>
            <p className="eyebrow text-plum">
              A Living Portrait of Seonghwa, 2018—
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.75rem,6vw_+_1rem,4.5rem)] leading-[0.95] tracking-tight">
              The Starhwa
              <br />
              Encyclopedia
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal/85">
              A living record of Park Seonghwa of ATEEZ — every era, stage,
              and appearance, documented from 2018 to the present day.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/chronology" className="glint-hover btn btn-primary relative">
                <Glint className="right-1 top-1" />
                Enter the Chronology
              </Link>
              <Link
                href="/archive"
                className="eyebrow text-charcoal/70 underline decoration-line underline-offset-4 hover:text-plum"
              >
                Browse the Archive →
              </Link>
            </div>
          </div>

          {onThisDay && (
            <div className="relative border border-line bg-ivory-dim/60 p-6 sm:p-8">
              <Glint className="glint-burst right-5 top-5" />
              <Glint
                className="glint-burst right-16 top-10"
                style={{ animationDelay: "160ms" }}
              />
              <p className="meta text-charcoal/85">On This Day</p>
              <p className="mt-1 font-display text-2xl">
                {today.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="mt-5 border-t border-line pt-5">
                <p className="meta text-plum">
                  {onThisDay.category} · {formatDate(onThisDay.date)}
                </p>
                <h2 className="mt-2 font-display text-xl leading-snug">
                  {onThisDay.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-charcoal/80">
                  {onThisDay.summary}
                </p>
                <Link
                  href={`/archive/${onThisDay.slug}`}
                  className="meta mt-4 inline-block text-ink underline decoration-line underline-offset-4 hover:text-plum"
                >
                  View entry — {onThisDay.id}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Timeline */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <p className="eyebrow text-charcoal/85">2018 — Present</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            The Chronology at a Glance
          </h2>
          <div className="mt-10">
            <Timeline now={today.getTime()} />
          </div>
        </div>
      </section>

      {/* Featured era */}
      <section className="border-b border-line bg-ivory-dim/40">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow text-plum">Featured Era</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                {featuredEra.name}
              </h2>
              <p className="eyebrow mt-2 text-charcoal/85">{featuredEra.years}</p>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/85">
                {featuredEra.summary}
              </p>
              <Link
                href={`/chronology#${featuredEra.id}`}
                className="eyebrow mt-6 inline-block text-ink underline decoration-line underline-offset-4 hover:text-plum"
              >
                View full era in Chronology →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {featuredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Latest entries */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-charcoal/85">Latest Additions</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Recently Catalogued
              </h2>
            </div>
            <Link
              href="/archive"
              className="eyebrow text-ink underline decoration-line underline-offset-4 hover:text-plum"
            >
              View full archive →
            </Link>
          </div>
          <div className="mt-10">
            <EntryGrid entries={latest} showYearDividers={false} />
          </div>
        </div>
      </section>

      {/* Official links */}
      <section>
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-charcoal/85">Direct From The Source</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Official Channels
              </h2>
            </div>
            <Link
              href="/official"
              className="eyebrow text-ink underline decoration-line underline-offset-4 hover:text-plum"
            >
              All official links →
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
            {officialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between bg-ivory p-6 transition-colors hover:bg-ink"
              >
                <span className="meta text-charcoal/75 group-hover:text-ivory/60">
                  {link.handle}
                </span>
                <span className="mt-6 font-display text-xl group-hover:text-ivory">
                  {link.platform}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
