"use client";

import { useSyncExternalStore } from "react";
import {
  ATMOSPHERE_PREVIEW_MODES,
  getAtmospherePreviewMode,
  getAtmospherePreviewServerSnapshot,
  setAtmospherePreviewMode,
  subscribeAtmospherePreviewMode,
  type AtmospherePreviewMode,
} from "@/lib/atmospherePreview";

const LABELS: Record<AtmospherePreviewMode, string> = {
  live: "Live",
  sunrise: "Sunrise",
  day: "Day",
  "golden-hour": "Golden Hour",
  sunset: "Sunset",
  night: "Night",
};

/**
 * ✦ A quiet, fixed-position control for previewing all five of the
 * Moonlit Archive's named sky states — sunrise, day, golden hour, sunset,
 * night (getSkyMessagePhase, src/lib/atmosphere.ts) — on demand, without
 * waiting for real local time to reach each one. See atmospherePreview.ts
 * for the override mechanism both Atmosphere.tsx and AtmosphereNote.tsx
 * read: selecting a state here switches the sun's position/appearance,
 * the sky gradient, the moon, the stars, every glow/depth layer, and the
 * footer's own poetic message together, since all of them already read
 * the same override. "Live" returns to the real, continuously-evolving
 * sky (§9, DESIGN.md) — this never replaces that default, only offers a
 * way to jump to and compare its states side by side.
 *
 * Development-only: gated out of the tree entirely in layout.tsx
 * (`process.env.NODE_ENV !== "production"`), so this is never part of
 * the public STARHWA experience — a debug/preview affordance, not a
 * feature.
 *
 * useSyncExternalStore (rather than a mount-gate + useState) is what
 * keeps this hydration-safe despite reading localStorage: it renders the
 * "live" server snapshot on first paint, then re-syncs to the real stored
 * mode right after hydration — the standard pattern for this exact
 * scenario.
 */
export default function AtmospherePreviewToggle() {
  const mode = useSyncExternalStore(
    subscribeAtmospherePreviewMode,
    getAtmospherePreviewMode,
    getAtmospherePreviewServerSnapshot
  );

  return (
    <div
      className="atmosphere-preview-toggle"
      role="group"
      aria-label="Preview the Moonlit Archive at a different time of day"
    >
      <span className="meta text-charcoal/60">Preview</span>
      <div className="atmosphere-preview-toggle-options">
        {ATMOSPHERE_PREVIEW_MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setAtmospherePreviewMode(m)}
            aria-pressed={mode === m}
            className="atmosphere-preview-toggle-btn"
            data-active={mode === m}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
