"use client";

import { useEffect, useRef, useState } from "react";

const SCRIPT_SRC = "https://platform.twitter.com/widgets.js";

type Twttr = { widgets: { load: (el?: Element) => void } };

/** Loads X's widgets.js once per page, and only when first asked. */
let scriptPromise: Promise<Twttr> | null = null;
function loadWidgets(): Promise<Twttr> {
  const w = window as unknown as { twttr?: Twttr };
  if (w.twttr?.widgets) return Promise.resolve(w.twttr);
  scriptPromise ??= new Promise<Twttr>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => (w.twttr?.widgets ? resolve(w.twttr) : reject(new Error("twttr missing")));
    s.onerror = () => {
      scriptPromise = null; // allow a retry
      reject(new Error("widgets.js failed"));
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Official X embed (DESIGN.md §5), click-to-load. Nothing from X — no
 * script, no cookies, no request — is made until the visitor presses
 * "Load post". The entry page already lists the original source, so it is
 * not repeated here; the panel offers its own link only if loading fails. Nothing is downloaded or rehosted: once
 * loaded, the post is displayed by X itself, with data-dnt set.
 */
export default function XEmbed({ url, label }: { url: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "failed">("idle");
  const loaded = state === "loading";

  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    loadWidgets()
      .then((twttr) => {
        if (!cancelled && ref.current) twttr.widgets.load(ref.current);
      })
      .catch(() => {
        if (!cancelled) setState("failed");
      });
    return () => {
      cancelled = true;
    };
  }, [loaded]);

  return (
    <div className="mx-auto w-full max-w-[550px]">
      <div ref={ref}>
        {loaded ? (
          <blockquote className="twitter-tweet" data-dnt="true" data-conversation="none" data-align="center">
            <a href={url} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </blockquote>
        ) : (
          <div className="border border-line px-5 py-6 text-center">
            <p className="eyebrow text-charcoal/75">Post on X</p>
            <button
              type="button"
              onClick={() => setState("loading")}
              className="btn btn-secondary btn-sm mt-4"
            >
              Load post
            </button>
            <p className="mt-3 text-xs leading-relaxed text-charcoal/75">
              {state === "failed" ? (
                <>
                  The post couldn’t be loaded.{" "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-line underline-offset-4 hover:text-plum hover:decoration-plum"
                  >
                    Open it on X <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </>
              ) : (
                "Loads the post from X, which may set cookies."
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
