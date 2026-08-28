import { Entry } from "@/lib/types";

/**
 * The single rule for how an entry links, shared by every card variant
 * (EntryCard, StandardEntry, MediaEntry, FeatureEntry, CompactGroup) so
 * none of them re-implement it differently:
 *
 * - The entry itself is Starhwa's own encyclopedia content (our title,
 *   summary, category, tags) — its card always navigates internally to
 *   `/archive/[slug]`, regardless of how many sources it cites. This
 *   keeps every card's primary click behavior identical and keeps the
 *   visitor's browsing/filter context intact (no surprise tab-jump to
 *   an external site just because an entry happens to cite only one
 *   source).
 * - A `source` is original material published elsewhere (Dispatch,
 *   YouTube, X, Instagram, the official KQ platform, etc.) — it's never
 *   routed through an internal page first; it always links straight out,
 *   in a new tab, clearly marked as external.
 */
export function entryHref(entry: Entry): string {
  return `/archive/${entry.slug}`;
}

/** When an entry cites exactly one source, cards offer it as a direct,
 * clearly-external shortcut alongside the (always-internal) card link —
 * skipping straight to the entry page just to click through again would
 * be an unnecessary intermediary hop. With multiple sources there's no
 * single unambiguous shortcut, so none is offered here; all of them are
 * listed on the entry page itself. */
export function singleSourceUrl(entry: Entry): string | undefined {
  return entry.sources.length === 1 ? entry.sources[0].url : undefined;
}

/** Shared attributes for any link that leaves the site — new tab, no
 * opener leakage, and a screen-reader note alongside the visual ↗ used
 * throughout (never rely on the arrow alone to convey it). */
export const externalLinkProps = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export function formatEntryDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "2-digit", year: "numeric" }
  );
}
