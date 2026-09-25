import Link from "next/link";
import { Entry } from "@/lib/types";
import { entryHref, externalLinkProps, formatEntryDate, singleSourceUrl } from "./entry-grid/entryLink";
import Glint from "./Glint";

export default function EntryCard({ entry }: { entry: Entry }) {
  const sourceUrl = singleSourceUrl(entry);

  return (
    <div className="glint-hover group relative flex h-full flex-col border border-line bg-ivory p-5 transition-colors hover:border-plum sm:p-6">
      <Glint className="right-4 top-4" />
      <Glint className="right-10 top-12" style={{ animationDelay: "110ms" }} />
      <Link href={entryHref(entry)} className="absolute inset-0 z-[1]" aria-label={entry.title} />
      <div className="meta flex items-center justify-end gap-2 text-charcoal/75">
        <span className="shrink-0">{formatEntryDate(entry.date)}</span>
      </div>
      <div className="meta mt-4 text-plum">{entry.category}</div>
      <h3 className="pointer-events-none mt-2 line-clamp-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-plum sm:text-[22px]">
        {entry.title}
      </h3>
      <p className="pointer-events-none mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-charcoal/80">
        {entry.summary}
      </p>
      <div className="meta mt-5 flex items-center justify-between gap-2 text-charcoal/75">
        <span className="pointer-events-none flex items-center gap-2">
          {sourceUrl ? "1 source" : `${entry.sources.length} sources`}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
        {sourceUrl && (
          <a
            href={sourceUrl}
            {...externalLinkProps}
            className="btn btn-sm btn-secondary relative z-10 shrink-0"
          >
            View source ↗<span className="sr-only"> (opens original source in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}
