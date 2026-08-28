"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (e.g. buildSearchIndex
 * failing) — the one failure mode error.tsx can't catch, since error.tsx
 * boundaries wrap a layout's children, not the layout. Replaces the
 * entire document (Next requires its own <html>/<body> here), so it
 * can't rely on globals.css or next/font being loaded — every style
 * below is inline and self-contained, using the site's real brand colors
 * directly rather than Tailwind classes or the Fraunces webfont.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f1e6",
          color: "#15130f",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "left" }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#5c1f30",
            }}
          >
            Error
          </p>
          <h1 style={{ margin: "0.75rem 0 0", fontSize: 40, lineHeight: 1.1 }}>
            The Starhwa Encyclopedia Is Unavailable
          </h1>
          <p
            style={{
              margin: "1.25rem 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#3a352c",
            }}
          >
            Something went wrong loading the site itself. It&apos;s been
            logged — please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "2rem",
              padding: "0.75rem 1.5rem",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#15130f",
              background: "transparent",
              border: "1px solid #15130f",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
