"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Ddeongbyeol from "./Ddeongbyeol";
import Glint from "./Glint";
import {
  BORN_STAR_POSITION,
  hasSeenBirthdaySightingThisSession,
  isSeonghwaBirthdayToday,
  markBirthdaySightingSeenThisSession,
} from "@/lib/birthday";

/**
 * ---------------------------------------------------------------------
 * TIMING — one small explicit chain, not a pile of independently-guessed
 * delays. Every stage is a named moment on the same 0 → SEQUENCE_DURATION_MS
 * timeline, and the CSS keyframes it drives (globals.css, all under
 * "BIRTH OF A STAR") are commented with the same percentages.
 * ---------------------------------------------------------------------
 * the sky is quiet → the first star sparkles awake → more stars awaken,
 * staggered → a clearly visible sparkling peak, held → Ddeongbyeol's one
 * small reaction (keyed to that same peak) → the inscription reveals once
 * the peak has visibly landed → hold → everything fades together, the
 * cluster settling back into the one real star that was always there.
 */
const STAR_CLUSTER_DURATION_MS = 10400; // .birthday-star's own animation-duration
const WITNESS_DURATION_MS = 10400; // .birthday-witness(__mascot)'s own animation-duration

const MESSAGE_DELAY_MS = 3200; // right as the cluster's peak lands — not before it
const MESSAGE_TOTAL_MS = 7000; // must match .birthday-message's animation-duration

const SEQUENCE_DURATION_MS = MESSAGE_DELAY_MS + MESSAGE_TOTAL_MS + 200;

/**
 * A small, elegant, hand-placed cluster of stars around
 * BORN_STAR_POSITION — offsets in the same top/left percentage system
 * Atmosphere.tsx's own STAR_POSITIONS already uses, so `calc(3% + -2.8%)`
 * reads relative to that one shared coordinate. One star sits exactly at
 * the offset (0, 0) — BORN_STAR_POSITION itself — and is given the
 * "hero" tier, the same tier the persistent star already rendered
 * underneath it (Atmosphere.tsx) uses, so it remains the cluster's
 * visual anchor and hands off to that real star invisibly once this
 * overlay fades. The rest are spread asymmetrically within a small
 * radius (never a radial/explosion pattern), a mix of "near" (a few
 * slightly brighter glints, their own soft halo) and "far" (small,
 * quiet, the majority of the cluster) tiers — exactly the real star
 * field's own two depth tiers, not a bespoke birthday palette. Delays are
 * staggered so the cluster visibly awakens one star after another rather
 * than blinking on as one shape.
 */
const BIRTHDAY_STAR_CLUSTER: { top: string; left: string; tier: "hero" | "near" | "far"; delayMs: number }[] = [
  { top: "0%", left: "0%", tier: "hero", delayMs: 0 },
  { top: "-2.8%", left: "4.2%", tier: "near", delayMs: 250 },
  { top: "2.2%", left: "-3.6%", tier: "near", delayMs: 450 },
  { top: "-1.4%", left: "-5.4%", tier: "far", delayMs: 650 },
  { top: "3.4%", left: "1.8%", tier: "far", delayMs: 850 },
  { top: "-3.6%", left: "1.2%", tier: "far", delayMs: 1050 },
  { top: "1.6%", left: "5.6%", tier: "far", delayMs: 1250 },
];

/**
 * A handful of extra "far" tier points, reusing the exact same
 * .atmosphere-star element and .birthday-star reveal wrapper as the
 * cluster above — not a second effect, the same sky quietly filling in a
 * little more. Absolute top/left (not offsets from BORN_STAR_POSITION —
 * unlike BIRTHDAY_STAR_CLUSTER's small radius, these are spread across a
 * much wider area, so an offset from one shared anchor stopped being the
 * simpler way to write them). Half sit loosely around the message/cluster
 * zone near the top of the frame; the other half sit near — deliberately
 * never on top of — Ddeongbyeol's own wander path (globals.css,
 * birthday-witness-wander), so the sky around her journey reads as a
 * little richer too. All "far" tier and nothing else: more tiny points of
 * light, not brighter ones. Delays are spread wider (300–1800ms) than the
 * cluster's own so this reads as one broad, gentle awakening across the
 * whole scene rather than a second synchronized burst.
 */
const BIRTHDAY_SKY_ENRICHMENT: { top: string; left: string; delayMs: number }[] = [
  { top: "4%", left: "24%", delayMs: 300 },
  { top: "9%", left: "70%", delayMs: 900 },
  { top: "40%", left: "40%", delayMs: 600 },
  { top: "58%", left: "6%", delayMs: 1500 },
  { top: "78%", left: "30%", delayMs: 1800 },
  { top: "90%", left: "22%", delayMs: 1100 },
];

/**
 * Cherry-blossom petals — the scene's one seasonal note (April 3 is
 * cherry-blossom season in Korea), kept deliberately sparse so the
 * celestial atmosphere stays intact: six small petals drifting down and
 * across the frame on their own slow, staggered paths, plus two that
 * belong to Ddeongbyeol herself (BIRTHDAY_CATCH_PETALS below). Positions
 * are vw/vh from the frame's top-left: a start, a mid-point (where the
 * sway happens) and an end, each petal fading in and out along the way.
 * Petal 3 is routed to drift past Ddeongbyeol during her longest pause
 * (roughly 4.2–5.2s, near left 29% / top 52%, see birthday-witness-wander
 * in globals.css) — a breeze carrying one past her, nothing more. Every
 * delay+duration lands inside SEQUENCE_DURATION_MS so nothing outlives
 * the scene. There is intentionally no "HAPPY BIRTHDAY" element here.
 */
const BIRTHDAY_PETALS: {
  x0: number; y0: number; xm: number; ym: number; x1: number; y1: number;
  size: number; delayMs: number; durationMs: number; spin: number;
}[] = [
  { x0: 78, y0: -4, xm: 63, ym: 30, x1: 48, y1: 62, size: 11, delayMs: 1500, durationMs: 6500, spin: 200 },
  { x0: 92, y0: 10, xm: 72, ym: 38, x1: 54, y1: 72, size: 9, delayMs: 2600, durationMs: 6800, spin: -160 },
  { x0: 62, y0: -4, xm: 40, ym: 40, x1: 20, y1: 68, size: 10, delayMs: 1800, durationMs: 4200, spin: 240 },
  { x0: 30, y0: -6, xm: 22, ym: 20, x1: 10, y1: 44, size: 8, delayMs: 3000, durationMs: 6000, spin: -120 },
  { x0: 96, y0: 40, xm: 74, ym: 50, x1: 48, y1: 64, size: 10, delayMs: 3800, durationMs: 6200, spin: 180 },
  { x0: 68, y0: -8, xm: 60, ym: 34, x1: 54, y1: 80, size: 9, delayMs: 5000, durationMs: 5200, spin: -210 },
];

/**
 * Two petals that follow Ddeongbyeol (children of .birthday-witness, so
 * they move with her): each drifts in from above, catches lightly on her
 * head/shoulder while she's paused, then lifts away on the breeze.
 * Offsets are px relative to her 56px box. Timed to her pause
 * (birthday-witness-wander's 34–50%, ≈3.5–5.2s).
 */
const BIRTHDAY_CATCH_PETALS: {
  x0: number; y0: number; xr: number; yr: number; x1: number; y1: number;
  size: number; delayMs: number; durationMs: number;
}[] = [
  { x0: 70, y0: -70, xr: 40, yr: 2, x1: 96, y1: -34, size: 9, delayMs: 3400, durationMs: 3900 },
  { x0: 84, y0: -56, xr: 14, yr: 26, x1: -26, y1: -40, size: 8, delayMs: 4300, durationMs: 3800 },
];

/** One petal — a simple notched sakura petal, pale pink. */
function Petal({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 12 14" className={className} style={style}>
      <path
        d="M6 3 C5 1.2 3 0.6 1.8 2.6 C0.4 5 1.2 9.5 6 13 C10.8 9.5 11.6 5 10.2 2.6 C9 0.6 7 1.2 6 3 Z"
        fill="#f8d9e2"
        stroke="#e9a4b8"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * BIRTH OF A STAR — Seonghwa's birthday (April 3, KST — src/lib/birthday.ts).
 *
 * The existing STARHWA sky remains the sky. This component doesn't invent
 * a new visual object for the occasion — it briefly reveals a small
 * cluster of real stars (BIRTHDAY_STAR_CLUSTER above), each one the exact
 * same .atmosphere-star element the ordinary night sky already renders,
 * around the one coordinate (BORN_STAR_POSITION) where the persistent
 * hero star already lives in Atmosphere.tsx. The cluster awakens star by
 * star, holds at a clearly visible sparkling peak, then settles back down
 * — every star but the one at BORN_STAR_POSITION itself fades away
 * completely, and that one hands off invisibly to the real star already
 * sitting there, so the sky simply has one true star again, exactly like
 * any other day. Ddeongbyeol — fixed in her usual bottom-left habitat, no
 * travel, no bounce — gives one small reaction (a slight turn toward the
 * cluster with a faint catch-light) timed to its peak, and only once that
 * peak has visibly landed does the "BIRTH OF A STAR / APRIL 3" inscription
 * reveal. Everything fades out together at the end; the sky returns to
 * normal without a hard cut.
 *
 * Fires once per browser session (sessionStorage-gated). Demo aid:
 * `?birthday=now` forces an immediate play regardless of date, mirroring
 * the same convention in Atmosphere.tsx.
 */
export default function BirthdaySighting() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let unmountTimeout: number | undefined;

    function trigger() {
      markBirthdaySightingSeenThisSession();
      setVisible(true);
      unmountTimeout = window.setTimeout(() => setVisible(false), SEQUENCE_DURATION_MS);
    }

    const forced = new URLSearchParams(window.location.search).get("birthday") === "now";
    if (forced) {
      trigger();
    } else if (isSeonghwaBirthdayToday() && !hasSeenBirthdaySightingThisSession()) {
      trigger();
    }

    return () => window.clearTimeout(unmountTimeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="birthday-sighting" aria-hidden="true">
      {/* The cluster becoming visible — each star is the real
          .atmosphere-star element, wrapped in one small reveal/position
          span apiece, staggered by its own delay so the sky visibly
          sparkles awake rather than switching on. */}
      {BIRTHDAY_STAR_CLUSTER.map((star, i) => (
        <div
          key={i}
          className="birthday-star"
          style={{
            top: `calc(${BORN_STAR_POSITION.top} + ${star.top})`,
            left: `calc(${BORN_STAR_POSITION.left} + ${star.left})`,
            animationDuration: `${STAR_CLUSTER_DURATION_MS}ms`,
            animationDelay: `${star.delayMs}ms`,
          }}
        >
          <span className={`atmosphere-star atmosphere-star--${star.tier}`} />
        </div>
      ))}

      {/* The same sky, briefly a little richer — a handful more tiny
          "far" points, near the message zone and near Ddeongbyeol's own
          path, reusing the exact same wrapper/element as the cluster
          above. */}
      {BIRTHDAY_SKY_ENRICHMENT.map((star, i) => (
        <div
          key={i}
          className="birthday-star"
          style={{
            top: star.top,
            left: star.left,
            animationDuration: `${STAR_CLUSTER_DURATION_MS}ms`,
            animationDelay: `${star.delayMs}ms`,
          }}
        >
          <span className="atmosphere-star atmosphere-star--far" />
        </div>
      ))}

      {/* Ddeongbyeol, the tiny witness — wanders a small path (see
          birthday-witness-wander, globals.css), no bounce, no spin. */}
      <div className="birthday-witness" style={{ animationDuration: `${WITNESS_DURATION_MS}ms` }}>
        <Ddeongbyeol className="birthday-witness__mascot" />
        {/* Two petals that drift in, catch on her briefly while she
            pauses, then float off (see BIRTHDAY_CATCH_PETALS). */}
        {BIRTHDAY_CATCH_PETALS.map((p, i) => (
          <Petal
            key={i}
            className="birthday-petal birthday-petal--catch"
            style={{
              width: p.size,
              height: p.size * (14 / 12),
              animationDelay: `${p.delayMs}ms`,
              animationDuration: `${p.durationMs}ms`,
              "--x0": `${p.x0}px`, "--y0": `${p.y0}px`,
              "--xr": `${p.xr}px`, "--yr": `${p.yr}px`,
              "--x1": `${p.x1}px`, "--y1": `${p.y1}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* Sparse drifting petals — see BIRTHDAY_PETALS. */}
      {BIRTHDAY_PETALS.map((p, i) => (
        <Petal
          key={i}
          className="birthday-petal"
          style={{
            width: p.size,
            height: p.size * (14 / 12),
            animationDelay: `${p.delayMs}ms`,
            animationDuration: `${p.durationMs}ms`,
            "--x0": `${p.x0}vw`, "--y0": `${p.y0}vh`,
            "--xm": `${p.xm}vw`, "--ym": `${p.ym}vh`,
            "--x1": `${p.x1}vw`, "--y1": `${p.y1}vh`,
            "--spin": `${p.spin}deg`,
          } as CSSProperties}
        />
      ))}

      {/* The inscription — reveals only once the star's peak has already
          landed and it's settling into its permanent look. */}
      <div
        className="birthday-message"
        style={{ animationDelay: `${MESSAGE_DELAY_MS}ms`, animationDuration: `${MESSAGE_TOTAL_MS}ms` }}
      >
        <Glint
          className="glint-burst birthday-message__glint"
          style={{ top: "-8px", left: "10%", animationDelay: `${MESSAGE_DELAY_MS + 250}ms` }}
        />
        <Glint
          className="glint-burst birthday-message__glint"
          style={{ top: "-8px", right: "10%", animationDelay: `${MESSAGE_DELAY_MS + 450}ms` }}
        />
        <p className="birthday-message__eyebrow">Birth of a Star</p>
        <p className="meta birthday-message__date">April 3</p>
        <p className="birthday-message__supporting">For all the days that brought you here.</p>
      </div>
    </div>
  );
}
