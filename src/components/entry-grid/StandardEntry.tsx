import Link from "next/link";
import { PlannedEntry } from "@/lib/layout";
import { entryHref, formatEntryDate } from "./entryLink";
import Glint from "@/components/Glint";

export default function StandardEntry({ item }: { item: PlannedEntry }) {
  const { entry } = item;

  return (
    <article className="glint-hover group relative flex h-full flex-col border-t border-line pt-5">
      <Glint className="right-1 top-6" />
      <Link
        href={entryHref(entry)}
        className="absolute inset-0 z-[1]"
        aria-label={`${entry.title} — ${entry.category}, ${formatEntryDate(entry.date)}`}
      />
      <span className="meta text-plum">
        {entry.category} · <time dateTime={entry.date}>{formatEntryDate(entry.date)}</time>
      </span>
      <h3 className="pointer-events-none mt-3 line-clamp-3 font-display text-2xl leading-[1.1] text-ink transition-colors group-hover:text-plum">
        {entry.title}
      </h3>
      <p className="pointer-events-none mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-charcoal/75">
        {entry.summary}
      </p>
    </article>
  );
}
