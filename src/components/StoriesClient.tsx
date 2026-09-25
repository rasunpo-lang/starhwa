"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Glint from "@/components/Glint";
import { STORY_THEMES, Story, StoryTheme } from "@/lib/types";

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`btn btn-sm ${active ? "btn-filled" : "btn-secondary"}`}
    >
      {label}
    </button>
  );
}

// See ArchiveClient.tsx — same parsing convention: unrecognized/stale
// values in a hand-edited or old URL are silently dropped, never crash.
function parseListParam(raw: string | null, isValid: (v: string) => boolean): string[] {
  if (!raw) return [];
  const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return [...new Set(values.filter(isValid))];
}

function formatStoryDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function groupByYear(list: Story[]): [number, Story[]][] {
  const map = new Map<number, Story[]>();
  for (const story of list) {
    const year = Number(story.date.slice(0, 4));
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(story);
  }
  return [...map.entries()].sort((a, b) => b[0] - a[0]);
}

function StoryRow({ story }: { story: Story }) {
  return (
    <div className="glint-hover group relative flex gap-4 py-5 sm:gap-5">
      <Link href={`/stories/${story.id}`} className="absolute inset-0 z-[1]" aria-label={story.title} />
      <Glint className="right-2 top-4" />
      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-line bg-ivory-dim sm:h-20 sm:w-20">
        {story.imageUrl ? (
          <Image
            src={story.imageUrl}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="meta flex flex-wrap items-center gap-x-3 gap-y-1 text-charcoal/75">
          <span>{formatStoryDate(story.date)}</span>
          {story.significant && (
            <span aria-hidden="true" className="text-plum" title="An especially meaningful post">
              ✦
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-display text-lg leading-snug text-ink transition-colors group-hover:text-plum sm:text-xl">
          {story.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-charcoal/80">{story.snippet}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {story.themes.map((theme) => (
            <span key={theme} className="meta border border-line px-2.5 py-1 text-charcoal/75">
              {theme}
            </span>
          ))}
          <Link
            href={`/stories/${story.id}`}
            className="meta relative z-10 ml-auto shrink-0 text-charcoal/75 transition-colors group-hover:text-plum"
          >
            Read Story →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function StoriesClient({ stories }: { stories: Story[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = useMemo(
    () => [...new Set(stories.map((s) => Number(s.date.slice(0, 4))))].sort((a, b) => a - b),
    [stories]
  );

  const yearStrings = useMemo(
    () => parseListParam(searchParams.get("year"), (v) => years.includes(Number(v))),
    [searchParams, years]
  );
  const year = useMemo(() => yearStrings.map(Number), [yearStrings]);

  const theme = useMemo(
    () =>
      parseListParam(searchParams.get("theme"), (v) =>
        STORY_THEMES.includes(v as StoryTheme)
      ) as StoryTheme[],
    [searchParams]
  );

  const activeCount = year.length + theme.length;

  const setGroupParam = useCallback(
    (key: "year" | "theme", values: string[]) => {
      const next = new URLSearchParams(searchParams.toString());
      if (values.length === 0) {
        next.delete(key);
      } else {
        next.set(key, values.join(","));
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const toggleValue = useCallback(
    (key: "year" | "theme", current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setGroupParam(key, next);
    },
    [setGroupParam]
  );

  const clearGroup = useCallback(
    (key: "year" | "theme") => setGroupParam(key, []),
    [setGroupParam]
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const filtered = useMemo(() => {
    return stories.filter((s) => {
      if (year.length > 0 && !year.includes(Number(s.date.slice(0, 4)))) return false;
      if (theme.length > 0 && !s.themes.some((t) => theme.includes(t))) return false;
      return true;
    });
  }, [stories, year, theme]);

  const grouped = useMemo(() => groupByYear(filtered), [filtered]);

  return (
    <div>
      <div className="space-y-6 border-b border-line pb-10">
        <div role="group" aria-label="Filter by year">
          <p className="meta mb-3 text-charcoal/75">Year</p>
          <div className="flex flex-wrap gap-2">
            <FilterPill label="All" active={yearStrings.length === 0} onClick={() => clearGroup("year")} />
            {years.map((y) => (
              <FilterPill
                key={y}
                label={String(y)}
                active={yearStrings.includes(String(y))}
                onClick={() => toggleValue("year", yearStrings, String(y))}
              />
            ))}
          </div>
        </div>

        <div role="group" aria-label="Filter by theme">
          <p className="meta mb-3 text-charcoal/75">Theme</p>
          <div className="flex flex-wrap gap-2">
            <FilterPill label="All" active={theme.length === 0} onClick={() => clearGroup("theme")} />
            {STORY_THEMES.map((t) => (
              <FilterPill
                key={t}
                label={t}
                active={theme.includes(t)}
                onClick={() => toggleValue("theme", theme, t)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="eyebrow text-charcoal/75">
          {filtered.length} {filtered.length === 1 ? "Story" : "Stories"}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="eyebrow text-charcoal/85 underline decoration-line underline-offset-4 transition-colors hover:text-plum hover:decoration-plum"
          >
            Clear All ({activeCount})
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 border border-line p-10 text-center">
          <p className="font-display text-2xl">No stories match these filters.</p>
          <p className="mt-2 text-sm text-charcoal/70">Try clearing a filter.</p>
        </div>
      ) : (
        <div className="mt-8">
          {grouped.map(([y, yearStories]) => (
            <div key={y} className="pt-4 first:pt-0">
              <div className="flex items-baseline gap-5">
                <h2 className="font-display text-4xl leading-none text-ink sm:text-5xl">{y}</h2>
                <span aria-hidden="true" className="text-[10px] text-plum/50">
                  ✦
                </span>
                <div className="h-px flex-1 bg-line" aria-hidden="true" />
                <span className="meta whitespace-nowrap text-charcoal/75">
                  {yearStories.length} {yearStories.length === 1 ? "story" : "stories"}
                </span>
              </div>
              <div className="divide-y divide-line border-t border-line">
                {yearStories.map((story) => (
                  <StoryRow key={story.id} story={story} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
