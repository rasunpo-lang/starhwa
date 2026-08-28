"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EntryGrid from "@/components/entry-grid/EntryGrid";
import { eras } from "@/data/eras";
import { CATEGORIES, Category, Entry } from "@/lib/types";

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

// Parses a comma-separated URL param into a de-duplicated list of values
// that pass `isValid` — anything unrecognized (typos, stale links, hand-
// edited URLs) is silently dropped rather than crashing the filter.
function parseListParam(raw: string | null, isValid: (v: string) => boolean): string[] {
  if (!raw) return [];
  const values = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return [...new Set(values.filter(isValid))];
}

export default function ArchiveClient({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const years = useMemo(
    () => [...new Set(entries.map((e) => e.year))].sort((a, b) => a - b),
    [entries]
  );

  const category = useMemo(
    () =>
      parseListParam(searchParams.get("category"), (v) =>
        CATEGORIES.includes(v as Category)
      ) as Category[],
    [searchParams]
  );
  const era = useMemo(
    () => parseListParam(searchParams.get("era"), (v) => eras.some((e) => e.id === v)),
    [searchParams]
  );
  const yearStrings = useMemo(
    () => parseListParam(searchParams.get("year"), (v) => years.includes(Number(v))),
    [searchParams, years]
  );
  const year = useMemo(() => yearStrings.map(Number), [yearStrings]);

  const activeCount = category.length + era.length + year.length;

  // Toggling a filter never adds a new history entry — every click within
  // a browsing session replaces the current one, so the back button takes
  // you to whatever page you were on before you started filtering, not
  // back through every individual toggle. The full filter state still
  // round-trips through the URL, so a real navigation (an entry page, a
  // browser back/forward) always restores exactly the filters it left
  // with.
  const setGroupParam = useCallback(
    (key: "category" | "era" | "year", values: string[]) => {
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
    (key: "category" | "era" | "year", current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setGroupParam(key, next);
    },
    [setGroupParam]
  );

  const clearGroup = useCallback(
    (key: "category" | "era" | "year") => setGroupParam(key, []),
    [setGroupParam]
  );

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (category.length > 0 && !category.includes(e.category)) return false;
      if (era.length > 0 && !era.includes(e.eraId)) return false;
      if (year.length > 0 && !year.includes(e.year)) return false;
      return true;
    });
  }, [entries, category, era, year]);

  return (
    <div>
      <div className="space-y-6 border-b border-line pb-10">
        <div role="group" aria-label="Filter by category">
          <p className="meta mb-3 text-charcoal/75">Category</p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="All"
              active={category.length === 0}
              onClick={() => clearGroup("category")}
            />
            {CATEGORIES.map((c) => (
              <FilterPill
                key={c}
                label={c}
                active={category.includes(c)}
                onClick={() => toggleValue("category", category, c)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          <div role="group" aria-label="Filter by era">
            <p className="meta mb-3 text-charcoal/75">Era</p>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={era.length === 0}
                onClick={() => clearGroup("era")}
              />
              {eras.map((e) => (
                <FilterPill
                  key={e.id}
                  label={e.name}
                  active={era.includes(e.id)}
                  onClick={() => toggleValue("era", era, e.id)}
                />
              ))}
            </div>
          </div>

          <div role="group" aria-label="Filter by year">
            <p className="meta mb-3 text-charcoal/75">Year</p>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={yearStrings.length === 0}
                onClick={() => clearGroup("year")}
              />
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
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="eyebrow text-charcoal/75">
          {filtered.length} {filtered.length === 1 ? "Entry" : "Entries"}
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
          <p className="font-display text-2xl">No entries match these filters.</p>
          <p className="mt-2 text-sm text-charcoal/70">
            Try clearing a filter, or check back as the archive grows.
          </p>
        </div>
      ) : (
        <div className="mt-8">
          {/* Year dividers only make sense when the results actually span
              a chronological range — filtering to specific year(s) drops
              them so the grid isn't left with lonely single-year dividers. */}
          <EntryGrid entries={filtered} showYearDividers={yearStrings.length === 0} />
        </div>
      )}
    </div>
  );
}
