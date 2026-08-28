import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EntryCard from "@/components/EntryCard";
import VideoEmbed from "@/components/VideoEmbed";
import Glint from "@/components/Glint";
import { getAllEntriesSorted, getEntryBySlug, getRelatedEntries } from "@/data/entries";
import { getEra } from "@/data/eras";
import { findEmbeddableVideo } from "@/lib/video";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateStaticParams() {
  return getAllEntriesSorted().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) {
    return { title: "Entry Not Found", robots: { index: false, follow: true } };
  }

  const url = `/archive/${entry.slug}`;
  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: entry.title,
      description: entry.summary,
      publishedTime: entry.date,
      section: entry.category,
      tags: entry.tags,
      // A page-level openGraph object replaces (rather than merges with)
      // the root opengraph-image.tsx fallback, so entries without a
      // curated image need an explicit reference back to it.
      images: entry.image ? [{ url: entry.image.url }] : ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.summary,
    },
  };
}

export default async function EntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntryBySlug(slug);
  if (!entry) notFound();

  const era = getEra(entry.eraId);
  const related = getRelatedEntries(entry);
  const embeddableVideo = findEmbeddableVideo(entry.sources);
  // A quiet "you've arrived somewhere notable" beat — only for entries with
  // a genuine hero visual (video or curated image), so it stays rare
  // rather than firing on every terse, sourceless-thumbnail entry.
  const hasHero = Boolean(embeddableVideo || entry.image);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.date,
    articleSection: entry.category,
    url: `https://starhwa.com/archive/${entry.slug}`,
    isAccessibleForFree: true,
    about: { "@type": "Person", name: "Park Seonghwa" },
    author: {
      "@type": "Organization",
      name: "The Starhwa Encyclopedia",
      url: "https://starhwa.com",
    },
    ...(entry.image ? { image: [entry.image.url] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Our own vetted entry data only, never user input — escaping "<"
        // is standard defensive practice against a "</script>" breakout.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2 text-charcoal/75">
        <Link href="/archive" className="hover:text-plum">
          Archive
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/archive?category=${encodeURIComponent(entry.category)}`} className="hover:text-plum">
          {entry.category}
        </Link>
      </nav>

      <div className="eyebrow mt-8 flex flex-wrap items-center justify-between gap-2 text-charcoal/75">
        <span>{entry.id}</span>
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p className="eyebrow text-plum">
          {hasHero && <span aria-hidden="true">✦ </span>}
          {entry.category} {era ? `· ${era.name}` : ""}
        </p>
        {entry.verification === "unverified" && (
          <span className="meta border border-line px-2 py-0.5 text-charcoal/75">
            Unverified
          </span>
        )}
      </div>

      <h1 className="relative mt-3 font-display text-4xl leading-tight sm:text-5xl">
        {hasHero && (
          <>
            <Glint className="glint-burst -right-2 top-0 sm:right-0" />
            <Glint
              className="glint-burst right-10 top-10 sm:right-16"
              style={{ animationDelay: "140ms" }}
            />
            <Glint
              className="glint-burst left-1/3 -top-3"
              style={{ animationDelay: "260ms" }}
            />
          </>
        )}
        {entry.title}
      </h1>

      {embeddableVideo ? (
        <div className="mt-8">
          <VideoEmbed videoId={embeddableVideo.videoId} title={entry.title} />
          <p className="meta mt-2 text-charcoal/75">
            {embeddableVideo.source.label}
          </p>
        </div>
      ) : (
        entry.image && (
          <div className="mt-8">
            <div
              className={`relative aspect-video overflow-hidden border border-line ${
                entry.image.type === "product" ? "bg-ivory-dim" : "bg-ink"
              }`}
            >
              <Image
                src={entry.image.url}
                alt=""
                fill
                sizes="(min-width: 640px) 768px, 100vw"
                className={`object-contain ${
                  entry.image.type === "product" ? "p-8" : ""
                }`}
              />
            </div>
            <p className="meta mt-2 text-charcoal/75">{entry.image.credit}</p>
          </div>
        )
      )}

      <div className="mt-10 border-t border-line pt-8">
        {entry.summary.split("\n\n").map((para, i) => {
          const isSectionLabel = para.length < 80 && para.endsWith("Translation");
          return isSectionLabel ? (
            <p key={i} className="eyebrow mt-10 text-plum first:mt-0">
              {para}
            </p>
          ) : (
            <p
              key={i}
              className="mt-4 text-lg leading-relaxed text-charcoal/90 first:mt-0"
            >
              {para}
            </p>
          );
        })}
      </div>

      {entry.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="meta border border-line px-3 py-1 text-charcoal/75"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-line pt-8">
        <p className="eyebrow text-charcoal/75">Official Sources</p>
        <ul className="mt-4 space-y-3">
          {entry.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 border border-line px-5 py-4 transition-colors hover:border-plum"
              >
                <span className="font-display text-lg">
                  {source.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
                <span className="meta shrink-0 text-charcoal/75 group-hover:text-plum">
                  Visit original ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-charcoal/75">
          This archive links to original official sources rather than
          rehosting media. All photography, video, and audio remain the
          property of their respective rights holders.
        </p>
      </div>

      {era && (
        <div className="mt-12 border-t border-line pt-8">
          <p className="eyebrow text-charcoal/75">Era Context</p>
          <p className="mt-3 font-display text-xl">{era.name} · {era.years}</p>
          <p className="mt-2 text-sm leading-relaxed text-charcoal/80">
            {era.summary}
          </p>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16 border-t border-line pt-10">
          <p className="eyebrow text-charcoal/75">Related Entries</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {related.map((r) => (
              <EntryCard key={r.id} entry={r} />
            ))}
          </div>
        </div>
      )}
      </article>
    </>
  );
}
