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

/**
 * Approximate representative latitude per IANA timezone, for the sunrise/
 * sunset calculation below. This is the one deliberate approximation in
 * that calculation — true precision would need the visitor's real GPS
 * coordinates (a permission-prompting Geolocation API call, or an
 * external geolocation service), neither of which fits a quiet decorative
 * feature. A timezone name is available with zero permission prompt and
 * zero network request via Intl, and gets us close enough. Not exhaustive
 * — common zones only, with a sensible default for anything else.
 */
const TIMEZONE_LATITUDES: Record<string, number> = {
  "America/Los_Angeles": 34,
  "America/Denver": 39.7,
  "America/Chicago": 41.9,
  "America/New_York": 40.7,
  "America/Toronto": 43.7,
  "America/Vancouver": 49.3,
  "America/Mexico_City": 19.4,
  "America/Sao_Paulo": -23.5,
  "America/Argentina/Buenos_Aires": -34.6,
  "Europe/London": 51.5,
  "Europe/Dublin": 53.3,
  "Europe/Paris": 48.9,
  "Europe/Berlin": 52.5,
  "Europe/Madrid": 40.4,
  "Europe/Rome": 41.9,
  "Europe/Amsterdam": 52.4,
  "Europe/Moscow": 55.8,
  "Europe/Istanbul": 41.0,
  "Asia/Seoul": 37.6,
  "Asia/Tokyo": 35.7,
  "Asia/Shanghai": 31.2,
  "Asia/Hong_Kong": 22.3,
  "Asia/Taipei": 25.0,
  "Asia/Singapore": 1.35,
  "Asia/Manila": 14.6,
  "Asia/Bangkok": 13.8,
  "Asia/Jakarta": -6.2,
  "Asia/Kolkata": 28.6,
  "Asia/Dubai": 25.3,
  "Australia/Sydney": -33.9,
  "Australia/Melbourne": -37.8,
  "Australia/Perth": -31.9,
  "Pacific/Auckland": -36.8,
  "Africa/Cairo": 30.0,
  "Africa/Johannesburg": -26.2,
  "Africa/Lagos": 6.5,
};

/** Fallback for any timezone not in the table above. */
const DEFAULT_LATITUDE = 35;

function getApproxLatitude(): number {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && tz in TIMEZONE_LATITUDES) return TIMEZONE_LATITUDES[tz];
  } catch {
    // Intl unavailable for some reason — fall through to the default.
  }
  return DEFAULT_LATITUDE;
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export interface SunTimes {
  /** Decimal local-clock hours (e.g. 6.5 = 6:30am). */
  sunrise: number;
  sunset: number;
}

/**
 * Real sunrise/sunset for the given date — the standard solar-
 * declination/hour-angle formula, not a lookup table or an external
 * service. The only approximation is the latitude input (see
 * TIMEZONE_LATITUDES above); the astronomy itself, and the equation-of-
 * time/exact-longitude corrections it skips, put this within roughly
 * ±30–45 minutes of true local sunrise/sunset — appropriate for a
 * decorative atmosphere, not a solar calculator (the same precision
 * philosophy as getMoonPhase below).
 */
export function getSunTimes(date: Date): SunTimes {
  const latRad = (getApproxLatitude() * Math.PI) / 180;
  const n = dayOfYear(date);
  const declRad = ((23.44 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (n - 81));
  const cosH = Math.min(1, Math.max(-1, -Math.tan(latRad) * Math.tan(declRad)));
  const hourAngleHours = (Math.acos(cosH) * 180) / Math.PI / 15;
  return {
    sunrise: 12 - hourAngleHours,
    sunset: 12 + hourAngleHours,
  };
}

/**
 * 0 (full day) → 1 (full night), continuous. Drives background tokens.
 * Ramps around the real sunrise/sunset above rather than fixed clock
 * hours, so Golden Hour (getGoldenAmount below) — which shares the same
 * sun times — lines up with it at any time of year instead of drifting
 * out of sync by season.
 */
export function getNightAmount(date: Date): number {
  const { sunrise, sunset } = getSunTimes(date);
  const h = hourOfDay(date);

  // Same ramp widths as the original fixed-hour curve (2.5h dusk, 2h
  // dawn) — only the center moved from a fixed guess to the real event.
  const dawnStart = Math.max(0.01, sunrise - 0.75);
  const dawnEnd = Math.min(23.99, sunrise + 1.25);
  const duskStart = Math.max(dawnEnd + 0.01, sunset - 1.5);
  const duskEnd = Math.min(23.99, sunset + 1.0);

  const curve: [number, number][] = [
    [0, 1],
    [dawnStart, 1],
    [dawnEnd, 0],
    [duskStart, 0],
    [duskEnd, 1],
    [24, 1],
  ];

  for (let i = 0; i < curve.length - 1; i++) {
    const [h0, a0] = curve[i];
    const [h1, a1] = curve[i + 1];
    if (h >= h0 && h <= h1) {
      const t = h1 === h0 ? 0 : (h - h0) / (h1 - h0);
      return a0 + (a1 - a0) * t;
    }
  }
  return 1;
}

function triangleBump(h: number, center: number, halfWidthHours: number): number {
  return Math.max(0, 1 - Math.abs(h - center) / halfWidthHours);
}

/**
 * 0 → 1 → 0, a gentle bump (not a monotonic ramp like getNightAmount)
 * peaking shortly before sunset and shortly after sunrise — the warm
 * "golden hour" window, fully 0 well before it and well after it settles
 * into ordinary day or night. Deliberately independent of --night (see
 * globals.css): it only ever nudges the background tokens, never text.
 */
export function getGoldenAmount(date: Date): number {
  const { sunrise, sunset } = getSunTimes(date);
  const h = hourOfDay(date);
  const evening = triangleBump(h, sunset - 0.4, 1.0);
  const morning = triangleBump(h, sunrise + 0.3, 1.0);
  return Math.max(evening, morning);
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
