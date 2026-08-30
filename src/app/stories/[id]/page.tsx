import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Glint from "@/components/Glint";
import { stories } from "@/data/stories";

function formatStoryDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStory(id: string) {
  return stories.find((s) => s.id === id);
}

export async function generateStaticParams() {
  return stories.map((s) => ({ id: s.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const story = getStory(id);
  if (!story) {
    return { title: "Story Not Found", robots: { index: false, follow: true } };
  }

  const url = `/stories/${story.id}`;
  return {
    title: story.title,
    description: story.snippet,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${story.title} — Seonghwa's Stories`,
      description: story.snippet,
      publishedTime: story.date,
      images: story.imageUrl ? [{ url: story.imageUrl }] : ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${story.title} — Seonghwa's Stories`,
      description: story.snippet,
    },
  };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2 text-charcoal/75">
        <Link href="/stories" className="hover:text-plum">
          Seonghwa&apos;s Stories
        </Link>
      </nav>

      <div className="eyebrow mt-8 flex flex-wrap items-center justify-between gap-2 text-charcoal/75">
        <time dateTime={story.date}>{formatStoryDate(story.date)}</time>
        {story.significant && (
          <span className="text-plum">
            <span aria-hidden="true">✦</span> A Little More Meaningful
          </span>
        )}
      </div>

      <h1 className="relative mt-3 font-display text-4xl leading-tight sm:text-5xl">
        {story.significant && <Glint className="glint-burst -right-2 top-0 sm:right-0" />}
        {story.title}
      </h1>

      <p className="mt-4 text-sm leading-relaxed text-charcoal/80">{story.snippet}</p>

      {story.imageUrl && (
        <div className="mt-8">
          <div className="relative aspect-square overflow-hidden border border-line bg-ink sm:aspect-video">
            <Image
              src={story.imageUrl}
              alt=""
              fill
              sizes="(min-width: 640px) 768px, 100vw"
              className="object-contain"
            />
          </div>
          <p className="meta mt-2 text-charcoal/75">ATEEZ Official Platform (KQ Entertainment)</p>
        </div>
      )}

      {story.translation && (
        <div className="mt-10 border-t border-line pt-8">
          <p className="eyebrow text-plum">In His Words — Translated</p>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/90">
            {story.translation}
          </p>
          {story.translationNote && (
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              {story.translationNote}
            </p>
          )}
        </div>
      )}

      {story.originalText && (
        <div className="mt-10 border border-line bg-ivory-dim p-6 sm:p-8">
          <p className="eyebrow text-charcoal/75">Original (Korean)</p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-charcoal/85">
            {story.originalText}
          </p>
        </div>
      )}

      {story.handwritten && (
        <div className="mt-10 border border-line bg-ivory-dim p-6 sm:p-8">
          <p className="eyebrow text-plum">Handwritten — Transcribed from the Image</p>
          <p className="meta mt-2 text-charcoal/70">
            Read from Seonghwa&apos;s own handwriting in the photo above, not text supplied by the platform.
          </p>
          <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-ink/90">
            {story.handwritten.translation}
          </p>
          <div className="mt-6 border-t border-line pt-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-charcoal/85">
              {story.handwritten.transcription}
            </p>
          </div>
          {story.handwritten.note && (
            <p className="mt-4 text-sm leading-relaxed text-charcoal/70">
              {story.handwritten.note}
            </p>
          )}
        </div>
      )}

      {story.themes.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {story.themes.map((theme) => (
            <span key={theme} className="meta border border-line px-3 py-1 text-charcoal/75">
              {theme}
            </span>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-line pt-8">
        <p className="eyebrow text-charcoal/75">Official Source</p>
        <a
          href={story.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-4 flex items-center justify-between gap-4 border border-line px-5 py-4 transition-colors hover:border-plum"
        >
          <span className="font-display text-lg">
            View on ATEEZ Official Platform
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
          <span className="meta shrink-0 text-charcoal/75 group-hover:text-plum">
            Visit original ↗
          </span>
        </a>
        <p className="mt-4 text-xs leading-relaxed text-charcoal/75">
          {story.translation &&
            "The translation above is original work by this archive's maintainers, kept as close as possible to Seonghwa's own wording and tone. "}
          The photo above (when present) and the original post remain the property of KQ
          Entertainment — linked to, not rehosted for its own sake.
        </p>
      </div>

      <div className="mt-12">
        <Link href="/stories" className="btn btn-secondary">
          ← Back to Seonghwa&apos;s Stories
        </Link>
      </div>
    </article>
  );
}
