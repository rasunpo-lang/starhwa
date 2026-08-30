export type Category =
  | "Music"
  | "Performances"
  | "Interviews"
  | "Fashion"
  | "Magazines"
  | "TV"
  | "Radio"
  | "Variety"
  | "Social Media"
  | "Awards"
  | "Tours"
  | "ANITEEZ"
  | "Official Content";

export const CATEGORIES: Category[] = [
  "Music",
  "Performances",
  "Interviews",
  "Fashion",
  "Magazines",
  "TV",
  "Radio",
  "Variety",
  "Social Media",
  "Awards",
  "Tours",
  "ANITEEZ",
  "Official Content",
];

export interface Era {
  id: string;
  name: string;
  years: string;
  startDate: string;
  endDate: string | null;
  summary: string;
}

export interface Source {
  label: string;
  url: string;
}

export type ImageType = "photo" | "product";

/**
 * An editorially curated visual anchor for an entry. Never auto-attached —
 * see content/README.md "Image selection." `url` must be a stable,
 * non-expiring official/licensed source (not a signed CDN link that will
 * rot, e.g. most Instagram/X image URLs).
 */
export interface EntryImage {
  url: string;
  credit: string;
  type: ImageType;
}

export type Verification = "verified" | "unverified";

/**
 * The catalog record for a single archive entry.
 *
 * `id`, `slug`, `year`, and `eraId` are never authored by hand — they're
 * derived from the entry's Markdown filename and date. See
 * content/README.md for the authoring workflow.
 */
export interface Entry {
  id: string;
  slug: string;
  date: string;
  year: number;
  eraId: string;
  category: Category;
  title: string;
  summary: string;
  tags: string[];
  sources: Source[];
  image?: EntryImage;
  verification: Verification;
  related: string[];
}

export interface OfficialLink {
  platform: string;
  handle: string;
  url: string;
  note: string;
}

/**
 * ✦ Seonghwa's Stories — themes used to classify his public Story/Star
 * posts. Descriptive of what he explicitly shared, not a claim about his
 * private feelings beyond that. See src/data/stories.ts.
 */
export type StoryTheme =
  | "Everyday Moments"
  | "Thoughts & Reflections"
  | "Food"
  | "Hobbies & Interests"
  | "Books, Movies & Music"
  | "Behind the Scenes"
  | "Messages to ATINY"
  | "Special Occasions"
  | "Travel"
  | "Emotional Moments";

export const STORY_THEMES: StoryTheme[] = [
  "Everyday Moments",
  "Thoughts & Reflections",
  "Food",
  "Hobbies & Interests",
  "Books, Movies & Music",
  "Behind the Scenes",
  "Messages to ATINY",
  "Special Occasions",
  "Travel",
  "Emotional Moments",
];

/**
 * A single public Story/Star post — a lighter, separate collection from
 * `Entry` above, deliberately outside `content/entries/`'s strict
 * verification/sources pipeline. `title`/`snippet` are original editorial
 * writing (a short paraphrase), never a verbatim reproduction of
 * Seonghwa's own words — `sourceUrl` always links to the real post.
 */
export interface Story {
  id: string;
  date: string;
  title: string;
  snippet: string;
  themes: StoryTheme[];
  hasImage: boolean;
  imageUrl?: string;
  sourceUrl: string;
  /** Rare — flags a post with real autobiographical/historical weight
   * (e.g. a debut-anniversary reflection) as a candidate for eventually
   * also becoming a full content/entries/ entry. Does not create one. */
  significant?: true;
  /** The original Korean text, verbatim, kept for reference alongside
   * the translation below. */
  originalText?: string;
  /** A faithful, natural English translation of `originalText` — not a
   * paraphrase (that's `snippet`/`title` above), not embellished, not
   * summarized. Clearly distinguished in the UI from archive-written
   * commentary. */
  translation?: string;
  /** Set only when a phrase has more than one reasonable reading (a pun,
   * slang, or an ambiguous reference) — names the ambiguity rather than
   * silently picking one meaning. */
  translationNote?: string;
  /** A transcription/translation read directly from handwritten Korean
   * visible in `imageUrl` (a letter, note, or card) — not text the
   * platform supplied. Entirely separate from `originalText`/
   * `translation` above, which are always the platform's own caption.
   * Only added once every character is legible with confidence; a post
   * with unresolved handwriting gets no `handwritten` field at all
   * rather than a guessed one. */
  handwritten?: {
    transcription: string;
    translation: string;
    /** Set only when something about the transcription genuinely needs
     * explaining (e.g. a stroke resolved via context/grammar rather than
     * independently legible) — not a routine disclaimer. */
    note?: string;
  };
}
