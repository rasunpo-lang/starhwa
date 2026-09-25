"use client";

import { useMemo, useState } from "react";
import EntryGrid from "@/components/entry-grid/EntryGrid";
import { Entry } from "@/lib/types";
import { buildSearchIndex, searchEntries } from "@/lib/searchIndex";

export default function SearchClient({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState("");

  const index = useMemo(() => buildSearchIndex(entries), [entries]);
  const entryBySlug = useMemo(
    () => new Map(entries.map((e) => [e.slug, e])),
    [entries]
  );

  // Same weighted, title/tag-prioritized ranking HeaderSearch.tsx already
  // uses — a title hit on every query token (e.g. an exact brand-name
  // search) outranks an entry that only mentions the term in passing
  // within its summary. No cap here (unlike the header dropdown): this
  // page shows every match, just correctly ordered by relevance.
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchEntries(index, q, index.length)
      .map((r) => entryBySlug.get(r.slug))
      .filter((e): e is Entry => Boolean(e));
  }, [index, entryBySlug, query]);

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
