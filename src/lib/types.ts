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
