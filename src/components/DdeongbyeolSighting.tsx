"use client";

import { useEffect, useState } from "react";
import Ddeongbyeol from "./Ddeongbyeol";
import Glint from "./Glint";
import { DDEONGBYEOL_CONFIG as CFG } from "@/lib/ddeongbyeol";

const STORAGE_KEY = "starhwa:ddeongbyeol:lastSeen";

/**
 * PROTOTYPE — a rare, unprompted "sighting" of 떵별이 (DDEONGbyeoli,
 * Seonghwa's ANITEEZ bunny mascot — see Ddeongbyeol.tsx) in the
 * bottom-left corner: he peeks into view, a few 별빛팡팡 glints (STARHWA's
 * own starlight motif, Glint.tsx) catch up to him, he lingers briefly,
 * then floats away and disappears. The two stay visually distinct —
 * he's a character, they're an effect — orbiting rather than merging.
 * Never visible on demand by the visitor — only chance + a cooldown
 * decide when it shows (see src/lib/ddeongbyeol.ts for the knobs).
 * Mounted once, in layout.tsx, so it can surface on any page during
 * normal browsing.
 *
 * Demo aid, not a shipped feature: visiting with `?ddeongbyeol=now` in
 * the URL forces an immediate sighting, bypassing chance and cooldown,
 * so the interaction can be reviewed on demand. Safe to remove once the
 * concept is settled.
 */
export default function DdeongbyeolSighting() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function trigger() {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setVisible(true);
      window.setTimeout(() => setVisible(false), CFG.sightingDurationMs);
    }

    if (new URLSearchParams(window.location.search).get("ddeongbyeol") === "now") {
      trigger();
      return;
    }

    function offCooldown() {
      const last = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
      return Date.now() - last >= CFG.cooldownMs;
    }

    const interval = window.setInterval(() => {
      if (offCooldown() && Math.random() < CFG.triggerChance) trigger();
    }, CFG.checkIntervalMs);

    return () => window.clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="ddeongbyeol-sighting" aria-hidden="true">
      <Ddeongbyeol className="ddeongbyeol-sighting-figure" />
      <Glint
        className="glint-burst ddeongbyeol-glint-a"
        style={{ animationDelay: "550ms" }}
      />
      <Glint
        className="glint-burst ddeongbyeol-glint-b"
        style={{ animationDelay: "720ms" }}
      />
      <Glint
        className="glint-burst ddeongbyeol-glint-c"
        style={{ animationDelay: "900ms" }}
      />
    </div>
  );
}
