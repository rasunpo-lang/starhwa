"use client";

import { useMemo, useState } from "react";
import EntryGrid from "@/components/entry-grid/EntryGrid";
import { Entry } from "@/lib/types";

export default function SearchClient({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return entries.filter((e) => {
      const haystack = [
        e.id,
        e.title,
        e.summary,
        e.category,
        ...e.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, query]);

  return (
    <div>
      <label htmlFor="archive-search" className="sr-only">
        Search the archive
      </label>
      <div className="border-b-2 border-ink pb-3 transition-colors focus-within:border-plum">
        <input
          id="archive-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, categories, tags…"
          className="w-full bg-transparent font-display text-3xl placeholder:text-charcoal/30 focus:outline-none sm:text-4xl"
        />
      </div>

      <div aria-live="polite" className="eyebrow mt-6 text-charcoal/75">
        {query.trim() === "" ? (
          "Start typing to search the archive"
        ) : (
          <>
            {results.length} {results.length === 1 ? "result" : "results"} for
            &nbsp;&ldquo;{query}&rdquo;
          </>
        )}
      </div>

      {query.trim() !== "" && results.length === 0 && (
        <div className="mt-10 border border-line p-10 text-center">
          <p className="font-display text-2xl">No entries found.</p>
          <p className="mt-2 text-sm text-charcoal/70">
            Try a different title, category, or tag — such as
            &ldquo;fashion&rdquo;, &ldquo;interview&rdquo;, or an era name.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-10">
          <EntryGrid entries={results} showYearDividers={false} />
        </div>
      )}
    </div>
  );
}
