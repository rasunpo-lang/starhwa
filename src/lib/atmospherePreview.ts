/**
 * ✦ Moonlit Archive — manual preview override, for judging every named
 * sky state (getSkyMessagePhase's five: sunrise/day/golden-hour/sunset/
 * night — src/lib/atmosphere.ts) on demand instead of waiting for real
 * local time to reach it. Purely a viewing aid: it never touches the
 * astronomy in atmosphere.ts, only which Date that astronomy runs
 * against. Atmosphere.tsx and AtmosphereNote.tsx both read the same
 * override (via getPreviewDate) so the sky, sun, moon, stars, and the
 * footer's phase microcopy all switch together — never one and not the
 * other. AtmospherePreviewToggle.tsx is the one UI that writes to it, and
 * it's a development-only affordance (gated out of production entirely in
 * layout.tsx) — this module itself has no such gate, since the override
 * mechanism is harmless to ship (it does nothing unless something calls
 * setAtmospherePreviewMode) and Atmosphere.tsx/AtmosphereNote.tsx need to
 * keep reading it unconditionally either way.
 *
 * Plain module-level state + a tiny pub/sub, not React context: the two
 * consumers already each run their own independent timer (see the
 * comment atop atmosphere.ts for why they stay decoupled), and this
 * needs to reach both without threading a provider through layout.tsx
 * for what's a debug/preview affordance, not real page state.
 */

import { getSunTimes, GOLDEN_MORNING_CENTER_OFFSET } from "@/lib/atmosphere";

export type AtmospherePreviewMode = "live" | "sunrise" | "day" | "golden-hour" | "sunset" | "night";

export const ATMOSPHERE_PREVIEW_MODES: AtmospherePreviewMode[] = [
  "live",
  "sunrise",
  "day",
  "golden-hour",
  "sunset",
  "night",
];

const STORAGE_KEY = "starhwa-atmosphere-preview";

/** Solar noon-ish — safely deep day (well clear of the dawn/dusk ramps
 * and of Golden Hour's own window either side of it) at every latitude in
 * atmosphere.ts's TIMEZONE_LATITUDES table, without needing a second
 * astronomy call just to prove it — added specifically so Day can be
 * judged against Sunrise/Night on demand (DESIGN.md §16), the same way
 * those two already could be. */
const DAY_PREVIEW_HOUR = 12;

/** 2am local — safely deep night (well past the ~2h dusk/dawn ramps in
 * getNightAmount) at every latitude in atmosphere.ts's TIMEZONE_LATITUDES
 * table, without needing a second astronomy call just to prove it. */
const NIGHT_PREVIEW_HOUR = 2;

/** Both new modes land inside the *same* evening Golden Hour window
 * getGoldenAmount/getSkyMessagePhase already use (centered at
 * sunset - 0.4h, ±1h half-width — see GOLDEN_EVENING_CENTER_OFFSET in
 * atmosphere.ts): one comfortably before the real sunset instant
 * (elevation still positive — the sun is up, the light is warm —
 * "golden-hour"), one comfortably after it (elevation already negative —
 * the sun itself is gone, the sky is what's still glowing — "sunset"),
 * exactly the same elevation-sign split getSkyMessagePhase itself makes
 * at the real sunset crossing. Not a second astronomical model — both
 * offsets are measured straight from the real sunset time getSunTimes
 * already returns, and both land safely inside the existing window
 * (which spans sunset - 1.4h to sunset + 0.6h). */
const GOLDEN_HOUR_PREVIEW_OFFSET_HOURS = -0.8;
const SUNSET_PREVIEW_OFFSET_HOURS = 0.3;

let mode: AtmospherePreviewMode = "live";
let hydrated = false;
const listeners = new Set<() => void>();

function isValidMode(value: string | null): value is AtmospherePreviewMode {
  return value !== null && (ATMOSPHERE_PREVIEW_MODES as string[]).includes(value);
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isValidMode(stored)) mode = stored;
  } catch {
    // localStorage unavailable (private mode, disabled storage) — stay "live".
  }
}

export function getAtmospherePreviewMode(): AtmospherePreviewMode {
  hydrate();
  return mode;
}

/** Server/first-paint snapshot for useSyncExternalStore — always "live",
 * matching the pre-paint script in layout.tsx, which has no knowledge of
 * this override. Real preview modes only ever apply after mount. */
export function getAtmospherePreviewServerSnapshot(): AtmospherePreviewMode {
  return "live";
}

export function setAtmospherePreviewMode(next: AtmospherePreviewMode) {
  hydrate();
  if (mode === next) return;
  mode = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Preview choice just won't survive a reload — non-fatal.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeAtmospherePreviewMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * ✦ RAIN PREVIEW — a second, independent dev-only override, deliberately
 * kept separate from AtmospherePreviewMode above rather than folded into
 * it: rain is not a time-of-day state (it doesn't replace Sunrise/Day/
 * Golden Hour/Sunset/Night, it composes with whichever of those is
 * currently showing), so it gets its own storage key, its own tiny
 * pub/sub, and its own snapshot function — mirroring the mode override's
 * shape exactly rather than inventing a different one. Nothing here
 * touches getPreviewDate or any astronomy in atmosphere.ts; it only ever
 * feeds --rain (see globals.css), a signal those files don't read.
 */
export type RainPreviewLevel = "off" | "light" | "moderate";

export const RAIN_PREVIEW_LEVELS: RainPreviewLevel[] = ["off", "light", "moderate"];

const RAIN_STORAGE_KEY = "starhwa-atmosphere-rain-preview";

/** off → 0 (no --rain layer visible at all, the only state production
 * ever sees today), light/moderate → the two dev-preview intensities
 * .atmosphere-rain-far/-near's opacity formulas scale by (globals.css). */
const RAIN_AMOUNTS: Record<RainPreviewLevel, number> = {
  off: 0,
  light: 0.5,
  moderate: 1,
};

let rainLevel: RainPreviewLevel = "off";
let rainHydrated = false;
const rainListeners = new Set<() => void>();

function isValidRainLevel(value: string | null): value is RainPreviewLevel {
  return value !== null && (RAIN_PREVIEW_LEVELS as string[]).includes(value);
}

function hydrateRain() {
  if (rainHydrated || typeof window === "undefined") return;
  rainHydrated = true;
  try {
    const stored = window.localStorage.getItem(RAIN_STORAGE_KEY);
    if (isValidRainLevel(stored)) rainLevel = stored;
  } catch {
    // localStorage unavailable (private mode, disabled storage) — stay "off".
  }
}

export function getRainPreviewLevel(): RainPreviewLevel {
  hydrateRain();
  return rainLevel;
}

/** Server/first-paint snapshot — always "off", matching production's only
 * value (no rain layer) until a real weather source exists. */
export function getRainPreviewServerSnapshot(): RainPreviewLevel {
  return "off";
}

export function setRainPreviewLevel(next: RainPreviewLevel) {
  hydrateRain();
  if (rainLevel === next) return;
  rainLevel = next;
  try {
    window.localStorage.setItem(RAIN_STORAGE_KEY, next);
  } catch {
    // Preview choice just won't survive a reload — non-fatal.
  }
  rainListeners.forEach((listener) => listener());
}

export function subscribeRainPreviewLevel(listener: () => void): () => void {
  rainListeners.add(listener);
  return () => rainListeners.delete(listener);
}

/** The numeric --rain value for the current preview level — see
 * RAIN_AMOUNTS above. */
export function getRainAmount(level: RainPreviewLevel): number {
  return RAIN_AMOUNTS[level];
}

function setLocalHour(date: Date, decimalHour: number) {
  const wrapped = ((decimalHour % 24) + 24) % 24;
  const h = Math.floor(wrapped);
  const m = Math.round((wrapped - h) * 60);
  date.setHours(h, m, 0, 0);
}

/**
 * The Date every astronomy call in atmosphere.ts should actually run
 * against. In "live" mode this is just realNow. Every other mode is a
 * synthetic moment on today's real date/timezone (so latitude,
 * day-of-year, and DST all stay correct — only the clock hour is
 * forced), landing exactly on the same instants getSkyMessagePhase
 * itself would categorize into that state — a fully-settled state to
 * look at, not an ambiguous in-between instant.
 */
export function getPreviewDate(realNow: Date, previewMode: AtmospherePreviewMode): Date {
  if (previewMode === "live") return realNow;
  const preview = new Date(realNow);
  const { sunrise, sunset } = getSunTimes(realNow);
  if (previewMode === "sunrise") {
    setLocalHour(preview, sunrise + GOLDEN_MORNING_CENTER_OFFSET);
  } else if (previewMode === "day") {
    setLocalHour(preview, DAY_PREVIEW_HOUR);
  } else if (previewMode === "golden-hour") {
    setLocalHour(preview, sunset + GOLDEN_HOUR_PREVIEW_OFFSET_HOURS);
  } else if (previewMode === "sunset") {
    setLocalHour(preview, sunset + SUNSET_PREVIEW_OFFSET_HOURS);
  } else {
    setLocalHour(preview, NIGHT_PREVIEW_HOUR);
  }
  return preview;
}
