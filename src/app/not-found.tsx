import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entry Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-5 py-20 sm:px-8 sm:py-28">
      <p className="eyebrow text-plum">404</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl">
        Entry Not Found
      </h1>
      <p className="mt-5 max-w-md text-sm leading-relaxed text-charcoal/85">
        This page doesn&apos;t exist, or it has moved. Try searching, or head
        back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link href="/search" className="btn btn-primary">
          Search the Archive
        </Link>
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
