import Link from "next/link";
import type { Metadata } from "next";
import { eras } from "@/data/eras";
import { getAllEntriesSorted } from "@/data/entries";
import { Entry } from "@/lib/types";

const description =
  "A complete year-by-year chronology of Park Seonghwa's activities, organized by era from the 2018 debut to the present.";

export const metadata: Metadata = {
  title: "Chronology",
  description,
  alternates: { canonical: "/chronology" },
  openGraph: {
    type: "website",
    url: "/chronology",
    title: "Chronology — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chronology — The Starhwa Encyclopedia",
    description,
  },
};

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

function groupByYear(list: Entry[]) {
  const map = new Map<number, Entry[]>();
  for (const entry of list) {
    if (!map.has(entry.year)) map.set(entry.year, []);
    map.get(entry.year)!.push(entry);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

export default function ChronologyPage() {
  const all = getAllEntriesSorted();

  return (
    <div>
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
          <p className="eyebrow text-plum">2018 — Present</p>
          <h1 className="mt-3 font-display text-5xl sm:text-6xl">
            Chronology
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/85">
            From the debut on October 24, 2018 to today, by era and year.
          </p>
          <nav aria-label="Jump to era" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {eras.map((era) => (
              <a key={era.id} href={`#${era.id}`} className="eyebrow text-charcoal/70 hover:text-plum">
                {era.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {[...eras].reverse().map((era) => {
        const eraEntries = all.filter((e) => e.eraId === era.id);
        const byYear = groupByYear(eraEntries);

        return (
          <section key={era.id} id={era.id} className="scroll-mt-32 border-b border-line">
            <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="lg:sticky lg:top-32 lg:self-start">
                  <p className="eyebrow text-charcoal/75">{era.years}</p>
                  <h2 className="mt-2 font-display text-3xl leading-tight">
                    {era.name}
                  </h2>
                  <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/80">
                    {era.summary}
                  </p>
                </div>

                <div>
                  {byYear.length === 0 && (
                    <p className="meta border-t border-line pt-6 text-charcoal/75">
                      No catalogued entries yet.
                    </p>
                  )}
                  {byYear.map(([year, yearEntries]) => (
                    <div key={year} className="mb-10 last:mb-0">
                      <p className="font-display text-2xl text-plum">{year}</p>
                      <ul className="mt-4 divide-y divide-line border-t border-line">
                        {yearEntries.map((entry) => (
                          <li key={entry.id}>
                            <Link
                              href={`/archive/${entry.slug}`}
                              className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-6"
                            >
                              <span className="meta w-20 shrink-0 text-charcoal/75">
                                {formatDate(entry.date)}
                              </span>
                              <span className="meta w-36 shrink-0 text-plum">
                                {entry.category}
                              </span>
                              <span className="font-display text-lg text-ink transition-colors group-hover:text-plum">
                                {entry.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
