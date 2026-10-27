/**
 * URL-preservation / link-mapping check for entry summaries.
 *
 *   node scripts/validate-source-links.ts [--dir content/entries]
 *        [--baseline <dir>] [--html .next/server/app/archive]
 *        [--allow-frontmatter <json>]
 *
 * --allow-frontmatter: { "<slug>": { "addSources": [{label,url}...],
 *   "date": {"from","to"} } } — the only frontmatter edits tolerated, and
 *   only as stated: sources may gain exactly the listed records at the end
 *   (existing ones untouched), the date may change from/to exactly the
 *   listed values, and every other field must still equal the baseline.
 *
 * Errors (exit 1):
 *  - frontmatter (incl. every source label/url/flag) differs from baseline
 *  - full-text section differs from baseline
 *  - a quoted caption/translation in the baseline summary is missing now
 *  - a summary contains markup, markdown links, or a URL (summaries must
 *    stay plain text for cards, metadata, search and On This Day)
 *  - the render-time link plan does not map to the entry's own source
 *    record(s): inline/line plans must equal the one source; list plans
 *    must contain exactly the entry's sources
 *  - with --html: a source URL missing from the built page, an external
 *    link on the page that is not one of the entry's sources, or a meta /
 *    og description that is not the plain summary
 */
import fs from "node:fs";
import path from "node:path";
import { planSourceLinks } from "../src/lib/sourceLink.ts";
import { loadEntries } from "./entry-files.ts";

const args = process.argv.slice(2);
const opt = (name: string, def?: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : def;
};
const dir = opt("--dir", "content/entries")!;
const baselineDir = opt("--baseline");
const htmlDir = opt("--html");
const allowFile = opt("--allow-frontmatter");
type Allow = { addSources?: { label: string; url: string }[]; date?: { from: string; to: string } };
const allow: Record<string, Allow> = allowFile ? JSON.parse(fs.readFileSync(allowFile, "utf-8")) : {};
const same2 = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const entries = loadEntries(dir);
const baseline = baselineDir ? loadEntries(baselineDir) : null;
const errors: string[] = [];
const err = (slug: string, msg: string) => errors.push(`${slug}: ${msg}`);

const unescape = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
const ws = (s: string) => s.replace(/\s+/g, " ").trim();
const quoted = (s: string) =>
  [...s.matchAll(/"([^"]{2,})"|“([^”]{2,})”/g)].map((m) => ws(m[1] ?? m[2]));

const plans = { inline: 0, line: 0, list: 0 };
let changed = 0;
let htmlChecked = 0;

for (const [slug, e] of entries) {
  // 1. plain-text summaries
  if (/\]\(|<\/?[a-z][^>]*>|https?:\/\/|\*\*|^#{1,6}\s/m.test(e.summary)) {
    err(slug, `summary contains markup or a URL: ${e.summary.slice(0, 80)}`);
  }

  // 2. link plan maps to the entry's own source record(s)
  const plan = planSourceLinks(e.summary, e.sources);
  plans[plan.kind]++;
  const same = (a: { label: string; url: string }, b: { label: string; url: string }) =>
    a.url === b.url && a.label === b.label;
  if (plan.kind === "list") {
    const ok =
      plan.sources.length === e.sources.length && e.sources.every((s) => plan.sources.some((p) => same(p, s)));
    if (!ok) err(slug, "list plan does not contain exactly the entry's sources");
  } else if (e.sources.length !== 1 || !same(plan.source, e.sources[0])) {
    err(slug, "single-source plan does not map to the entry's only source record");
  }
  if (plan.kind === "inline") {
    const para = e.summary.split("\n\n")[plan.paragraph];
    if (!para || para.slice(plan.start, plan.end).length === 0) err(slug, "inline plan points at empty text");
  }

  // 3. baseline comparison
  if (baseline) {
    const b = baseline.get(slug);
    if (!b) {
      err(slug, "not in baseline (new entry)");
    } else {
      const al = allow[slug];
      if (!al) {
        if (b.rawFrontmatter !== e.rawFrontmatter) err(slug, "frontmatter differs from baseline");
      } else if (b.rawFrontmatter !== e.rawFrontmatter) {
        const { sources: bs, date: bd, ...bRest } = b.data as Record<string, unknown>;
        const { sources: ns, date: nd, ...nRest } = e.data as Record<string, unknown>;
        if (!same2(bRest, nRest)) err(slug, "frontmatter fields other than the allowed ones differ");
        const oldSrc = bs as unknown[]; const newSrc = ns as unknown[];
        const added = al.addSources ?? [];
        if (!same2(newSrc.slice(0, oldSrc.length), oldSrc)) err(slug, "existing sources were altered");
        if (!same2(newSrc.slice(oldSrc.length), added)) err(slug, "added sources differ from the allowed list");
        if (al.date) {
          if (bd !== al.date.from || nd !== al.date.to) err(slug, "date change is not exactly the allowed one");
        } else if (bd !== nd) err(slug, "date changed but not allowed");
      }
      if ((b.fullTextRaw ?? "") !== (e.fullTextRaw ?? "")) err(slug, "full-text section differs from baseline");
      if (b.summary !== e.summary) {
        changed++;
        for (const q of quoted(b.summary)) {
          if (!e.summary.includes(q)) err(slug, `quoted text lost from summary: "${q}"`);
        }
      }
    }
  }

  // 4. built output
  if (htmlDir) {
    const f = path.join(htmlDir, `${slug}.html`);
    if (!fs.existsSync(f)) {
      err(slug, `no built page at ${f}`);
      continue;
    }
    htmlChecked++;
    const html = fs.readFileSync(f, "utf-8");
    const art = /<article[\s\S]*?<\/article>/.exec(html)?.[0] ?? "";
    const hrefs = [...art.matchAll(/<a [^>]*href="(https?:[^"]+)"/g)].map((m) => unescape(m[1]));
    for (const s of e.sources) {
      if (!hrefs.includes(s.url)) err(slug, `source URL missing from built page: ${s.url}`);
    }
    for (const h of hrefs) {
      if (!e.sources.some((s) => s.url === h)) err(slug, `external link on page is not one of the entry's sources: ${h}`);
    }
    if (plan.kind === "inline") {
      const para = art.split("<p ").find((p) => p.includes(`href="${plan.source.url.replace(/&/g, "&amp;")}"`) && p.includes("text-lg"));
      if (!para) err(slug, "planned inline link not found inside the summary paragraph");
    }
    const metas = [
      /<meta name="description" content="([^"]*)"/.exec(html)?.[1],
      /<meta property="og:description" content="([^"]*)"/.exec(html)?.[1],
    ];
    for (const m of metas) {
      if (m === undefined) continue;
      if (ws(unescape(m)) !== ws(e.summary)) err(slug, "meta/og description is not the plain summary");
    }
  }
}

console.log(`entries checked: ${entries.size}`);
console.log(`link plans: ${plans.inline} inline, ${plans.line} source line, ${plans.list} list`);
if (baseline) console.log(`summaries changed vs baseline: ${changed}`);
if (htmlDir) console.log(`built pages checked: ${htmlChecked}`);
if (errors.length) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const m of errors.slice(0, 60)) console.log("  - " + m);
  if (errors.length > 60) console.log(`  … ${errors.length - 60} more`);
  process.exit(1);
}
console.log("OK: no errors");
