import { Entry, EntryImage, ImageType } from "./types";
import { findEmbeddableVideo } from "./video";

export type EntryVariant = "feature" | "media" | "standard" | "compact";

export interface PlannedEntry {
  entry: Entry;
  variant: EntryVariant;
  thumbnailUrl: string | null;
  thumbnailType: ImageType;
}

export type PlanRow =
  | { kind: "divider"; year: number; count: number }
  | { kind: "entry"; item: PlannedEntry }
  | { kind: "compact-group"; items: PlannedEntry[] };

/**
 * The one gate every public image display in the app must go through —
 * a card thumbnail, an entry-page hero, an OG/Twitter meta image, or a
 * homepage feature. An entry's curated `image` is only ever surfaced
 * when its source has explicitly confirmed external sharing is allowed
 * (`sharePermission === "permitted"`); "unknown" (the default for any
 * image that doesn't set this) and "prohibited" both return null here.
 * See content/README.md "Image sourcing & permission" — call this
 * instead of reading `entry.image` directly anywhere the result will be
 * rendered, linked, or embedded in metadata.
 */
export function publicImage(entry: Entry): EntryImage | null {
  return entry.image && entry.image.sharePermission === "permitted" ? entry.image : null;
}

/**
 * The entry's editorially curated image if one is set and safe to show
 * (see publicImage() above; content/README.md "Image selection" — never
 * attached mechanically), otherwise a YouTube thumbnail derived
 * automatically from an embeddable video source. hqdefault is used
 * because it's a reliable size present for essentially every upload,
 * unlike maxresdefault, which 404s for older or low-view videos. A
 * curated image always takes priority over the auto-derived video-frame
 * thumbnail for this still-image slot.
 */
export function imageFor(entry: Entry): { url: string; type: ImageType } | null {
  const curated = publicImage(entry);
  if (curated) return { url: curated.url, type: curated.type };
  const video = findEmbeddableVideo(entry.sources);
  return video
    ? { url: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`, type: "photo" }
    : null;
}

function richnessOf(entry: Entry, thumbnailUrl: string | null): number {
  let score = 0;
  if (thumbnailUrl) score += 2;
  if (entry.sources.length > 1) score += 1;
  if (entry.summary.length > 260) score += 1;
  return score;
}

/**
 * Turns a flat, date-sorted entry list into a heterogeneous editorial
 * layout: year dividers give the archive a chronological spine; within
 * each year, the single richest entry (image + multiple sources + a real
 * summary) becomes a full-width feature, entries with video become
 * medium image-led cards, entries with a substantive summary but no
 * image become text-led standard cards, and everything else — the
 * terse, single-schedule-link entries that make up most of the catalog —
 * collapses into a dense, scannable list block instead of an empty-looking
 * card. Recomputed from whatever slice of entries is passed in, so it
 * adapts automatically to any filter combination.
 */
export function planEntryLayout(entries: Entry[]): PlanRow[] {
  const byYear = new Map<number, Entry[]>();
  for (const entry of entries) {
    const list = byYear.get(entry.year) ?? [];
    list.push(entry);
    byYear.set(entry.year, list);
  }

  const years = [...byYear.keys()].sort((a, b) => b - a);
  const rows: PlanRow[] = [];

  for (const year of years) {
    const yearEntries = byYear.get(year)!;
    rows.push({ kind: "divider", year, count: yearEntries.length });

    const planned = yearEntries.map((entry) => {
      const image = imageFor(entry);
      const thumbnailUrl = image?.url ?? null;
      return {
        entry,
        thumbnailUrl,
        thumbnailType: image?.type ?? ("photo" as ImageType),
        richness: richnessOf(entry, thumbnailUrl),
      };
    });

    let featuredSlug: string | null = null;
    if (yearEntries.length >= 4) {
      const best = planned.reduce((a, b) => (b.richness > a.richness ? b : a));
      if (best.richness >= 3) featuredSlug = best.entry.slug;
    }

    let compactBuffer: PlannedEntry[] = [];
    const flushCompact = () => {
      if (compactBuffer.length === 0) return;
      if (compactBuffer.length === 1) {
        rows.push({ kind: "entry", item: { ...compactBuffer[0], variant: "standard" } });
      } else {
        rows.push({ kind: "compact-group", items: compactBuffer });
      }
      compactBuffer = [];
    };

    for (const p of planned) {
      // "media" requires an actual thumbnail — richness alone (e.g. two
      // sources plus a long summary, with no video) can reach the same
      // score without an image to show, and must fall through to the
      // text-led "standard" treatment instead of an empty image box.
      let variant: EntryVariant;
      if (p.entry.slug === featuredSlug) variant = "feature";
      else if (p.thumbnailUrl) variant = "media";
      else if (p.richness >= 1) variant = "standard";
      else variant = "compact";

      if (variant === "compact") {
        compactBuffer.push({
          entry: p.entry,
          variant,
          thumbnailUrl: p.thumbnailUrl,
          thumbnailType: p.thumbnailType,
        });
        continue;
      }
      flushCompact();
      rows.push({
        kind: "entry",
        item: {
          entry: p.entry,
          variant,
          thumbnailUrl: p.thumbnailUrl,
          thumbnailType: p.thumbnailType,
        },
      });
    }
    flushCompact();
  }

  return rows;
}
