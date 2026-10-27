import Link from "next/link";
import { PlannedEntry } from "@/lib/layout";
import { entryHref, formatEntryDate } from "./entryLink";
import Glint from "@/components/Glint";

export default function CompactGroup({ items }: { items: PlannedEntry[] }) {
  return (
    <div className="col-span-full border border-line">
      <ul className="divide-y divide-line">
        {items.map(({ entry }) => {
          return (
            <li key={entry.id} className="glint-hover group relative">
              <Glint className="right-8 top-1/2 -mt-[6.5px] hidden sm:block" />
              <Link
                href={entryHref(entry)}
                className="absolute inset-0 z-[1]"
                aria-label={`${entry.title} — ${entry.category}, ${formatEntryDate(entry.date)}`}
              />
              <div className="grid min-h-[3rem] grid-cols-[4rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors group-hover:bg-ivory-dim/50 sm:grid-cols-[5rem_7rem_1fr_auto] sm:gap-4 sm:px-5">
                <time
                  dateTime={entry.date}
                  className="meta pointer-events-none whitespace-nowrap text-charcoal/75"
                >
                  {formatEntryDate(entry.date, { month: "short", day: "numeric" })}
                </time>
                <span className="meta pointer-events-none hidden text-plum sm:block">
                  {entry.category}
                </span>
                <span className="pointer-events-none truncate font-display text-base text-ink group-hover:text-plum sm:text-lg">
                  {entry.title}
                </span>
                <span className="flex items-center gap-3 justify-self-end">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none font-mono text-xs text-charcoal/75 transition-transform group-hover:translate-x-0.5 group-hover:text-plum"
                  >
                    →
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
