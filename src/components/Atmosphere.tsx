"use client";

import { useEffect, useRef, useState } from "react";
import Aurora from "./Aurora";
import Glint from "./Glint";
import {
  ATMOSPHERE_CONFIG as CFG,
  getGoldenAmount,
  getGoldenProgress,
  getMoonPhase,
  getNightAmount,
  getNightTextAmount,
  getSolarPosition,
} from "@/lib/atmosphere";
import {
  getAtmospherePreviewMode,
  getPreviewDate,
  getRainAmount,
  getRainPreviewLevel,
  subscribeAtmospherePreviewMode,
  subscribeRainPreviewLevel,
} from "@/lib/atmospherePreview";
import { BORN_STAR_POSITION, isSeonghwaBirthdayToday } from "@/lib/birthday";

/**
 * ✦ ASTRAL SKY — the visual half of the day/night atmosphere: DAWN → DAY
 * → GOLDEN HOUR → TWILIGHT → NIGHT as one continuously-evolving sky, not
 * five separate presets. The actual color shift happens in globals.css
 * (color-mix() chains driven by the --night/--night-text/--golden/
 * --golden-progress custom properties this component sets on <html>,
 * plus --sky-transition, a value derived purely in CSS from --night —
 * see :root in globals.css); this component only keeps those inputs
 * current, plus renders the purely decorative sky layer (.atmosphere-sky
 * — a gradient that's *always* visible now, not just during Golden Hour
 * — a sun tracking its real position, moon, stars, rare sparkle/shooting
 * star) on top of it. --golden is the sky's warm-tint intensity (0 → 1 →
 * 0, how strong Golden Hour's overlay is right now); --golden-progress
 * is a *separate* monotonic 0 → 1 value tracking where within that same
 * window the visitor is (getGoldenProgress in src/lib/atmosphere.ts).
 * The sun itself (.atmosphere-sun) doesn't follow either of those — it's
 * positioned by real solar elevation/horizontal-sweep (getSolarPosition,
 * --sun-elevation/--sun-x below), visible across the whole day and
 * fading only near its own horizon crossing, exactly like a real sun
 * would — Golden Hour is just the sky warming around it while it's
 * already low, not what makes it appear or move. The moon and sun are
 * still mutually exclusive: the moon's own opacity rule (globals.css) is
 * steeply suppressed by --golden, so it's fully hidden through the
 * Golden Hour window that brackets sunrise/sunset — which is also
 * exactly the window the sun's own elevation-based fade covers on the
 * other side, so the two never overlap in practice. The moon's own
 * markup/astronomy is untouched by any of this — its shape still tracks
 * the real lunar phase (getMoonPhase in src/lib/atmosphere.ts) via
 * --moon-illum/--moon-dir, rendered in CSS as two overlapping discs (see
 * .atmosphere-moon-lit/-shadow) rather than an SVG terminator path; its
 * screen position stays fixed rather than elevation-driven like the sun
 * — a known, deliberate limitation (real lunar position needs new
 * moonrise/moonset astronomy this pass doesn't add). See DESIGN.md for
 * the full rationale.
 *
 * Not a "creature" feature — see DdeongbyeolSighting.tsx for that
 * (untouched by this component). The sky layer here is deliberately
 * inert scenery, kept as separate sky/sun/moon/stars/sparkle pieces so a
 * future wandering creature could eventually be layered in without a
 * rewrite.
 *
 * Background depth (DESIGN.md §13): between .atmosphere-sky and
 * .atmosphere-midground sit two more purely-CSS planes with no markup of
 * their own — .atmosphere-cosmic (a barely-there, night-only tonal drift,
 * near-stationary) and .atmosphere-mid-depth (a soft gradient wash with
 * its own small parallax rate, between the far and near star tiers'). Both
 * are simple <div>s here; all of their depth/motion logic lives in
 * globals.css, same as .atmosphere-sky itself.
 *
 * Cloud layers (DESIGN.md §14): three more simple, markup-free <div>s —
 * .atmosphere-clouds-far/-mid/-near — rendered after the sun/moon/stars so
 * they sit physically in front of them (real clouds are far closer than
 * any celestial body), each a CSS-only stack of soft radial-gradient
 * blobs. Same "no astronomy, no per-item data" reasoning as the depth
 * planes above: nothing here needs React state or a timer of its own —
 * they read --night/--golden/--scroll-y exactly like everything else
 * Atmosphere.tsx already sets, so Live/Sunrise/Night all drive them for
 * free with no separate cloud logic.
 *
 * RAIN PREVIEW (dev-only prototype — src/lib/atmospherePreview.ts): a
 * completely independent overlay, not a sixth sky state. --rain (0 →
 * off, up to 1 → "moderate") never feeds into --night/--golden or any
 * astronomy in atmosphere.ts, and nothing here changes when --rain is 0
 * — Night stays Night, Golden Hour stays Golden Hour, exactly as before
 * this prototype existed. It's driven by its own preview control
 * (AtmospherePreviewToggle.tsx), gated out of production the same way
 * the sky-state preview is (layout.tsx). See .atmosphere-rain-far/-near
 * in globals.css for the actual streak rendering.
 *
 * BIRTH OF A STAR (src/lib/birthday.ts): on April 3 KST, one extra star
 * is added to .atmosphere-stars below, styled with the same
 * .atmosphere-star--hero class as any other hero-tier star — no new star
 * system, no new opacity formula. It inherits the field's existing
 * night/golden-hour gating for free, which is what makes it fade in at
 * dawn, recede through daylight/golden hour, and read as simply part of
 * the sky at night, without any bespoke timing logic of its own. The
 * `isBirthday` state below is the only new piece of React state this
 * adds; everything else about the star is the existing star system.
 */

type StarDepth = "far" | "near" | "hero";

/* Hand-placed, not random — keeps star positions deterministic across
   server/client so this component could later render without a mount
   gate if needed, and avoids a "reshuffling" effect on every reload.
   `depth` (DESIGN.md §12) drives each star's size/glow/tint/twinkle-speed
   via the matching `.atmosphere-star--<depth>` class in globals.css —
   assigned by hand here rather than inferred from array position (the
   old :nth-child-based tiers coupled visual depth to array order only by
   coincidence). Two tiers, not four: an earlier far/mid/near/hero split
   put most of its visual difference between far and mid, which turned
   out to be too subtle to register at a glance — mid was folded into far
   so the remaining far→near→hero steps are each a clear, perceptible
   jump rather than a technically-different-but-visually-identical one.
   "hero" stars additionally get a lens-sparkle cross; spread apart
   rather than clustered, same reasoning as the tiers below.

   Density pass: grown from 18 to 30 points, weighted almost entirely
   toward more "far" stars (20 of 30, up from 11) rather than more near/
   hero ones (6 and 4, up from 4 and 3) — density, not intensity, per the
   brief. The additions are interleaved by hand among the original
   points rather than filling every gap evenly: a few sit close enough
   to an existing star to read as a loose cluster, several patches of
   the field (e.g. roughly 50–100% top, the field's own lower edge) are
   left untouched on purpose, so the sky still has real negative space
   and doesn't read as a uniform pattern. */
const STAR_POSITIONS: { top: string; left: string; delay: string; depth: StarDepth }[] = [
  { top: "6%", left: "12%", delay: "0s", depth: "hero" },
  { top: "14%", left: "28%", delay: "1.2s", depth: "far" },
  { top: "9%", left: "44%", delay: "2.4s", depth: "far" },
  { top: "22%", left: "6%", delay: "0.6s", depth: "far" },
  { top: "18%", left: "62%", delay: "3.1s", depth: "near" },
  { top: "28%", left: "38%", delay: "1.8s", depth: "far" },
  { top: "11%", left: "78%", delay: "2.9s", depth: "hero" },
  { top: "34%", left: "18%", delay: "0.3s", depth: "far" },
  { top: "16%", left: "90%", delay: "3.6s", depth: "near" },
  { top: "40%", left: "55%", delay: "1.5s", depth: "far" },
  { top: "5%", left: "58%", delay: "2.1s", depth: "far" },
  { top: "31%", left: "82%", delay: "0.9s", depth: "far" },
  { top: "24%", left: "72%", delay: "3.3s", depth: "near" },
  { top: "44%", left: "10%", delay: "1.1s", depth: "hero" },
  { top: "38%", left: "94%", delay: "2.6s", depth: "far" },
  { top: "8%", left: "34%", delay: "0.4s", depth: "far" },
  { top: "46%", left: "30%", delay: "3.9s", depth: "far" },
  { top: "20%", left: "48%", delay: "1.9s", depth: "near" },
  { top: "3%", left: "22%", delay: "2.2s", depth: "far" },
  { top: "13%", left: "56%", delay: "0.8s", depth: "far" },
  { top: "26%", left: "8%", delay: "3.4s", depth: "far" },
  { top: "42%", left: "46%", delay: "1.6s", depth: "near" },
  { top: "17%", left: "36%", delay: "2.9s", depth: "far" },
  { top: "7%", left: "68%", delay: "0.5s", depth: "far" },
  { top: "33%", left: "58%", delay: "3.7s", depth: "far" },
  { top: "48%", left: "72%", delay: "1.3s", depth: "far" },
  { top: "4%", left: "86%", delay: "2.5s", depth: "hero" },
  { top: "36%", left: "66%", delay: "0.2s", depth: "far" },
  { top: "22%", left: "96%", delay: "3.1s", depth: "near" },
  { top: "45%", left: "4%", delay: "1.9s", depth: "far" },
];

const SPARKLE_SPOTS = [
  { top: "15%", left: "22%" },
  { top: "10%", left: "50%" },
  { top: "26%", left: "70%" },
  { top: "35%", left: "40%" },
];

/* Mid-background/environment layer — see .atmosphere-midground in
   globals.css. Sparser and spread lower than STAR_POSITIONS (stars
   read as distant sky; these read as nearer haze), same hand-placed-
   not-random reasoning. */
const MIDGROUND_POSITIONS: { top: string; left: string }[] = [
  { top: "48%", left: "16%" },
  { top: "58%", left: "38%" },
  { top: "40%", left: "64%" },
  { top: "66%", left: "84%" },
  { top: "52%", left: "8%" },
];

export default function Atmosphere() {
  const [sparkleSpot, setSparkleSpot] = useState<{ top: string; left: string } | null>(null);
  const [shootingStar, setShootingStar] = useState(false);
  // BIRTH OF A STAR (src/lib/birthday.ts) — true only on April 3 KST (or
  // with the ?birthday=now test override, mirroring BirthdaySighting.tsx's
  // own convention). Starts false so the very first render — server and
  // client alike — never depends on the date, then flips once client-side
  // in the mount effect below, the same defensive pattern
  // BirthdaySighting.tsx already uses for its own `visible` state, to
  // avoid a hydration mismatch. Deliberately NOT gated on reduced motion:
  // the star itself should still appear (statically, like every other
  // star under prefers-reduced-motion — see .atmosphere-star's existing
  // reduced-motion rule) even when its one-time arrival glint is skipped.
  const [isBirthday, setIsBirthday] = useState(false);
  const tickCount = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function detectBirthday() {
      const forcedBirthday = new URLSearchParams(window.location.search).get("birthday") === "now";
      setIsBirthday(forcedBirthday || isSeonghwaBirthdayToday());
    }
    detectBirthday();

    function apply() {
      const now = getPreviewDate(new Date(), getAtmospherePreviewMode());
      const night = getNightAmount(now);
      const nightText = getNightTextAmount(night);
      const golden = getGoldenAmount(now);
      const goldenProgress = getGoldenProgress(now);
      const sun = getSolarPosition(now);
      const moon = getMoonPhase(now);
      const rain = getRainAmount(getRainPreviewLevel());
      const style = document.documentElement.style;
      style.setProperty("--night", String(night));
      style.setProperty("--night-text", String(nightText));
      style.setProperty("--golden", String(golden));
      style.setProperty("--golden-progress", String(goldenProgress));
      style.setProperty("--sun-elevation", String(sun.elevation));
      style.setProperty("--sun-x", String(sun.horizontalProgress));
      style.setProperty("--moon-illum", String(moon.illumination));
      style.setProperty("--moon-dir", moon.waxing ? "-1" : "1");
      style.setProperty("--rain", String(rain));
      return night;
    }

    function tick() {
      const night = apply();
      tickCount.current += 1;
      if (reduceMotion) return;

      if (night >= CFG.sparkleMinNight && Math.random() < CFG.sparkleChancePerTick) {
        const spot = SPARKLE_SPOTS[Math.floor(Math.random() * SPARKLE_SPOTS.length)];
        setSparkleSpot(spot);
        window.setTimeout(() => setSparkleSpot(null), CFG.sparkleDurationMs);
      }

      if (
        night >= CFG.shootingStarMinNight &&
        tickCount.current % CFG.shootingStarTickPeriod === 0 &&
        Math.random() < CFG.shootingStarChancePerRoll
      ) {
        setShootingStar(true);
        window.setTimeout(() => setShootingStar(false), CFG.shootingStarDurationMs);
      }
    }

    apply();
    // Arm the CSS transition only now, after the pre-paint script's value
    // has already rendered once with no transition active — see the
    // comment on html.atmosphere-ready in globals.css for why this can't
    // be unconditional.
    document.documentElement.classList.add("atmosphere-ready");
    const interval = window.setInterval(tick, CFG.tickIntervalMs);

    // Re-apply the moment the Sunrise/Night preview toggle changes, rather
    // than leaving the sky to catch up on the next 30s tick — the whole
    // point of a manual preview is an immediate, comparable result. By now
    // atmosphere-ready is already set, so this transitions smoothly (the
    // same 8s/3.5s ease as any other change) instead of snapping.
    const unsubscribePreview = subscribeAtmospherePreviewMode(apply);
    // Rain is a second, independent dev-only override (see
    // atmospherePreview.ts) — re-applies the moment its own preview
    // control changes, same immediacy reasoning as the mode subscription
    // above.
    const unsubscribeRain = subscribeRainPreviewLevel(apply);

    // The site's one scroll-driven value — --scroll-y, consumed only by
    // .atmosphere-midground's parallax transform (globals.css). rAF-
    // throttled so a scroll event never writes to the DOM more than
    // once per frame, and never attached at all under reduced motion
    // (mirrors the reduceMotion gate already used above for sparkles/
    // shooting stars) rather than attaching it and relying on CSS alone
    // to suppress the resulting motion.
    let scrollScheduled = false;
    function onScroll() {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--scroll-y", `${window.scrollY}px`);
        scrollScheduled = false;
      });
    }
    if (!reduceMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", onScroll);
      unsubscribePreview();
      unsubscribeRain();
    };
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-sky" />
      <div className="atmosphere-cosmic" />
      <div className="atmosphere-mid-depth" />
      <div className="atmosphere-midground">
        {MIDGROUND_POSITIONS.map((dot, i) => (
          <span key={i} className="atmosphere-midground-dot" style={{ top: dot.top, left: dot.left }} />
        ))}
      </div>
      <div className="atmosphere-sun" />
      {/* RARE AURORA (Aurora.tsx, DESIGN.md §19) — renders nothing at all
          unless its once-per-session roll succeeded. Placed behind the
          moon and stars so the aurora flows behind them (its screen-blended
          light would otherwise fill in the moon's dark side), and still
          behind the clouds, which are far lower and drift in front. */}
      <Aurora />
      <div className="atmosphere-moon">
        {/* The lit disc is its own circle (border-radius); the parent
            carries the glow filter and no clip — see globals.css. */}
        <div className="atmosphere-moon-lit" />
      </div>
      <div className="atmosphere-stars">
        {STAR_POSITIONS.map((star, i) => (
          <span
            key={i}
            className={`atmosphere-star atmosphere-star--${star.depth}`}
            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
          />
        ))}
        {sparkleSpot && (
          <Glint className="glint-burst" style={{ top: sparkleSpot.top, left: sparkleSpot.left }} />
        )}
        {/* BIRTH OF A STAR (src/lib/birthday.ts) — one extra star, April 3
            KST only, styled with the exact same .atmosphere-star--hero
            class every other hero-tier star already uses (no new
            modifier, no new CSS): it fades in at dawn, recedes through
            daylight/golden hour, and reads as fully part of the night sky
            after dark purely because it shares the field's one opacity
            formula, not because of anything special about this element.
            The Glint beside it is the one "coming into existence" beat —
            a single 별빛팡팡 pop, reusing Glint.tsx exactly as everywhere
            else (no new sparkle shape), that plays once on mount (its
            glint-pop animation is `both`-filled, so it simply stays at
            opacity 0 afterward — no cleanup timer needed) and is already
            hidden under prefers-reduced-motion via .glint's own existing
            reduced-motion rule. */}
        {isBirthday && (
          <>
            <span
              className="atmosphere-star atmosphere-star--hero"
              style={{ top: BORN_STAR_POSITION.top, left: BORN_STAR_POSITION.left }}
            />
            <Glint
              className="glint-burst"
              style={{ position: "absolute", top: BORN_STAR_POSITION.top, left: BORN_STAR_POSITION.left }}
            />
          </>
        )}
      </div>
      <div className="atmosphere-clouds-far" />
      <div className="atmosphere-clouds-mid" />
      <div className="atmosphere-clouds-near" />
      {shootingStar && <div className="atmosphere-shooting-star" style={{ top: "14%", left: "70%" }} />}
      {/* Rain layers intentionally not rendered: the dev rain prototype's
          tilted streaming stripes read as distracting scrolling diagonal
          lines. The rain preview state/CSS remain inert for a future,
          natural implementation. */}
    </div>
  );
}
