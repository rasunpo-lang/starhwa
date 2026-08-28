import Link from "next/link";
import { Entry } from "@/lib/types";
import Glint from "./Glint";

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function EntryCard({ entry }: { entry: Entry }) {
  const hasSingleSource = entry.sources.length === 1;
  const primarySourceUrl = entry.sources[0]?.url;

  return (
    <div className="glint-hover group relative flex h-full flex-col border border-line bg-ivory p-5 transition-colors hover:border-plum sm:p-6">
      <Glint className="right-4 top-4" />
      <Glint className="right-10 top-12" style={{ animationDelay: "110ms" }} />
      {hasSingleSource ? (
        <a
          href={primarySourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-0"
          aria-label={`${entry.title} (opens original source in a new tab)`}
        />
      ) : (
        <Link
          href={`/archive/${entry.slug}`}
          className="absolute inset-0 z-0"
          aria-label={entry.title}
        />
      )}
      <div className="meta flex items-center justify-between gap-2 text-charcoal/75">
        <span className="truncate">{entry.id}</span>
        <span className="shrink-0">{formatDate(entry.date)}</span>
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
          {hasSingleSource ? "View source" : `${entry.sources.length} sources`}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            {hasSingleSource ? "↗" : "→"}
          </span>
        </span>
        {hasSingleSource && (
          <Link
            href={`/archive/${entry.slug}`}
            className="btn btn-sm btn-secondary relative z-10 shrink-0"
          >
            Read entry →
          </Link>
        )}
      </div>
    </div>
  );
}
