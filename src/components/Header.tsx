"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { navItems } from "./navData";
import BrandLockup from "./BrandLockup";
import Glint from "./Glint";
import HeaderSearch from "./HeaderSearch";
import { SearchIndexEntry } from "@/lib/searchIndex";

const TODAY_LABEL = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function Header({ searchIndex }: { searchIndex: SearchIndexEntry[] }) {
  const [open, setOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    setOpen(false);
    setMobileSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      closeButtonRef.current?.focus();
    } else {
      menuButtonRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const currentQuery = searchParams.get("category");

  function isActive(href: string) {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefPath !== pathname) return false;
    if (!hrefQuery) return !currentQuery || pathname !== "/archive";
    const params = new URLSearchParams(hrefQuery);
    return params.get("category") === currentQuery;
  }

  return (
    <>
      <header className="header-golden-glass sticky top-0 z-40 border-b border-line/40 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="glint-hover group relative flex items-center">
            <Glint className="left-6 top-0" />
            <Glint className="left-1 top-5" style={{ animationDelay: "130ms" }} />
            <BrandLockup size="header" />
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            <span className="eyebrow shrink-0 text-charcoal/85">{TODAY_LABEL}</span>
            <HeaderSearch index={searchIndex} className="w-56 xl:w-72" />
          </div>

          <div className="flex items-center gap-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="-mx-2 -my-4 px-2 py-4 text-charcoal/70 transition-colors hover:text-plum"
              aria-label={mobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={mobileSearchOpen}
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="h-5 w-5" fill="none">
                <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.4" />
                <path d="M11 11L14.5 14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen(true)}
              className="-mx-2 -my-4 flex flex-col items-end gap-1.5 px-2 py-4"
              aria-label="Open menu"
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <span className="block h-px w-7 bg-ink" />
              <span className="block h-px w-7 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
            </button>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="border-t border-line px-5 py-3 sm:px-8 lg:hidden">
            <HeaderSearch index={searchIndex} autoFocus onNavigate={() => setMobileSearchOpen(false)} />
          </div>
        )}

        <nav aria-label="Primary" className="hidden border-t border-line lg:block">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-8 py-3 font-sans text-[13px] uppercase tracking-[0.08em]">
            {navItems
              .filter((i) => i.label !== "Search")
              .map((item, idx, arr) => (
                <span key={item.href} className="flex items-center gap-x-6">
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`transition-colors hover:text-plum ${
                      isActive(item.href) ? "text-plum" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {idx < arr.length - 1 && (
                    <span aria-hidden="true" className="text-line">
                      ·
                    </span>
                  )}
                </span>
              ))}
          </div>
        </nav>
      </header>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <BrandLockup size="header" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="meta -mx-3 -my-4 px-3 py-4"
            >
              Close ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            <ul className="flex flex-col divide-y divide-line border-t border-line">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block py-4 font-display text-3xl ${
                      isActive(item.href) ? "text-plum" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="meta mt-8 text-charcoal/85">
              Unofficial fan-created project · Not affiliated with Seonghwa,
              ATEEZ, KQ Entertainment, or rights holders.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
