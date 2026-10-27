import type { Metadata } from "next";
import { Suspense } from "react";
import StoriesClient from "@/components/StoriesClient";
import Glint from "@/components/Glint";
import { stories } from "@/data/stories";

const description =
  "The small, human moments Seonghwa has chosen to share publicly since 2023 — a curated journal alongside the career archive.";

export const metadata: Metadata = {
  title: "Seonghwa's Stories",
  description,
  alternates: { canonical: "/stories" },
  openGraph: {
    type: "website",
    url: "/stories",
    title: "Seonghwa's Stories — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seonghwa's Stories — The Starhwa Encyclopedia",
    description,
  },
};

export default function StoriesPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">A Little Journal</p>
      <h1 className="relative mt-3 inline-block font-display text-5xl sm:text-6xl">
        <Glint className="glint-burst -right-2 -top-3" />
        Seonghwa&apos;s Stories <span aria-hidden="true">✦</span>
      </h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/85">
        The everyday moments Seonghwa has shared publicly on the official
        platform since April 2023 — a meal, a quiet photo, a late-night
        thought, a note to ATINY. Translated into English, with context where
        needed.
      </p>

      <div className="mt-12">
        <Suspense fallback={null}>
          <StoriesClient stories={stories} />
        </Suspense>
      </div>
    </div>
  );
}
