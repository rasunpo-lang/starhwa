import type { Metadata } from "next";
import { officialLinks } from "@/data/officialLinks";

const description =
  "Direct links to the official Seonghwa, ATEEZ, and KQ Entertainment channels — YouTube, Instagram, X, TikTok, Facebook, Weverse, and the official website.";

export const metadata: Metadata = {
  title: "Official Links",
  description,
  alternates: { canonical: "/official" },
  openGraph: {
    type: "website",
    url: "/official",
    title: "Official Links — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Official Links — The Starhwa Encyclopedia",
    description,
  },
};

export default function OfficialPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">Direct From The Source</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">Official Links</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-charcoal/85">
        This archive exists to document and contextualize — not to replace
        official channels. Every source below leads directly to content
        published by Seonghwa, ATEEZ, or KQ Entertainment.
      </p>

      <div className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {officialLinks.map((link) => (
          <a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between gap-10 bg-ivory p-8 transition-colors hover:bg-ink"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="font-display text-2xl group-hover:text-ivory">
                {link.platform}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span aria-hidden="true" className="meta shrink-0 text-charcoal/40 group-hover:text-ivory/60">
                ↗
              </span>
            </div>
            <div>
              <p className="eyebrow text-plum group-hover:text-plum-tint">
                {link.handle}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/75 group-hover:text-ivory/75">
                {link.note}
              </p>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="max-w-2xl text-xs leading-relaxed text-charcoal/85">
          Handles and links are maintained on a best-effort basis and may
          change without notice. If you notice an outdated or incorrect
          link, it will be corrected as this archive is updated.
        </p>
      </div>
    </div>
  );
}
