import type { Metadata } from "next";
import { Suspense } from "react";
import ArchiveClient from "@/components/ArchiveClient";
import { getAllEntriesSorted } from "@/data/entries";

const description =
  "A searchable, filterable database of catalogued entries documenting Park Seonghwa of ATEEZ, by category, era, and year.";

export const metadata: Metadata = {
  title: "Archive",
  description,
  alternates: { canonical: "/archive" },
  openGraph: {
    type: "website",
    url: "/archive",
    title: "Archive — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Archive — The Starhwa Encyclopedia",
    description,
  },
};

export default function ArchivePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">The Database</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Archive</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/85">
        Filter the full catalogue by category, era, or year.
      </p>

      <div className="mt-12">
        <Suspense fallback={null}>
          <ArchiveClient entries={getAllEntriesSorted()} />
        </Suspense>
      </div>
    </div>
  );
}
