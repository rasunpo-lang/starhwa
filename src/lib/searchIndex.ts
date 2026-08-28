import { Entry } from "./types";
import { eras } from "@/data/eras";

/**
 * A deliberately trimmed projection of Entry for client-side search: no
 * source URLs, no `related` slugs, no verification flag — just what's
 * needed to match a query and render a result row. Built once, server
 * side, and threaded down through the root layout so every page carries
 * one small array rather than each page re-fetching or duplicating the
 * full content model.
 */
export interface SearchIndexEntry {
  slug: string;
  id: string;
  title: string;
  summary: string;
  category: string;
  eraName: string;
  date: string;
  year: number;
  tags: string[];
  sourceLabels: string[];
}

export function buildSearchIndex(entries: Entry[]): SearchIndexEntry[] {
  const eraNameById = new Map(eras.map((e) => [e.id, e.name]));
  return entries.map((e) => ({
    slug: e.slug,
    id: e.id,
    title: e.title,
    summary: e.summary,
    category: e.category,
    eraName: eraNameById.get(e.eraId) ?? "",
    date: e.date,
    year: e.year,
    tags: e.tags,
    sourceLabels: e.sources.map((s) => s.label),
  }));
}

function formatSearchDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface ScoredResult {
  entry: SearchIndexEntry;
  score: number;
}

/**
 * Token-based, case-insensitive, order-independent matching: every
 * whitespace-separated word in the query must appear somewhere across the
 * entry's searchable fields (title, summary, category, era, tags, date,
 * year, source labels), so word order and exact phrasing don't matter.
 * Title/tag hits are weighted above summary/source hits so the most
 * relevant entries surface first.
 */
export function searchEntries(
  index: SearchIndexEntry[],
  query: string,
  limit = 8
): SearchIndexEntry[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const results: ScoredResult[] = [];

  for (const entry of index) {
    const titleLc = entry.title.toLowerCase();
    const summaryLc = entry.summary.toLowerCase();
    const categoryLc = entry.category.toLowerCase();
    const eraLc = entry.eraName.toLowerCase();
    const tagsLc = entry.tags.join(" ").toLowerCase();
    const sourcesLc = entry.sourceLabels.join(" ").toLowerCase();
    const dateLc = formatSearchDate(entry.date).toLowerCase();
    const yearStr = String(entry.year);

    let score = 0;
    let matchedAll = true;

    for (const token of tokens) {
      let tokenScore = 0;
      if (titleLc.includes(token)) tokenScore += 5;
      if (tagsLc.includes(token)) tokenScore += 3;
      if (categoryLc.includes(token)) tokenScore += 2;
      if (eraLc.includes(token)) tokenScore += 2;
      if (yearStr === token) tokenScore += 4;
      if (dateLc.includes(token)) tokenScore += 2;
      if (summaryLc.includes(token)) tokenScore += 1;
      if (sourcesLc.includes(token)) tokenScore += 1;

      if (tokenScore === 0) {
        matchedAll = false;
        break;
      }
      score += tokenScore;
    }

    if (matchedAll) results.push({ entry, score });
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.date < b.entry.date ? 1 : -1;
  });

  return results.slice(0, limit).map((r) => r.entry);
}

/** A short excerpt for the result row: prefers the sentence/window around
 * the first matched token so the visible snippet is actually relevant,
 * falling back to the start of the summary. */
export function excerptFor(entry: SearchIndexEntry, query: string, maxLen = 110): string {
  const summary = entry.summary;
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const lower = summary.toLowerCase();

  let hitIndex = -1;
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx !== -1 && (hitIndex === -1 || idx < hitIndex)) hitIndex = idx;
  }

  if (hitIndex === -1) {
    return summary.length > maxLen ? summary.slice(0, maxLen).trimEnd() + "…" : summary;
  }

  const start = Math.max(0, hitIndex - 30);
  const end = Math.min(summary.length, start + maxLen);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < summary.length ? "…" : "";
  return prefix + summary.slice(start, end).trim() + suffix;
}
