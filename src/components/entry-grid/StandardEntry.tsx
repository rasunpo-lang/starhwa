import Link from "next/link";
import { PlannedEntry } from "@/lib/layout";
import { formatEntryDate, primaryLink } from "./entryLink";
import Glint from "@/components/Glint";

export default function StandardEntry({ item }: { item: PlannedEntry }) {
  const { entry } = item;
  const { href, external } = primaryLink(entry);

  return (
    <article className="glint-hover group relative flex h-full flex-col border-t border-line pt-5">
      <Glint className="right-1 top-6" />
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="absolute inset-0 z-0"
        aria-label={`${entry.title} — ${entry.category}, ${formatEntryDate(entry.date)}${
          external ? " (opens original source in a new tab)" : ""
        }`}
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
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="meta pointer-events-none text-charcoal/75">
          {external ? "View source ↗" : `${entry.sources.length} sources →`}
        </span>
        {external && (
          <Link
            href={`/archive/${entry.slug}`}
            className="meta relative z-10 text-charcoal/75 underline decoration-line underline-offset-4 hover:text-plum"
          >
            Read entry
          </Link>
        )}
      </div>
    </article>
  );
}
