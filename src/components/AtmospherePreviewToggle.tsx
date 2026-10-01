"use client";

import { useSyncExternalStore } from "react";
import {
  ATMOSPHERE_PREVIEW_MODES,
  RAIN_PREVIEW_LEVELS,
  getAtmospherePreviewMode,
  getAtmospherePreviewServerSnapshot,
  getRainPreviewLevel,
  getRainPreviewServerSnapshot,
  setAtmospherePreviewMode,
  setRainPreviewLevel,
  subscribeAtmospherePreviewMode,
  subscribeRainPreviewLevel,
  type AtmospherePreviewMode,
  type RainPreviewLevel,
} from "@/lib/atmospherePreview";

const LABELS: Record<AtmospherePreviewMode, string> = {
  live: "Live",
  sunrise: "Sunrise",
  day: "Day",
  "golden-hour": "Golden Hour",
  sunset: "Sunset",
  night: "Night",
};

const RAIN_LABELS: Record<RainPreviewLevel, string> = {
  off: "Off",
  light: "Light",
  moderate: "Moderate",
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
 *
 * A second, independent row previews RAIN (dev-only prototype — see
 * atmospherePreview.ts/Atmosphere.tsx): Off/Light/Moderate, its own
 * override with its own storage key and pub/sub, deliberately not a
 * seventh option folded into the sky-state row above — rain composes
 * with whichever sky state is showing rather than replacing it, so
 * picking "Night" up top and "Moderate" down here previews rain falling
 * through a real night sky, not a separate "rainy" preset.
 */
export default function AtmospherePreviewToggle() {
  const mode = useSyncExternalStore(
    subscribeAtmospherePreviewMode,
    getAtmospherePreviewMode,
    getAtmospherePreviewServerSnapshot
  );
  const rain = useSyncExternalStore(
    subscribeRainPreviewLevel,
    getRainPreviewLevel,
    getRainPreviewServerSnapshot
  );

  return (
    <div className="atmosphere-preview-toggle">
      <div
        className="atmosphere-preview-toggle-row"
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
      <div className="atmosphere-preview-toggle-row" role="group" aria-label="Preview rain">
        <span className="meta text-charcoal/60">Rain</span>
        <div className="atmosphere-preview-toggle-options">
          {RAIN_PREVIEW_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setRainPreviewLevel(level)}
              aria-pressed={rain === level}
              className="atmosphere-preview-toggle-btn"
              data-active={rain === level}
            >
              {RAIN_LABELS[level]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
