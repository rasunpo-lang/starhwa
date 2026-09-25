import { Entry, Source } from "@/lib/types";

/**
 * The Tours page (`src/app/tours/page.tsx`) shows one row per world-tour
 * concert date — a narrower, uniform slice of the `"Tours"` category,
 * scoped to entries tagged `"concert"` (excludes individual promo photos
 * and personal tour-update posts filed under the same category, which
 * don't represent a single show/venue).
 */
export interface TourRow {
  entry: Entry;
  /** The tour name, plus any night/leg qualifier — e.g. "World Tour
   * [IN YOUR FANTASY]" or "World Tour [...] — Anchor (Night 1)". */
  tourEvent: string;
  /** The city/region for this date, exactly as recorded in the entry's
   * own title — e.g. "Mexico City", "Seoul", "USA Leg". */
  location: string;
  /** Only ever a qualifying source (see `qualifyingSourceUrl` below) —
   * never a KQ platform link, and never present just because *some*
   * source exists. */
  sourceUrl?: string;
}

export function isTourConcertEntry(entry: Entry): boolean {
  return entry.category === "Tours" && entry.tags.includes("concert");
}

/**
 * Every concert entry's title follows "World Tour [TOUR NAME] — <rest>",
 * where <rest> is a city ("Mexico City"), a city with a night/leg/anchor/
 * finale qualifier ("Berlin — night 1", "Japan (ANCHOR) — night 1", "Seoul
 * Finale (night 1)"), or a multi-city leg ("USA Leg"). This splits that
 * back into a clean event label (tour + qualifier, feeding the page's
 * "[Date] — [Tour / Event]" line) and a location (feeding "[Location]"),
 * verified against all 83 current concert-entry titles rather than
 * guessed — see the parsing notes in content/README.md if a new title
 * shape doesn't fit.
 */
export function parseTourTitle(title: string): { tourEvent: string; location: string } {
  const segments = title.split(" — ");
  const tourName = segments[0];
  const descriptor = segments.slice(1).join(" — ").trim();

  const nightMatch = descriptor.match(/night\s*(\d+)/i);
  const nightNum = nightMatch ? nightMatch[1] : null;
  const isAnchor = /\(anchor\)/i.test(descriptor);
  const isFinale = /\bfinale\b/i.test(descriptor);

  const location = descriptor
    .replace(/\(anchor\)/i, "")
    .replace(/\bfinale\b/i, "")
    .replace(/—\s*night\s*\d+/i, "")
    .replace(/\(\s*night\s*\d+\s*\)/i, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*—\s*$/, "")
    .trim();

  let qualifier = "";
  if (isAnchor) qualifier = "Anchor";
  else if (isFinale) qualifier = "Finale";

  let tourEvent = tourName;
  if (qualifier) tourEvent += ` — ${qualifier}`;
  if (nightNum) tourEvent += ` (Night ${nightNum})`;

  return { tourEvent, location };
}

const QUALIFYING_HANDLES = new Set(["ateezofficial", "ateezofficialjp"]);
const X_HOSTS = new Set(["x.com", "twitter.com"]);
const YOUTUBE_HOSTS = new Set(["youtube.com", "youtu.be"]);

/**
 * The Tours page's permanent source-link rule (content/README.md "Tour/
 * concert entry sourcing"): "View source" may point ONLY to official
 * ATEEZ content for that specific show — an official #TODAY_ATEEZ post
 * or a confirmed venue photo from @ateezofficial/@ateezofficialjp on X,
 * or an official ATEEZ YouTube video/short about that specific show —
 * never a KQ platform link, a fan repost, a venue/promoter account, or
 * any other outlet (Dispatch, Facebook, etc.).
 *
 * A source counts as qualifying either way:
 *
 * 1. It's explicitly marked `qualifiesForTourSource: true` in its own
 *    frontmatter — set by hand only after actually reading/confirming
 *    the post (never inferred), the moment a new concert entry is
 *    authored. This is the ONLY signal for a YouTube source (there's no
 *    reliable way to confirm "official ATEEZ channel" from a
 *    youtube.com/youtu.be URL alone — no handle in the URL path the way
 *    an X profile has one), and the authoritative signal for X sources
 *    too, going forward.
 * 2. X sources only, as a fallback for entries authored before the flag
 *    existed: the source is from @ateezofficial/@ateezofficialjp AND its
 *    label already contains "TODAY ATEEZ" / "#TODAY_ATEEZ" text, which
 *    the source-link standing rule already required curating
 *    accurately. Deliberately narrow — a handful of other
 *    @ateezofficial(jp) X posts exist (tour posters, a pre-show
 *    greeting, an announcement) that are NOT day-of venue content and
 *    must stay unlinked; this fallback only catches the one phrase
 *    that's reliably meant "this is the day-of post." No equivalent
 *    fallback exists for YouTube — path 1 is required there.
 */
export function qualifyingSourceUrl(sources: Source[]): string | undefined {
  for (const source of sources) {
    let url: URL;
    try {
      url = new URL(source.url);
    } catch {
      continue;
    }
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (YOUTUBE_HOSTS.has(host)) {
      if (source.qualifiesForTourSource) return source.url;
      continue;
    }

    if (!X_HOSTS.has(host)) continue;

    const handle = url.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    if (!handle || !QUALIFYING_HANDLES.has(handle)) continue;

    if (source.qualifiesForTourSource || /today[_\s]?ateez/i.test(source.label)) {
      return source.url;
    }
  }
  return undefined;
}

export function getTourRows(entries: Entry[]): TourRow[] {
  return entries.filter(isTourConcertEntry).map((entry) => {
    const { tourEvent, location } = parseTourTitle(entry.title);
    return {
      entry,
      tourEvent,
      location,
      sourceUrl: qualifyingSourceUrl(entry.sources),
    };
  });
}
