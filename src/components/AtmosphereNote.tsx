"use client";

import { useEffect, useRef, useState } from "react";
import { getSkyMessagePhase, SKY_MESSAGES, type SkyMessagePhase } from "@/lib/atmosphere";
import {
  getAtmospherePreviewMode,
  getPreviewDate,
  subscribeAtmospherePreviewMode,
} from "@/lib/atmospherePreview";

// A slow, rare beat — the message changes only a handful of times a day —
// not ordinary UI feedback, so it sits with DESIGN.md §6's other few named
// exceptions to the site's normal 150–300ms transitions rather than
// reusing that cap.
const CROSSFADE_MS = 2200;

/**
 * ✦ The Moonlit Archive's one piece of time-aware microcopy — a single
 * quiet line, not a message on every clock tick. `getSkyMessagePhase`
 * (src/lib/atmosphere.ts) is a categorical view over the exact same
 * getGoldenAmount/getSolarPosition/getNightAmount values that already
 * drive the sky's own color, the sun disc, and the moon — no second
 * time-of-day system. Recomputed every few minutes; phase buckets only
 * change a handful of times a day, so this doesn't need to share a timer
 * with Atmosphere.tsx's finer-grained one.
 *
 * The outgoing message is kept mounted, absolutely positioned over the
 * incoming one, and both cross-fade opacity together over
 * CROSSFADE_MS — a real crossfade (old dissolving as new arrives), not
 * an abrupt text swap. The incoming message stays in normal flow the
 * whole time, so the footer's own layout never depends on which
 * message is currently showing.
 */
export default function AtmosphereNote() {
  const [phase, setPhase] = useState<SkyMessagePhase | null>(null);
  const [leaving, setLeaving] = useState<{ key: number; phase: SkyMessagePhase } | null>(null);
  const phaseRef = useRef<SkyMessagePhase | null>(null);
  const leavingKey = useRef(0);

  useEffect(() => {
    function update() {
      const next = getSkyMessagePhase(getPreviewDate(new Date(), getAtmospherePreviewMode()));
      if (next === phaseRef.current) return;
      if (phaseRef.current !== null) {
        const key = ++leavingKey.current;
        setLeaving({ key, phase: phaseRef.current });
        window.setTimeout(() => {
          setLeaving((current) => (current?.key === key ? null : current));
        }, CROSSFADE_MS);
      }
      phaseRef.current = next;
      setPhase(next);
    }
    update();
    const interval = window.setInterval(update, 5 * 60 * 1000);
    // Same immediate-response reasoning as Atmosphere.tsx's own subscription.
    const unsubscribePreview = subscribeAtmospherePreviewMode(update);
    return () => {
      window.clearInterval(interval);
      unsubscribePreview();
    };
  }, []);

  if (!phase) return null;

  return (
    <p className="atmosphere-note relative meta text-charcoal/60">
      {leaving && (
        <span
          key={leaving.key}
          aria-hidden="true"
          className="atmosphere-note__layer atmosphere-note__layer--leaving"
        >
          {SKY_MESSAGES[leaving.phase]} <span className="atmosphere-note__star">✦</span>
        </span>
      )}
      <span key={phase} className="atmosphere-note__layer atmosphere-note__layer--entering">
        {SKY_MESSAGES[phase]} <span className="atmosphere-note__star">✦</span>
      </span>
    </p>
  );
}
