// Shared helpers for scripts/validate-source-links.ts and
// scripts/apply-summaries.ts. Mirrors the content loader in
// src/data/entries.ts (frontmatter split, `<!-- full-text -->` marker,
// normalizeBody) without importing it, so scripts run under plain `node`.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export interface ParsedEntry {
  slug: string;
  file: string;
  rawFrontmatter: string;
  title: string;
  sources: { label: string; url: string; qualifiesForTourSource?: true }[];
  summary: string;
  fullTextRaw: string | null;
  data: Record<string, unknown>;
}

const MARKER = /\n[ \t]*<!--\s*full-text\s*-->[ \t]*\n/i;

export function normalizeBody(raw: string): string {
  return raw
    .trim()
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
}

export function splitFile(raw: string) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) throw new Error("no frontmatter");
  const body = raw.slice(m[0].length);
  const mark = MARKER.exec("\n" + body);
  const summaryRegion = mark ? ("\n" + body).slice(1, mark.index) : body;
  const rest = mark ? ("\n" + body).slice(mark.index + 1) : null;
  return { frontmatterBlock: m[0], rawFrontmatter: m[1], summaryRegion, rest };
}

export function loadEntries(dir: string): Map<string, ParsedEntry> {
  const out = new Map<string, ParsedEntry>();
  for (const f of fs.readdirSync(dir).sort()) {
    if (!f.endsWith(".md") || f.startsWith("_")) continue;
    const raw = fs.readFileSync(path.join(dir, f), "utf-8");
    const { data } = matter(raw);
    const parts = splitFile(raw);
    out.set(f.replace(/\.md$/, ""), {
      slug: f.replace(/\.md$/, ""),
      file: f,
      rawFrontmatter: parts.rawFrontmatter,
      title: String(data.title ?? ""),
      sources: (data.sources ?? []) as ParsedEntry["sources"],
      summary: normalizeBody(parts.summaryRegion),
      fullTextRaw: parts.rest,
      data,
    });
  }
  return out;
}
