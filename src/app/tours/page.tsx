import type { Metadata } from "next";
import { externalLinkProps, formatEntryDate } from "@/components/entry-grid/entryLink";
import { getAllEntriesSorted } from "@/data/entries";
import { getTourRows } from "@/lib/tours";

const description =
  "Every World Tour concert date, in one uniform record — date, tour, and city, with a direct link to the official source where one qualifies.";

export const metadata: Metadata = {
  title: "Tours",
  description,
  alternates: { canonical: "/tours" },
  openGraph: {
    type: "website",
    url: "/tours",
    title: "Tours — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours — The Starhwa Encyclopedia",
    description,
  },
};

export default function ToursPage() {
  const rows = getTourRows(getAllEntriesSorted());

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">World Tour Dates</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Tours</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/85">
        Every catalogued World Tour concert date, from Park Seonghwa&apos;s
        first world tour to the present, in one uniform record. Each show
        links out to a qualifying official source — an official
        #TODAY_ATEEZ post or venue photo from @ATEEZofficial or
        @ATEEZofficialjp — only when one exists.
      </p>

      <ul className="mt-12 divide-y divide-line border-t border-line">
        {rows.map(({ entry, tourEvent, location, sourceUrl }) => (
          <li key={entry.id} className="py-5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
              <p className="font-display text-lg leading-snug sm:text-xl">
                <time dateTime={entry.date} className="text-ink">
                  {formatEntryDate(entry.date)}
                </time>{" "}
                — {tourEvent}
              </p>
              <p className="meta text-charcoal/70">
                <span aria-hidden="true">—</span> {location}
              </p>
              {sourceUrl && (
                <p className="text-sm">
                  <span aria-hidden="true" className="text-charcoal/70">
                    —
                  </span>{" "}
                  <a
                    href={sourceUrl}
                    {...externalLinkProps}
                    className="text-plum underline decoration-line underline-offset-4 hover:decoration-plum"
                  >
                    View source <span aria-hidden="true">→</span>
                    <span className="sr-only"> (opens original source in a new tab)</span>
                  </a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
