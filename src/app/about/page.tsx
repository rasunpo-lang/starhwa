import Link from "next/link";
import type { Metadata } from "next";

const description =
  "About The Starhwa Encyclopedia, an unofficial fan-created archive documenting Park Seonghwa of ATEEZ.";

export const metadata: Metadata = {
  title: "About",
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    title: "About — The Starhwa Encyclopedia",
    description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About — The Starhwa Encyclopedia",
    description,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">About This Project</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">
        The Starhwa Encyclopedia
      </h1>

      <div className="mt-10 space-y-6 text-base leading-relaxed text-charcoal/90">
        <p>
          THE STARHWA is an independent, fan-created archive documenting
          the public work of Park Seonghwa, a member of ATEEZ, from the
          group&apos;s debut on October 24, 2018 to the present. It brings
          together information scattered across posts, videos, interviews,
          broadcasts, and other public sources into a structured,
          searchable reference.
        </p>
        <p>
          Entries are based on original research and linked to their
          original sources wherever possible. The archive focuses on
          context, chronology, and continuity rather than reproducing
          copyrighted material.
        </p>
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <h2 className="font-display text-2xl">What This Archive Does</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-charcoal/85">
          <li>— Documents dates, categories, and original descriptions of public appearances and releases.</li>
          <li>— Organizes activity by era, year, and category for easy browsing and reference.</li>
          <li>— Links to official sources rather than rehosting photos, video, or audio.</li>
          <li>— Evolves through ongoing corrections, additions, and updates.</li>
        </ul>
      </div>

      <div className="mt-12 border-t border-line pt-10">
        <h2 className="font-display text-2xl">Copyright &amp; Disclaimer</h2>
        <p className="mt-5 text-sm leading-relaxed text-charcoal/85">
          THE STARHWA is an unofficial, fan-created project. It is not
          affiliated with, endorsed by, or connected to Park Seonghwa,
          ATEEZ, KQ Entertainment, or any associated rights holders.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
          Referenced photographs, videos, audio, articles, and other
          materials belong to their respective owners. Where possible, THE
          STARHWA links to original sources rather than reproducing or
          rehosting that material. The archive&apos;s original research,
          descriptions, organization, and database structure are created
          and maintained for this project.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-charcoal/85">
          If a rights holder has a concern about a source, link, or
          description, please contact us so it can be reviewed and
          addressed promptly.
        </p>
      </div>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link href="/chronology" className="btn btn-primary">
          Explore the Chronology
        </Link>
        <Link href="/official" className="btn btn-secondary">
          Official Links
        </Link>
      </div>
    </div>
  );
}
