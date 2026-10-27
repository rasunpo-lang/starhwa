import Image from "next/image";
import Link from "next/link";
import { PlannedEntry } from "@/lib/layout";
import { entryHref, formatEntryDate } from "./entryLink";
import Glint from "@/components/Glint";

export default function MediaEntry({ item }: { item: PlannedEntry }) {
  const { entry, thumbnailUrl, thumbnailType } = item;
  const isProduct = thumbnailType === "product";

  return (
    <article className="glint-hover group relative flex h-full flex-col">
      <Link
        href={entryHref(entry)}
        className="absolute inset-0 z-[1]"
        aria-label={`${entry.title} — ${entry.category}, ${formatEntryDate(entry.date)}`}
      />
      <div
        className={`relative aspect-video w-full overflow-hidden photo-plane ${
          isProduct ? "bg-ivory-dim" : "bg-ink"
        }`}
      >
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`transition-transform duration-300 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100 ${
              isProduct ? "object-contain p-4" : "object-cover"
            }`}
          />
        )}
        <span className="meta absolute bottom-3 left-3 bg-ink/80 px-2 py-1 text-ivory">
          {entry.category}
        </span>
      </div>
      <div className="relative flex flex-1 flex-col border border-t-0 border-line p-5">
        <Glint className="right-4 top-4" />
        <time dateTime={entry.date} className="meta text-charcoal/75">
          {formatEntryDate(entry.date)}
        </time>
        <h3 className="pointer-events-none mt-2 line-clamp-2 font-display text-xl leading-snug text-ink transition-colors group-hover:text-plum">
          {entry.title}
        </h3>
        <p className="pointer-events-none mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-charcoal/75">
          {entry.summary}
        </p>
      </div>
    </article>
  );
}
