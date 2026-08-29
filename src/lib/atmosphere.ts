/**
 * ✦ The Moonlit Archive — pure time-of-day math, no framework dependencies.
 * Consumed by Atmosphere.tsx (visual layer) and AtmosphereNote.tsx
 * (microcopy), each on their own timer — see those files for why this
 * stays framework-free and isn't wrapped in a shared context.
 *
 * All of this is necessarily client-only: only the visitor's browser
 * knows their local time. See the inline pre-paint script in layout.tsx
 * for why getNightAmount/getNightTextAmount are also duplicated there in
 * plain JS (an inline <script> can't import this module).
 */

function hourOfDay(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

/** (hour, night amount) anchor points, piecewise-linear between them. */
const NIGHT_CURVE: [hour: number, amount: number][] = [
  [0, 1],
  [5, 1],
  [7, 0],
  [17, 0],
  [19.5, 1],
  [24, 1],
];

/** 0 (full day) → 1 (full night), continuous. Drives background tokens. */
export function getNightAmount(date: Date): number {
  const h = hourOfDay(date);
  for (let i = 0; i < NIGHT_CURVE.length - 1; i++) {
    const [h0, a0] = NIGHT_CURVE[i];
    const [h1, a1] = NIGHT_CURVE[i + 1];
    if (h >= h0 && h <= h1) {
      const t = h1 === h0 ? 0 : (h - h0) / (h1 - h0);
      return a0 + (a1 - a0) * t;
    }
  }
  return 1;
}

/**
 * Steepened version of nightAmount for foreground/text tokens — swaps them
 * through the low-contrast midpoint quickly instead of blending in lockstep
 * with the background the whole time. See the plan's "known accepted
 * trade-off" note for why this exists and its limits.
 */
export function getNightTextAmount(nightAmount: number): number {
  return Math.min(1, Math.max(0, (nightAmount - 0.48) / 0.14));
}

export type AtmospherePhase =
  | "very-late"
  | "dawn"
  | "morning"
  | "day"
  | "sunset"
  | "evening"
  | "late-night";

/** (hour, phase) — last boundary at or before the current hour wins. */
const PHASE_BOUNDARIES: [hour: number, phase: AtmospherePhase][] = [
  [0, "very-late"],
  [5, "dawn"],
  [6.5, "morning"],
  [10, "day"],
  [17, "sunset"],
  [19, "evening"],
  [22, "late-night"],
];

export function getTimePhase(date: Date): AtmospherePhase {
  const h = hourOfDay(date);
  let phase: AtmospherePhase = "very-late";
  for (const [boundary, p] of PHASE_BOUNDARIES) {
    if (h >= boundary) phase = p;
  }
  return phase;
}

export const PHASE_MESSAGES: Record<AtmospherePhase, string> = {
  "very-late": "Psst... the archive is still awake.",
  dawn: "The stars are going home. 🌅",
  morning: "The shelves are waking up. ☀️",
  day: "Come in, there's always room among the stars. ✦",
  sunset: "The day is folding itself away... 🌅",
  evening: "The moon has found the archive. 🌙",
  "late-night": "Still wandering? So are we. ✦",
};

export type MoonPhaseName =
  | "new"
  | "waxing-crescent"
  | "first-quarter"
  | "waxing-gibbous"
  | "full"
  | "waning-gibbous"
  | "last-quarter"
  | "waning-crescent";

export interface MoonPhase {
  /** 0 (new, unlit) → 1 (full, fully lit), continuous. */
  illumination: number;
  /** Waxing (growing toward full) vs waning (shrinking toward new) — the
   * visible sky layer uses this to decide which side of the disc the lit
   * crescent/gibbous grows from. */
  waxing: boolean;
  phaseName: MoonPhaseName;
}

/** Average lunar synodic month (new moon to new moon), in days. */
const SYNODIC_MONTH_DAYS = 29.530588853;

/**
 * A known new moon (2000-01-06 18:14 UTC) — the standard reference epoch
 * this kind of "days since a known new moon, mod the synodic month"
 * calculation is anchored to. Not a lookup table of phases: everything
 * past this one fixed point is computed from the date, so it stays
 * correct indefinitely rather than needing yearly-updated phase dates.
 * Accurate to within roughly a day of the true phase (the real lunar
 * cycle has small eccentricity-driven variation this simple model
 * doesn't attempt to capture) — appropriate for a decorative sky, not a
 * navigation instrument.
 */
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

/**
 * Real lunar phase for the given date, from first principles (age since
 * a known new moon, mod the synodic month) — no external API, no
 * per-year lookup table.
 */
export function getMoonPhase(date: Date): MoonPhase {
  const ageDays = (date.getTime() - KNOWN_NEW_MOON_UTC) / 86_400_000;
  const cyclePosition =
    (((ageDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS) /
    SYNODIC_MONTH_DAYS; // 0 (new) .. 0.5 (full) .. 1 (new again)

  const theta = cyclePosition * 2 * Math.PI;
  const illumination = (1 - Math.cos(theta)) / 2;
  const waxing = cyclePosition < 0.5;

  let phaseName: MoonPhaseName;
  if (cyclePosition < 0.02 || cyclePosition > 0.98) phaseName = "new";
  else if (cyclePosition < 0.24) phaseName = "waxing-crescent";
  else if (cyclePosition < 0.26) phaseName = "first-quarter";
  else if (cyclePosition < 0.49) phaseName = "waxing-gibbous";
  else if (cyclePosition < 0.51) phaseName = "full";
  else if (cyclePosition < 0.74) phaseName = "waning-gibbous";
  else if (cyclePosition < 0.76) phaseName = "last-quarter";
  else phaseName = "waning-crescent";

  return { illumination, waxing, phaseName };
}

/** Rare-effect knobs for Atmosphere.tsx's sparkle/shooting-star rolls. */
export const ATMOSPHERE_CONFIG = {
  /** How often Atmosphere.tsx re-evaluates everything. */
  tickIntervalMs: 30_000,
  /** Only roll sparkle/shooting-star chance once night is essentially full. */
  sparkleMinNight: 0.92,
  shootingStarMinNight: 0.95,
  /** Rolled every tick. */
  sparkleChancePerTick: 0.08,
  /** Rolled only every Nth tick (shootingStarTickPeriod * tickIntervalMs ≈ 5min). */
  shootingStarTickPeriod: 10,
  shootingStarChancePerRoll: 0.05,
  sparkleDurationMs: 900,
  shootingStarDurationMs: 1100,
};
