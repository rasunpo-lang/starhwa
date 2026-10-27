"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import Glint from "./Glint";
import type { OnThisDayItem } from "@/lib/types";

// Extra-year rows shown before the rest fold behind "+N more".
const MAX_OTHER_ROWS = 4;

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function localKey(): string {
  const now = new Date();
  return `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Re-evaluates at the visitor's next local midnight, so a tab left open
// overnight moves to the new day rather than staying on yesterday's.
function subscribe(onChange: () => void) {
  let timer: number;
  const arm = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    timer = window.setTimeout(() => {
      onChange();
      arm();
    }, next.getTime() - now.getTime());
  };
  arm();
  return () => window.clearTimeout(timer);
}

/**
 * The homepage's "On This Day" panel, keyed to the *visitor's* local date
 * rather than the server's. The server can't know the visitor's timezone,
 * so it renders its own date's entries as the initial (and no-JS) state and
 * passes the surrounding few days' entries (`days`, ±2 days covers every
 * pair of timezones); once hydrated this switches to the visitor's own
 * local day. Exact month/day matches only: when the visitor's day has no
 * entries — or isn't among the days sent — nothing renders at all.
 *
 * Shows the newest year's entry in full, then one quieter row per other
 * year that has an entry on this date.
 */
export default function OnThisDay({
  serverKey,
  days,
}: {
  serverKey: string;
  days: Record<string, OnThisDayItem[]>;
}) {
  const key = useSyncExternalStore(subscribe, localKey, () => serverKey);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const listId = useId();
  const items = days[key];
  if (!items || items.length === 0) return null;

  const [featured, ...others] = items;
  const expanded = expandedKey === key;
  const hidden = Math.max(0, others.length - MAX_OTHER_ROWS);
  const shown = expanded ? others : others.slice(0, MAX_OTHER_ROWS);
  const [month, day] = key.split("-").map(Number);
  // 2000 is a leap year, so a 02-29 key formats correctly.
  const heading = new Date(2000, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glint-hover group relative border-l-2 border-plum/50 pl-6 sm:pl-8">
      <Glint className="-left-2 top-0" />
      <Glint className="left-12 top-10" style={{ animationDelay: "160ms" }} />
      <p className="meta text-charcoal/85">On This Day</p>
      <p className="mt-1 font-display text-3xl">{heading}</p>
      <div className="mt-6">
        <p className="meta text-plum">
          {featured.category} · {formatDate(featured.date)}
        </p>
        <h2 className="mt-2 font-display text-xl leading-snug">{featured.title}</h2>
        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-charcoal/80">
          {featured.summary}
        </p>
        <Link
          href={`/archive/${featured.slug}`}
          className="meta mt-4 inline-block text-ink underline decoration-line underline-offset-4 hover:text-plum"
        >
          View entry →
        </Link>
      </div>
      {others.length > 0 && (
        <ul id={listId} className="mt-6 space-y-3 border-t border-line pt-5">
          {shown.map((item) => (
            <li key={item.slug}>
              <Link href={`/archive/${item.slug}`} className="group/row block">
                <span className="meta text-plum">
                  {item.year} · {item.category}
                </span>
                <span className="mt-0.5 block text-sm leading-snug text-ink transition-colors group-hover/row:text-plum">
                  {item.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setExpandedKey(expanded ? null : key)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="meta mt-3 inline-block text-charcoal/75 underline decoration-line underline-offset-4 hover:text-plum"
        >
          {expanded ? "Show fewer" : `+${hidden} more`}
        </button>
      )}
    </div>
  );
}
