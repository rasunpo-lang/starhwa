/**
 * Replace entry summaries from a proposals file, touching nothing else.
 *
 *   node scripts/apply-summaries.ts <proposals.json> --dir <entriesDir> [--write]
 *
 * proposals.json: { "<slug>": "<new summary text>", ... }
 * Only the summary region (between the frontmatter and the optional
 * `<!-- full-text -->` marker) is replaced; frontmatter bytes and the
 * full-text section are preserved exactly. Dry run unless --write.
 */
import fs from "node:fs";
import path from "node:path";
import { normalizeBody, splitFile } from "./entry-files.ts";

const args = process.argv.slice(2);
const proposalsFile = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--dir")!;
const dir = args[args.indexOf("--dir") + 1];
const write = args.includes("--write");
const proposals: Record<string, string> = JSON.parse(fs.readFileSync(proposalsFile, "utf-8"));

let n = 0;
for (const [slug, text] of Object.entries(proposals)) {
  const file = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`no such entry: ${slug}`);
  const raw = fs.readFileSync(file, "utf-8");
  const { frontmatterBlock, summaryRegion, rest } = splitFile(raw);
  const lead = /^\s*/.exec(summaryRegion)![0];
  const trail = /\s*$/.exec(summaryRegion)![0];
  // splitFile() consumes the newline in front of the full-text marker, so it
  // is added back here; the round-trip check below guarantees the rest of the
  // file is reproduced byte for byte.
  const assemble = (summary: string) =>
    frontmatterBlock + lead + summary + trail + (rest === null ? "" : "\n" + rest);
  if (assemble(summaryRegion.trim()) !== raw) {
    throw new Error(`${slug}: cannot reproduce the file unchanged; refusing to edit`);
  }
  const next = assemble(text.trim());
  console.log(`- ${slug}\n    old: ${normalizeBody(summaryRegion)}\n    new: ${text.trim()}`);
  if (write) fs.writeFileSync(file, next);
  n++;
}
console.log(`${write ? "wrote" : "dry run:"} ${n} summaries`);
