"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Catches runtime rendering errors anywhere below the root layout (the
 * homepage's force-dynamic render is the one route where this is a real,
 * non-hypothetical possibility; everything else is statically generated,
 * so a render error there would already have failed the build). Mirrors
 * not-found.tsx's layout/tone for visual consistency between the two
 * "something's wrong" states the site can show.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-side diagnostic only — never rendered, never sent anywhere.
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-5 py-20 sm:px-8 sm:py-28">
      <p className="eyebrow text-plum">Error</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">
        Something Went Wrong
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/85">
        This page didn&apos;t load. Try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try Again
        </button>
        <Link
          href="/"
          className="eyebrow text-charcoal/70 underline decoration-line underline-offset-4 hover:text-plum"
        >
          Return Home →
        </Link>
      </div>
    </div>
  );
}
