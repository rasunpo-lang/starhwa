import type { Metadata } from "next";
import SearchClient from "@/components/SearchClient";
import { getAllEntriesSorted } from "@/data/entries";

const description = "Search the full archive by title, category, or tag.";

export const metadata: Metadata = {
  title: "Search",
  description,
  alternates: { canonical: "/search" },
  openGraph: {
    type: "website",
    url: "/search",
    title: "Search — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Search — The Starhwa Encyclopedia",
    description,
  },
};

export default function SearchPage() {
  const entries = getAllEntriesSorted();

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">Find An Entry</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Search</h1>

      <div className="mt-12">
        <SearchClient entries={entries} />
      </div>
    </div>
  );
}
