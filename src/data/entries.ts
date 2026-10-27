import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, formatZodError } from "@/lib/schema";
import { eras } from "@/data/eras";
import { Entry, NextMemory, OnThisDayItem } from "@/lib/types";

/**
 * Loads and validates every *.md file in content/entries/ into typed,
 * fully-derived Entry records. This is the ONLY place that reads the
 * filesystem — it must never be imported from a "use client" component
 * (Node's fs module doesn't exist in the browser). Client components that
 * need entries receive them as props from a Server Component instead; see
 * src/app/archive/page.tsx and src/app/search/page.tsx.
 *
 * Authoring workflow: content/README.md
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "entries");

function eraIdForDate(date: string): string {
  const era = eras.find((e) => {
    const afterStart = date >= e.startDate;
    const beforeEnd = e.endDate === null || date <= e.endDate;
    return afterStart && beforeEnd;
  });
  if (!era) {
    throw new Error(
      `No era in src/data/eras.ts covers date ${date}. Add or extend an era's ` +
        `date range, or fix the entry's date.`
    );
  }
  return era.id;
}

type DraftEntry = Omit<Entry, "id">;

// Collapses stray internal whitespace per paragraph while preserving
// paragraph breaks (a blank line) — used for both `summary` and the
// optional long-form `fullText` so they're normalized identically.
function normalizeBody(raw: string | undefined): string {
  return (raw ?? "")
    .trim()
    .split(/\n\s*\n/)
    .map((para) => para.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

function loadEntryFile(filename: string): DraftEntry {
  const slug = filename.replace(/\.md$/, "");
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  const parsed = frontmatterSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/entries/${filename}:\n${formatZodError(parsed.error)}`
    );
  }

  const fm = parsed.data;

  // A `<!-- full-text -->` marker on its own line splits the body into the
  // short, reader-facing summary (before) and optional verbatim long-form
  // content (after) — see content/README.md "Long-form content." Most
  // entries have no marker, so `fullTextSource` stays undefined.
  const [summarySource, fullTextSource] = content.split(
    /\n\s*<!--\s*full-text\s*-->\s*\n/i
  );

  const summary = normalizeBody(summarySource);
  if (!summary) {
    throw new Error(
      `content/entries/${filename} has no body text — the Markdown body ` +
        `(below the --- frontmatter) is used as the entry's summary.`
    );
  }
  const fullText = fullTextSource ? normalizeBody(fullTextSource) : undefined;

  return {
    slug,
    date: fm.date,
    year: Number(fm.date.slice(0, 4)),
    eraId: eraIdForDate(fm.date),
    category: fm.category,
    title: fm.title,
    summary,
    fullText,
    tags: fm.tags,
    sources: fm.sources,
    image: fm.image,
    verification: fm.verification,
    related: fm.related,
  };
}

function assignCatalogIds(drafts: DraftEntry[]): Entry[] {
  const byDateThenSlug = [...drafts].sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? -1 : 1
  );
  const seqByYear = new Map<number, number>();
  return byDateThenSlug.map((draft) => {
    const seq = (seqByYear.get(draft.year) ?? 0) + 1;
    seqByYear.set(draft.year, seq);
    return { ...draft, id: `SHW-${draft.year}-${String(seq).padStart(3, "0")}` };
  });
}

function validateRelatedReferences(list: Entry[]): void {
  const slugs = new Set(list.map((e) => e.slug));
  for (const entry of list) {
    for (const relatedSlug of entry.related) {
      if (!slugs.has(relatedSlug)) {
        throw new Error(
          `content/entries/${entry.slug}.md lists "${relatedSlug}" under ` +
            `"related", but no entry with that filename/slug exists.`
        );
      }
    }
  }
}

function loadAllEntries(): Entry[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    throw new Error(`Content directory not found: ${CONTENT_DIR}`);
  }
  const filenames = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));

  if (filenames.length === 0) {
    throw new Error(`No entry files found in ${CONTENT_DIR}`);
  }

  const drafts = filenames.map(loadEntryFile);
  const entries = assignCatalogIds(drafts);
  validateRelatedReferences(entries);
  return entries;
}

let cache: Entry[] | null = null;

/** All entries, unsorted, freshly re-read from disk in development so
 * edits to content/entries/*.md show up without restarting the server. */
function getEntries(): Entry[] {
  if (process.env.NODE_ENV === "production") {
    if (!cache) cache = loadAllEntries();
    return cache;
  }
  return loadAllEntries();
}

export function getAllEntriesSorted(): Entry[] {
  return [...getEntries()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getEntryBySlug(slug: string): Entry | undefined {
  return getEntries().find((e) => e.slug === slug);
}

export function getEntryById(id: string): Entry | undefined {
  return getEntries().find((e) => e.id === id);
}

export function getRelatedEntries(entry: Entry): Entry[] {
  return entry.related
    .map((slug) => getEntryBySlug(slug))
    .filter((e): e is Entry => Boolean(e));
}

export function getAvailableYears(): number[] {
  const years = new Set(getEntries().map((e) => e.year));
  return [...years].sort((a, b) => a - b);
}

/** "MM-DD" key for a month (0-11) and day (1-31). */
export function monthDayKey(month: number, day: number): string {
  return `${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// A year can have several entries on the same calendar day (e.g. April 3);
// the panel shows one per year, preferring a verified entry, then slug
// order, so the pick is stable between builds and requests.
function pickForYear(list: Entry[]): Entry {
  return [...list].sort((a, b) => {
    if (a.verification !== b.verification) return a.verification === "verified" ? -1 : 1;
    return a.slug.localeCompare(b.slug);
  })[0];
}

/**
 * For each "MM-DD" key, one entry per year that has an entry on that exact
 * month/day, newest year first. Keys with no entries map to an empty list.
 * Exact matches only — never a "nearest date" substitute — so an
 * "On This Day" panel built from this is either truthful or empty.
 */
export function getOnThisDayByKey(keys: string[]): Record<string, OnThisDayItem[]> {
  const byKey = new Map<string, Map<number, Entry[]>>();
  for (const e of getEntries()) {
    const key = e.date.slice(5);
    if (!keys.includes(key)) continue;
    const years = byKey.get(key) ?? new Map<number, Entry[]>();
    years.set(e.year, [...(years.get(e.year) ?? []), e]);
    byKey.set(key, years);
  }
  const result: Record<string, OnThisDayItem[]> = {};
  for (const key of keys) {
    const years = byKey.get(key);
    result[key] = years
      ? [...years.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([year, list]) => {
            const e = pickForYear(list);
            return {
              slug: e.slug,
              year,
              date: e.date,
              category: e.category,
              title: e.title,
              // The panel clamps to four lines; no need to ship more.
              summary: e.summary.slice(0, 600),
            };
          })
      : [];
  }
  return result;
}

/**
 * The one onward link at the end of an entry page. The author's own
 * `related` list wins (first valid entry that isn't this one). Otherwise a
 * deterministic pick from existing metadata only: entries sharing tags
 * score by how rare each shared tag is (so "aniteez mascot" counts far more
 * than "individual content"), plus a small bonus for the same category and
 * era and a small penalty for distance in time; ties break by slug. No
 * randomness, so a page always points to the same entry.
 */
export function getNextMemory(entry: Entry): NextMemory | null {
  const entries = getEntries();

  for (const slug of entry.related) {
    if (slug === entry.slug) continue;
    const found = entries.find((e) => e.slug === slug);
    if (found) return { entry: found, source: "related", reason: null };
  }

  const tagCounts = new Map<string, number>();
  for (const e of entries) for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  const weight = (tag: string) => Math.log(entries.length / (tagCounts.get(tag) ?? entries.length));

  const own = new Set(entry.tags);
  // A shared tag that merely restates either entry's category or era says nothing new.
  // Plural-insensitive, so "magazine" restates the "Magazines" category.
  const norm = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/s$/, "");
  const restates = (tag: string, ...subjects: Entry[]) => {
    const t = norm(tag);
    return subjects.some((x) =>
      [x.category, x.eraId, eras.find((r) => r.id === x.eraId)?.name ?? ""].some(
        (v) => {
          const n = norm(v);
          const bare = norm(v.replace(/\s+era$/i, ""));
          // "fever era" restates "ZERO: FEVER Era"; a lone word must match whole.
          return t === n || t === bare || (/ era$/.test(t) && n.endsWith(t));
        },
      ),
    );
  };
  const ownTime = new Date(entry.date + "T00:00:00Z").getTime();
  const DAY_MS = 86_400_000;

  let best: { e: Entry; score: number; rarestShared: string | null } | null = null;
  for (const e of entries) {
    if (e.slug === entry.slug) continue;
    let score = 0;
    let rarestShared: string | null = null;
    let rarestWeight = -1;
    for (const t of e.tags) {
      if (!own.has(t)) continue;
      const w = weight(t);
      score += w;
      if (restates(t, entry, e)) continue;
      if (w > rarestWeight) {
        rarestWeight = w;
        rarestShared = t;
      }
    }
    if (e.category === entry.category) score += 0.5;
    if (e.eraId === entry.eraId) score += 0.5;
    const days = Math.abs(new Date(e.date + "T00:00:00Z").getTime() - ownTime) / DAY_MS;
    score -= days / 3650;
    if (!best || score > best.score || (score === best.score && e.slug < best.e.slug)) {
      best = { e, score, rarestShared };
    }
  }
  if (!best) return null;

  // Only name a shared tag when it's actually distinctive (appears on under
  // 5% of entries); otherwise the era is the honest common ground.
  const distinctive =
    best.rarestShared && (tagCounts.get(best.rarestShared) ?? 0) < entries.length * 0.05;
  const era = eras.find((x) => x.id === best.e.eraId);
  const reason = distinctive
    ? `Shares the tag “${best.rarestShared}”`
    : best.e.eraId === entry.eraId && era
      ? `Also from ${era.name}`
      : null;
  return { entry: best.e, source: "derived", reason };
}
