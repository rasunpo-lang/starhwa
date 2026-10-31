import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EntryCard from "@/components/EntryCard";
import VideoEmbed from "@/components/VideoEmbed";
import XEmbed from "@/components/XEmbed";
import Glint from "@/components/Glint";
import { getAllEntriesSorted, getEntryBySlug, getNextMemory, getRelatedEntries } from "@/data/entries";
import { getEra } from "@/data/eras";
import { findEmbeddableVideo } from "@/lib/video";
import { findEmbeddableXPost } from "@/lib/xPost";
import { publicImage } from "@/lib/layout";
import { planSourceLinks, type SourceLinkPlan } from "@/lib/sourceLink";

// Shared by the summary and the optional collapsed full-text section below
// it, so both render paragraph breaks and the "ends with Translation"
// section-label heuristic identically.
function renderParagraphs(
  text: string,
  inline?: Extract<SourceLinkPlan, { kind: "inline" }>
) {
  return text.split("\n\n").map((para, i) => {
    const isSectionLabel = para.length < 80 && para.endsWith("Translation");
    if (isSectionLabel) {
      return (
        <p key={i} className="eyebrow mt-10 text-plum first:mt-0">
          {para}
        </p>
      );
    }
    return (
      <p
        key={i}
        className="mt-4 text-lg leading-relaxed text-charcoal/90 first:mt-0"
      >
        {inline && inline.paragraph === i ? (
          <>
            {para.slice(0, inline.start)}
            <a
              href={inline.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-plum/40 underline-offset-4 transition-colors hover:text-plum hover:decoration-plum"
            >
              {para.slice(inline.start, inline.end)}
              <span className="sr-only"> (opens source in a new tab)</span>
            </a>
            {para.slice(inline.end)}
          </>
        ) : (
          para
        )}
      </p>
    );
  });
}

// Tags that restate the era link, the category, or the source attribution
// already on the page. They stay in the data and in search.
const REDUNDANT_TAGS = new Set(["individual content", "official youtube", "youtube short"]);
function visibleTags(tags: string[], category: string) {
  const norm = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/s$/, "");
  return tags.filter(
    (t) => !/ era$/i.test(t) && !REDUNDANT_TAGS.has(t.toLowerCase()) && norm(t) !== norm(category)
  );
}

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Every valid path is pre-rendered by generateStaticParams below; anything
// else is a real HTTP 404 (not a streamed "not found" UI with a 200 status).
export const dynamicParams = false;

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
  const heroImage = publicImage(entry);
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
      // curated (and share-permitted — see publicImage()) image need an
      // explicit reference back to it.
      images: heroImage ? [{ url: heroImage.url }] : ["/opengraph-image"],
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
  const nextMemory = getNextMemory(entry);
  // The "One more memory" pick may itself come from `related`; don't show
  // the same entry twice.
  const related = getRelatedEntries(entry).filter((r) => r.slug !== nextMemory?.entry.slug);
  const embeddableVideo = findEmbeddableVideo(entry.sources);
  // An X post is embedded only when the entry has no video player already —
  // never two players, and the original source link is always still listed.
  // Social Media entries embed their first official ATEEZ X post (one per entry);
  // every other category (Music included) embeds only a source an author
  // explicitly marked `embed: true`.
  const flaggedXPost = embeddableVideo
    ? null
    : findEmbeddableXPost(entry.sources.filter((s) => s.embed));
  const embeddableXPost =
    flaggedXPost ??
    (embeddableVideo || entry.category !== "Social Media"
      ? null
      : findEmbeddableXPost(
          entry.sources.filter((s) => /^https?:\/\/(www\.)?(x|twitter)\.com\/ateezofficial(jp)?\//i.test(s.url))
        ));
  const heroImage = publicImage(entry);
  // A quiet "you've arrived somewhere notable" beat — only for entries with
  // a genuine hero visual (video or curated, share-permitted image), so it
  // stays rare rather than firing on every terse, sourceless-thumbnail entry.
  const hasHero = Boolean(embeddableVideo || heroImage);
  const sourcePlan = planSourceLinks(entry.summary, entry.sources);
  const soleSource = sourcePlan.kind === "line" ? sourcePlan.source : null;
  const tags = visibleTags(entry.tags, entry.category);

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
    ...(heroImage ? { image: [heroImage.url] } : {}),
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

      <div className="eyebrow mt-8 flex flex-wrap items-center justify-end gap-2 text-charcoal/75">
        <time dateTime={entry.date}>{formatDate(entry.date)}</time>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {(hasHero || era) && (
          <p className="eyebrow text-plum">
            {hasHero && <span aria-hidden="true">✦ </span>}
            {era?.name}
          </p>
        )}
      </div>

      <h1 className="relative mt-3 font-display text-4xl leading-tight [overflow-wrap:anywhere] sm:text-5xl">
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
        </div>
      ) : (
        heroImage && (
          <div className="mt-8">
            <div
              className={`relative aspect-video overflow-hidden border border-line ${
                heroImage.type === "product"
                  ? "bg-ivory-dim photo-plane"
                  : "bg-ink photo-plane photo-plane-lit"
              }`}
            >
              <Image
                src={heroImage.url}
                alt=""
                fill
                sizes="(min-width: 640px) 768px, 100vw"
                className={`object-contain ${
                  heroImage.type === "product" ? "p-8" : ""
                }`}
              />
            </div>
            <p className="meta mt-2 text-charcoal/75">{heroImage.credit}</p>
          </div>
        )
      )}

      {embeddableXPost && (
        <div className="mt-8">
          <XEmbed url={embeddableXPost.post.url} label={embeddableXPost.source.label} />
        </div>
      )}

      <div className="mt-10 border-t border-line pt-8">
        {renderParagraphs(entry.summary, sourcePlan.kind === "inline" ? sourcePlan : undefined)}
      </div>

      {soleSource && (
        <p className="mt-4 text-sm leading-relaxed text-charcoal/75">
          <a
            href={soleSource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line underline-offset-4 transition-colors hover:text-plum hover:decoration-plum"
          >
            {soleSource.label} <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      )}

      {entry.fullText && (
        <div className="mt-8 border-t border-line pt-8">
          {renderParagraphs(entry.fullText)}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="meta border border-line px-3 py-1 text-charcoal/75"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {sourcePlan.kind === "list" && (
        <div className="mt-10 border-t border-line pt-6">
          <p className="eyebrow text-charcoal/75">Sources</p>
          <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-charcoal/80">
            {sourcePlan.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-line underline-offset-4 transition-colors hover:text-plum hover:decoration-plum [overflow-wrap:anywhere]"
                >
                  {source.label} <span aria-hidden="true">↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {era && (
        <p className="meta mt-10 text-charcoal/75">
          <Link href={`/chronology#${era.id}`} className="underline decoration-line underline-offset-4 hover:text-plum">
            {era.name} · {era.years} →
          </Link>
        </p>
      )}

      {nextMemory && (
        <div className="mt-16 border-t border-line pt-10">
          <Link
            href={`/archive/${nextMemory.entry.slug}`}
            className="glint-hover group relative block border-l-2 border-plum/50 pl-6 sm:pl-8"
          >
            <Glint className="-left-2 top-0" />
            <p className="eyebrow text-charcoal/75">One More Memory</p>
            <p className="meta mt-4 text-plum">
              {nextMemory.entry.category} · {formatDate(nextMemory.entry.date)}
            </p>
            <p className="mt-2 font-display text-2xl leading-snug transition-colors group-hover:text-plum [overflow-wrap:anywhere]">
              {nextMemory.entry.title}
            </p>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-charcoal/80">
              {nextMemory.entry.summary}
            </p>
            {nextMemory.reason && (
              <p className="meta mt-3 text-charcoal/75">{nextMemory.reason}</p>
            )}
            <span className="meta mt-4 inline-block text-ink underline decoration-line underline-offset-4 group-hover:text-plum">
              Read this entry →
            </span>
          </Link>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-12 border-t border-line pt-10">
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
