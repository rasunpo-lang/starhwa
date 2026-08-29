"use client";

import { useEffect, useRef, useState } from "react";
import Glint from "./Glint";
import {
  ATMOSPHERE_CONFIG as CFG,
  getMoonPhase,
  getNightAmount,
  getNightTextAmount,
} from "@/lib/atmosphere";

/**
 * ✦ The Moonlit Archive — the visual half of the day/night atmosphere.
 * The actual color shift happens in globals.css (color-mix() blends
 * driven by the --night/--night-text custom properties this component
 * sets on <html>); this component is only responsible for keeping those
 * two values current, plus rendering the purely decorative sky layer
 * (moon, stars, rare sparkle/shooting star) on top of it. The moon's
 * shape itself tracks the real lunar phase (getMoonPhase in
 * src/lib/atmosphere.ts) via --moon-illum/--moon-dir, rendered in CSS as
 * two overlapping discs (see .atmosphere-moon-lit/-shadow) rather than
 * an SVG terminator path. See DESIGN.md for the full rationale.
 *
 * Not a "creature" feature — see DdeongbyeolSighting.tsx for that
 * (untouched by this component). The sky layer here is deliberately
 * inert scenery, kept as separate moon/stars/sparkle pieces so a future
 * wandering creature could eventually be layered in without a rewrite.
 */

/* Hand-placed, not random — keeps star positions deterministic across
   server/client so this component could later render without a mount
   gate if needed, and avoids a "reshuffling" effect on every reload. */
const STAR_POSITIONS: { top: string; left: string; delay: string }[] = [
  { top: "6%", left: "12%", delay: "0s" },
  { top: "14%", left: "28%", delay: "1.2s" },
  { top: "9%", left: "44%", delay: "2.4s" },
  { top: "22%", left: "6%", delay: "0.6s" },
  { top: "18%", left: "62%", delay: "3.1s" },
  { top: "28%", left: "38%", delay: "1.8s" },
  { top: "11%", left: "78%", delay: "2.9s" },
  { top: "34%", left: "18%", delay: "0.3s" },
  { top: "16%", left: "90%", delay: "3.6s" },
  { top: "40%", left: "55%", delay: "1.5s" },
  { top: "5%", left: "58%", delay: "2.1s" },
  { top: "31%", left: "82%", delay: "0.9s" },
  { top: "24%", left: "72%", delay: "3.3s" },
  { top: "44%", left: "10%", delay: "1.1s" },
  { top: "38%", left: "94%", delay: "2.6s" },
  { top: "8%", left: "34%", delay: "0.4s" },
  { top: "46%", left: "30%", delay: "3.9s" },
  { top: "20%", left: "48%", delay: "1.9s" },
];

const SPARKLE_SPOTS = [
  { top: "15%", left: "22%" },
  { top: "10%", left: "50%" },
  { top: "26%", left: "70%" },
  { top: "35%", left: "40%" },
];

export default function Atmosphere() {
  const [sparkleSpot, setSparkleSpot] = useState<{ top: string; left: string } | null>(null);
  const [shootingStar, setShootingStar] = useState(false);
  const tickCount = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function apply() {
      const now = new Date();
      const night = getNightAmount(now);
      const nightText = getNightTextAmount(night);
      const moon = getMoonPhase(now);
      const style = document.documentElement.style;
      style.setProperty("--night", String(night));
      style.setProperty("--night-text", String(nightText));
      style.setProperty("--moon-illum", String(moon.illumination));
      style.setProperty("--moon-dir", moon.waxing ? "-1" : "1");
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
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere-moon">
        <div className="atmosphere-moon-lit" />
        <div className="atmosphere-moon-shadow" />
      </div>
      <div className="atmosphere-stars">
        {STAR_POSITIONS.map((star, i) => (
          <span
            key={i}
            className="atmosphere-star"
            style={{ top: star.top, left: star.left, animationDelay: star.delay }}
          />
        ))}
        {sparkleSpot && (
          <Glint className="glint-burst" style={{ top: sparkleSpot.top, left: sparkleSpot.left }} />
        )}
      </div>
      {shootingStar && <div className="atmosphere-shooting-star" style={{ top: "14%", left: "70%" }} />}
    </div>
  );
}
