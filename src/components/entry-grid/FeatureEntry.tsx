import Image from "next/image";
import Link from "next/link";
import { PlannedEntry } from "@/lib/layout";
import { formatEntryDate, primaryLink } from "./entryLink";
import Glint from "@/components/Glint";

export default function FeatureEntry({
  item,
  reverse,
}: {
  item: PlannedEntry;
  reverse: boolean;
}) {
  const { entry, thumbnailUrl, thumbnailType } = item;
  const isProduct = thumbnailType === "product";
  const { href, external } = primaryLink(entry);
  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {};

  const meta = (
    <div className={`relative flex flex-col justify-center p-6 sm:p-10 ${reverse ? "lg:pr-4" : "lg:pl-4"}`}>
      <Glint className="right-6 top-6 sm:right-10 sm:top-10" />
      <Glint className="right-14 top-16 sm:right-20 sm:top-24" style={{ animationDelay: "120ms" }} />
      <p className="eyebrow text-plum">
        <span aria-hidden="true">✦ </span>
        {entry.category} ·{" "}
        <time dateTime={entry.date}>
          {formatEntryDate(entry.date, { month: "long", day: "numeric", year: "numeric" })}
        </time>
      </p>
      <h3 className="mt-4 font-display text-3xl leading-[1.05] tracking-tight sm:text-4xl lg:text-[2.75rem]">
        {entry.title}
      </h3>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-charcoal/85">
        {entry.summary}
      </p>
      <div className="mt-8 flex items-center gap-5">
        <a
          href={href}
          {...linkProps}
          className="btn btn-primary"
        >
          {external ? "Visit Original ↗" : "Read Entry →"}
          {external && <span className="sr-only"> (opens in a new tab)</span>}
        </a>
        {external && (
          <Link
            href={`/archive/${entry.slug}`}
            className="eyebrow text-charcoal/75 underline decoration-line underline-offset-4 hover:text-plum"
          >
            Full entry →
          </Link>
        )}
        <span className="meta text-charcoal/75">{entry.id}</span>
      </div>
    </div>
  );

  const image = thumbnailUrl ? (
    <div
      className={`relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:h-full ${
        isProduct ? "bg-ivory-dim" : "bg-ink"
      }`}
    >
      <Image
        src={thumbnailUrl}
        alt=""
        fill
        sizes="(min-width: 1024px) 58vw, 100vw"
        className={isProduct ? "object-contain p-8" : "object-cover"}
        priority={false}
      />
      {!isProduct && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center border-line bg-ivory-dim/50 p-10 lg:h-full">
      <span
        aria-hidden="true"
        className="font-display text-[7rem] leading-none text-line sm:text-[9rem] lg:text-[11rem]"
      >
        {String(entry.year).slice(2)}
      </span>
    </div>
  );

  return (
    <article className="glint-hover col-span-full border border-line bg-ivory">
      <div className="grid lg:min-h-[28rem] lg:grid-cols-12">
        <div className={`lg:col-span-7 ${reverse ? "lg:order-2" : "lg:order-1"}`}>{image}</div>
        <div className={`lg:col-span-5 ${reverse ? "lg:order-1" : "lg:order-2"}`}>{meta}</div>
      </div>
    </article>
  );
}
