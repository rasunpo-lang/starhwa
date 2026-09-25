import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { frontmatterSchema, formatZodError } from "@/lib/schema";
import { eras } from "@/data/eras";
import { Entry } from "@/lib/types";

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

export function getOnThisDayEntry(referenceDate: Date): Entry | null {
  const entries = getEntries();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();

  const exact = entries.filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d.getMonth() === month && d.getDate() === day;
  });

  if (exact.length > 0) {
    return exact.sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  }

  let closest: Entry | null = null;
  let closestDistance = Infinity;

  for (const e of entries) {
    const d = new Date(e.date + "T00:00:00");
    const thisYear = new Date(referenceDate.getFullYear(), d.getMonth(), d.getDate());
    const distance = Math.abs(thisYear.getTime() - referenceDate.getTime());
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = e;
    }
  }

  return closest;
}
