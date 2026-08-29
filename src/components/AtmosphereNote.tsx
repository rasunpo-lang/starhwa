"use client";

import { useEffect, useState } from "react";
import { getTimePhase, PHASE_MESSAGES, type AtmospherePhase } from "@/lib/atmosphere";

/**
 * ✦ The Moonlit Archive's one piece of time-aware microcopy — a single
 * quiet line, not a message on every clock tick. Recomputed every few
 * minutes; phase buckets only change a handful of times a day, so this
 * doesn't need to share a timer with Atmosphere.tsx's finer-grained one.
 */
export default function AtmosphereNote() {
  const [phase, setPhase] = useState<AtmospherePhase | null>(null);

  useEffect(() => {
    function update() {
      setPhase(getTimePhase(new Date()));
    }
    update();
    const interval = window.setInterval(update, 5 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (!phase) return null;

  return <p className="meta text-charcoal/60">{PHASE_MESSAGES[phase]}</p>;
}
