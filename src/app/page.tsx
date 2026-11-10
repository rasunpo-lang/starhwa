import Link from "next/link";
import Image from "next/image";
import EntryGrid from "@/components/entry-grid/EntryGrid";
import Timeline from "@/components/Timeline";
import Glint from "@/components/Glint";
import FeaturedPortraitImage from "@/components/FeaturedPortraitImage";
import OnThisDay from "@/components/OnThisDay";
import { getAllEntriesSorted, getEntryBySlug, getOnThisDayByKey, monthDayKey } from "@/data/entries";
import { eras } from "@/data/eras";
import { officialLinks } from "@/data/officialLinks";
import { imageFor, publicImage } from "@/lib/layout";
import { Entry } from "@/lib/types";

/** An entry's own editorially curated image only — never the auto-
 * derived YouTube thumbnail `imageFor()` falls back to, and never one
 * whose source hasn't explicitly confirmed external sharing is allowed
 * (see publicImage() in lib/layout.ts). Featured Era's image is built
 * around real, safe-to-show editorial photography specifically; a
 * video-frame grab with a baked-in caption doesn't belong at that
 * scale, however useful it is as a small card thumbnail elsewhere on
 * the site. */
function curatedPhoto(entry: Entry) {
  const image = publicImage(entry);
  return image ? { entry, url: image.url, type: image.type, credit: image.credit } : null;
}

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Starhwa Encyclopedia",
  url: "https://starhwa.com",
  description:
    "An unofficial fan-maintained archive documenting Park Seonghwa of ATEEZ, from the 2018 debut onward.",
};

export default function Home() {
  const today = new Date();
  // The server doesn't know the visitor's timezone, so "On This Day" gets
  // its own (server) date as the starting point plus ±2 days — enough to
  // cover any visitor's local date — and OnThisDay picks the right one.
  const dayKeys = [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    return monthDayKey(d.getMonth(), d.getDate());
  });
  const onThisDayByKey = getOnThisDayByKey(dayKeys);
  const allEntries = getAllEntriesSorted();
  const latest = allEntries.slice(0, 4);

  const featuredEra = eras[eras.length - 1];
  const featuredEraEntries = allEntries.filter((e) => e.eraId === featuredEra.id);

  // The era's own richest curated photo, if it has one yet; otherwise
  // the same imageFor()-based fallback (curated image or auto-derived
  // thumbnail) every other card on the site already uses, so the
  // section still has something to show for a newly-started era.
  const featuredCurated = featuredEraEntries.map(curatedPhoto).find((v) => v !== null) ?? null;
  const featuredVisual =
    featuredCurated ??
    (featuredEraEntries
      .map((entry) => {
        const image = imageFor(entry);
        return image ? { entry, url: image.url, type: image.type, credit: undefined } : null;
      })
      .find((v) => v !== null) ??
      null);

  const featuredListEntries = featuredEraEntries
    .filter((e) => e.id !== featuredVisual?.entry.id)
    .slice(0, 4);

  // Featured Era's existing photo slot, made day/night-reactive for
  // exactly this one pair of curated entries (both already resolved
  // through the same publicImage() gate as featuredVisual itself) —
  // everything else about the slot (aspect box, classes, credit
  // placement) stays exactly as it already is; only whether the day or
  // night entry's own image/credit is what `featuredVisual` currently
  // points to determines whether this reactive swap applies at all. Any
  // other era, or either entry losing permission, falls straight back to
  // the plain <Image> below, unchanged.
  const dayPortraitEntry = getEntryBySlug("ateez-aniteez-color-concept-seonghwa-2026");
  const nightPortraitEntry = getEntryBySlug("skin-foratiny-photos-2026");
  const dayPortraitImage = dayPortraitEntry ? publicImage(dayPortraitEntry) : null;
  const nightPortraitImage = nightPortraitEntry ? publicImage(nightPortraitEntry) : null;
  const featuredIsDayNightPair =
    dayPortraitImage !== null &&
    nightPortraitImage !== null &&
    (featuredVisual?.entry.slug === dayPortraitEntry?.slug || featuredVisual?.entry.slug === nightPortraitEntry?.slug);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero — the opening statement */}
      <section className="hero-legible border-b border-line">
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:py-32">
          <div className="hero-veil hero-veil--copy">
            <p className="eyebrow text-plum">
              Park Seonghwa · ATEEZ · 2018—
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,6vw_+_1.5rem,5.75rem)] leading-[0.93] tracking-tight">
              The Starhwa
              <br />
              Encyclopedia
            </h1>
            <p className="mt-7 max-w-md text-base leading-relaxed text-charcoal/85">
              Seonghwa&apos;s stages, interviews, and quiet posts, in the order
              they happened, from the debut showcase on October 24, 2018.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link href="/chronology" className="glint-hover btn btn-primary relative">
                <Glint className="right-1 top-1" />
                Enter the Chronology
              </Link>
              <Link
                href="/archive"
                className="eyebrow text-charcoal/85 underline decoration-line underline-offset-4 hover:text-plum"
              >
                Browse the Archive →
              </Link>
            </div>
          </div>

          <OnThisDay serverKey={dayKeys[2]} days={onThisDayByKey} />
        </div>
      </section>

      {/* How the record is kept — a quiet editorial beat, directly
          against the sky. Not a metric, and not an explanation of the
          archive's methodology — a single observation about what an
          archive actually does with an ephemeral moment, sitting quietly
          before the Chronology below shows it in practice. */}
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1400px]">
          <p className="eyebrow text-plum">How This Record Is Kept</p>
          <p className="mt-4 max-w-3xl font-display text-[clamp(1.75rem,3vw_+_1rem,3rem)] leading-[1.15] tracking-tight">
            It happened once. Here, it happens again.
          </p>
        </div>
      </section>

      {/* Timeline — compact information */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <p className="eyebrow text-charcoal/85">2018 — Present</p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl">
            The Chronology at a Glance
          </h2>
          <div className="mt-10">
            <Timeline now={today.getTime()} />
          </div>
        </div>
      </section>

      {/* Featured era — the visual-impact moment */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20 lg:py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4 lg:mb-16">
            <div>
              <p className="eyebrow text-plum">
                <span aria-hidden="true">✦ </span>Featured Era
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,5vw_+_1rem,4.25rem)] leading-[0.95] tracking-tight">
                {featuredEra.name}
              </h2>
              <p className="eyebrow mt-2 text-charcoal/75">{featuredEra.years}</p>
            </div>
            <Link
              href={`/chronology#${featuredEra.id}`}
              className="eyebrow text-ink underline decoration-line underline-offset-4 hover:text-plum"
            >
              View full era in Chronology →
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
            {featuredVisual && (
              <figure className="lg:col-span-8">
                {/* Portrait-first aspect — both curated photos this era
                    has so far are tall editorial portraits, and cropping
                    a portrait into a wide 16:10 box (the old assumption,
                    built for a landscape video-thumbnail fallback) cut
                    off exactly the composition the photo was shot for.
                    No gradient overlay: nothing is written on top of the
                    image here, so the overlay the shared FeatureEntry
                    component uses for on-image text had no job to do.
                    object-position is nudged up from dead-center: the
                    source photo carries a lot of empty black headroom
                    above the face, so a mechanical center-crop wastes
                    this section's largest visual moment on negative
                    space instead of the portrait itself. */}
                {featuredIsDayNightPair && dayPortraitImage && nightPortraitImage ? (
                  <FeaturedPortraitImage
                    day={{ url: dayPortraitImage.url, credit: dayPortraitImage.credit }}
                    night={{ url: nightPortraitImage.url, credit: nightPortraitImage.credit }}
                    containerClassName={`relative aspect-[4/5] w-full overflow-hidden ${
                      featuredVisual.type === "product"
                        ? "bg-ivory-dim photo-plane"
                        : "bg-ink photo-plane photo-plane-lit"
                    }`}
                    imageClassName={
                      featuredVisual.type === "product"
                        ? "object-contain p-8"
                        : "object-cover object-[center_25%]"
                    }
                    sizes="(min-width: 1024px) 66vw, 100vw"
                  />
                ) : (
                  <>
                    <div
                      className={`relative aspect-[4/5] w-full overflow-hidden ${
                        featuredVisual.type === "product"
                          ? "bg-ivory-dim photo-plane"
                          : "bg-ink photo-plane photo-plane-lit"
                      }`}
                    >
                      <Image
                        src={featuredVisual.url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className={
                          featuredVisual.type === "product"
                            ? "object-contain p-8"
                            : "object-cover object-[center_25%]"
                        }
                      />
                    </div>
                    {featuredVisual.credit && (
                      <figcaption className="meta mt-3 text-charcoal/60">{featuredVisual.credit}</figcaption>
                    )}
                  </>
                )}
              </figure>
            )}

            <div className={featuredVisual ? "lg:col-span-4" : "lg:col-span-9"}>
              <p className="max-w-lg text-base leading-relaxed text-charcoal/85">
                {featuredEra.summary}
              </p>
              {featuredListEntries.length > 0 && (
                <ul className="mt-8 space-y-5 border-t border-line pt-6">
                  {featuredListEntries.map((entry) => (
                    <li key={entry.id}>
                      <Link href={`/archive/${entry.slug}`} className="group block">
                        <span className="meta text-plum">
                          {entry.category} · {formatDate(entry.date)}
                        </span>
                        <span className="mt-1 block font-display text-lg leading-snug text-ink transition-colors group-hover:text-plum">
                          {entry.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest entries — information, quieter than the feature above */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-charcoal/85">Latest Additions</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                The Latest
              </h2>
            </div>
            <Link
              href="/archive"
              className="eyebrow text-ink underline decoration-line underline-offset-4 hover:text-plum"
            >
              View full archive →
            </Link>
          </div>
          <div className="mt-10">
            <EntryGrid entries={latest} showYearDividers={false} />
          </div>
        </div>
      </section>

      {/* Official links — a closing editorial index, not a button grid */}
      <section className="px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-charcoal/85">Direct From The Source</p>
              <h2 className="mt-2 font-display text-2xl sm:text-3xl">
                Official Channels
              </h2>
            </div>
            <Link
              href="/official"
              className="eyebrow text-ink underline decoration-line underline-offset-4 hover:text-plum"
            >
              All official links →
            </Link>
          </div>
          <div className="mt-12 grid border-t border-line sm:grid-cols-2 sm:gap-x-12">
            {officialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-4 border-b border-line py-6"
              >
                <span>
                  <span className="block font-display text-2xl transition-colors group-hover:text-plum">
                    {link.platform}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                  <span className="meta mt-2 block text-charcoal/70">{link.handle}</span>
                  <span className="mt-2 block max-w-sm text-sm leading-relaxed text-charcoal/75">
                    {link.note}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="meta mt-1 shrink-0 text-charcoal/60 transition-transform group-hover:translate-x-1 group-hover:text-plum"
                >
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
