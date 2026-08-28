import { Entry } from "@/lib/types";

/** Single-source entries link straight to that source (unambiguous);
 * multi-source entries link to the entry page, where every source is
 * listed — jumping to just one of several would be arbitrary. */
export function primaryLink(entry: Entry): { href: string; external: boolean } {
  if (entry.sources.length === 1) {
    return { href: entry.sources[0].url, external: true };
  }
  return { href: `/archive/${entry.slug}`, external: false };
}

export function formatEntryDate(date: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-US",
    opts ?? { month: "short", day: "2-digit", year: "numeric" }
  );
}
