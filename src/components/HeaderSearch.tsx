"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { excerptFor, searchEntries, SearchIndexEntry } from "@/lib/searchIndex";

function formatResultDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HeaderSearch({
  index,
  className = "",
  placeholder = "Search the archive…",
  autoFocus = false,
  onNavigate,
}: {
  index: SearchIndexEntry[];
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const pathname = usePathname();

  // Closing on route change covers both clicking a result (Link navigation)
  // and any other nav interaction, without needing per-result click handlers.
  // Adjusted during render rather than in an effect, per React's guidance for
  // resetting state when a prop changes — avoids the extra post-commit
  // render pass a setState-in-effect would otherwise trigger.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const results = useMemo(() => searchEntries(index, query), [index, query]);
  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="search-sky-glass flex items-center gap-2 border px-3 py-2 backdrop-blur-sm transition-colors focus-within:border-plum">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-4 w-4 shrink-0 text-charcoal/85"
          fill="none"
        >
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <label htmlFor={listboxId + "-input"} className="sr-only">
          Search the archive
        </label>
        <input
          id={listboxId + "-input"}
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={open && hasQuery}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent font-sans text-sm text-ink placeholder:text-charcoal/75 focus:outline-none"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="shrink-0 text-charcoal/75 transition-colors hover:text-plum"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      {open && hasQuery && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Search results"
          className="search-sky-glass absolute left-0 right-0 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto border backdrop-blur-sm shadow-[0_8px_24px_rgba(21,19,15,0.12)]"
        >
          {results.length === 0 ? (
            <p className="p-4 text-sm text-charcoal/75">
              No results found for &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {results.map((entry) => (
                <li key={entry.slug} role="option" aria-selected="false">
                  <Link
                    href={`/archive/${entry.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onNavigate?.();
                    }}
                    className="block px-4 py-3 transition-colors hover:bg-ivory-dim/60 focus-visible:bg-ivory-dim/60"
                  >
                    <span className="meta flex flex-wrap items-center gap-x-2 text-plum">
                      <span>{entry.category}</span>
                      <span aria-hidden="true" className="text-charcoal/40">
                        ·
                      </span>
                      <span className="text-charcoal/75">{formatResultDate(entry.date)}</span>
                    </span>
                    <span className="mt-1 block font-display text-base leading-snug text-ink">
                      {entry.title}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-charcoal/75">
                      {excerptFor(entry, query)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
