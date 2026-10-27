/**
 * Render-time source linking for entry pages.
 *
 * Summaries are stored as plain text (they are reused by cards, metadata,
 * search and On This Day), so a single-source entry's source is linked from
 * a phrase in the summary at render time instead. This module is the one
 * place that decides which phrase and which source — the entry page and
 * scripts/validate-source-links.ts both import it, so what the validator
 * checks is exactly what the page does.
 */

export interface SourceRecord {
  label: string;
  url: string;
}

// Phrases that already name the source in running text. The earliest match
// in the paragraph wins.
//
// NAMED covers "official YouTube channel", "ATEEZ's official X account",
// "SBS's official fancam", "official #TODAY_ATEEZ post" and the like.
// X_VARIANT covers the shorter, more natural "on X" / "via ATEEZ's X" /
// "on ATEEZ's X account"; it is case-sensitive so a stray lowercase "x"
// never matches, and it only counts after a preposition.
const NAMED =
  /(?:[A-Z][A-Za-z]+['’]s )?official (?:fan ?cam|YouTube channel|X account|Instagram(?: account)?|MV|music video|poster|#TODAY_ATEEZ post)|fan ?cam/gi;
const X_VARIANT =
  /(?<=\b(?:[Oo]n|[Vv]ia|[Ff]rom|[Ii]n) )(?:[A-Z][A-Za-z]+['’]s )?(?:official )?X(?: account| post)?\b/g;

/**
 * A platform named in the phrase must be the platform of the source it
 * would link to — "on X" never links to a YouTube source, "official
 * YouTube channel" never to an X post. Phrases that name no platform
 * (fancam, MV, ...) are allowed on any source.
 */
function phraseMatchesSource(phrase: string, url: string): boolean {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^(www|m)\./, "");
    } catch {
      return "";
    }
  })();
  const isX = host === "x.com" || host === "twitter.com";
  const isYT = host === "youtube.com" || host === "youtu.be";
  if (/YouTube/i.test(phrase)) return isYT;
  if (/Instagram/i.test(phrase)) return host === "instagram.com";
  if (/#TODAY_ATEEZ|poster/i.test(phrase)) return isX;
  if (/\bX\b/.test(phrase)) return isX;
  return true;
}

export function findSourcePhrase(
  text: string,
  url?: string
): { start: number; end: number } | null {
  let best: { start: number; end: number } | null = null;
  for (const re of [NAMED, X_VARIANT]) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      if (url && !phraseMatchesSource(m[0], url)) continue;
      const hit = { start: m.index!, end: m.index! + m[0].length };
      if (!best || hit.start < best.start) best = hit;
      break;
    }
  }
  return best;
}

export type SourceLinkPlan =
  /** Single source, linked from a phrase in the summary. */
  | { kind: "inline"; source: SourceRecord; paragraph: number; start: number; end: number }
  /** Single source, no linkable phrase: one plain source line. */
  | { kind: "line"; source: SourceRecord }
  /** Several sources: a plain list of every source record. */
  | { kind: "list"; sources: SourceRecord[] };

export function planSourceLinks(summary: string, sources: SourceRecord[]): SourceLinkPlan {
  if (sources.length !== 1) return { kind: "list", sources };
  const source = sources[0];
  const paragraphs = summary.split("\n\n");
  for (let i = 0; i < paragraphs.length; i++) {
    const para = paragraphs[i];
    // Same "section label" heuristic the entry page uses for headings.
    if (para.length < 80 && para.endsWith("Translation")) continue;
    const hit = findSourcePhrase(para, source.url);
    if (hit) return { kind: "inline", source, paragraph: i, ...hit };
  }
  return { kind: "line", source };
}
