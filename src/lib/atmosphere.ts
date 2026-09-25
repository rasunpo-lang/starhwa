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

/**
 * Whether the visitor's local timezone is currently observing Daylight
 * Saving Time. Standard technique: DST is whichever of the year's two
 * offset extremes (Jan 1, Jul 1) is *smaller* — clocks move forward, so
 * getTimezoneOffset() (minutes to add to local time to reach UTC) drops
 * — compared against today's actual offset. Works for any DST-observing
 * timezone in either hemisphere without needing our own rule table,
 * because it reads the offset the runtime's Intl/Date implementation has
 * already resolved for the visitor's real timezone.
 */
function isDaylightSaving(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
  const standardOffset = Math.max(jan, jul);
  return date.getTimezoneOffset() < standardOffset;
}

export interface SunTimes {
  /** Decimal local-clock hours (e.g. 6.5 = 6:30am). */
  sunrise: number;
  sunset: number;
}

/**
 * Real sunrise/sunset for the given date — the standard solar-
 * declination/hour-angle formula, not a lookup table or an external
 * service. The core astronomy assumes solar noon falls at local clock
 * hour 12, which is only true under Standard Time — during Daylight
 * Saving Time, clocks move forward but the sun doesn't, so solar noon
 * actually falls around clock hour 13. Without correcting for that,
 * this returned sunrise/sunset roughly an hour early for the ~8 months a
 * year most DST-observing regions spend in DST (confirmed against real
 * Vancouver sunset: the uncorrected formula landed over an hour early on
 * 2026-09-02) — not a minor imprecision, a systematic one-directional
 * error on top of the approximation below. isDaylightSaving() adds that
 * hour back whenever it's in effect, using the visitor's own resolved
 * timezone rules rather than a hardcoded DST calendar. What's left after
 * that — the latitude input (see TIMEZONE_LATITUDES above), and the
 * equation-of-time/exact-longitude corrections the astronomy itself
 * skips — puts this within roughly ±30–45 minutes of true local sunrise/
 * sunset — appropriate for a decorative atmosphere, not a solar
 * calculator (the same precision philosophy as getMoonPhase below).
 */
export function getSunTimes(date: Date): SunTimes {
  const latRad = (getApproxLatitude() * Math.PI) / 180;
  const n = dayOfYear(date);
  const declRad = ((23.44 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (n - 81));
  const cosH = Math.min(1, Math.max(-1, -Math.tan(latRad) * Math.tan(declRad)));
  const hourAngleHours = (Math.acos(cosH) * 180) / Math.PI / 15;
  const solarNoon = isDaylightSaving(date) ? 13 : 12;
  return {
    sunrise: solarNoon - hourAngleHours,
    sunset: solarNoon + hourAngleHours,
  };
}

export interface SolarPosition {
  /** Degrees above (+) or below (−) the horizon — 0 exactly at the
   * horizon, negative before sunrise/after sunset. */
  elevation: number;
  /** 0 (sunrise, east) → 1 (sunset, west) — a simplified east-to-west
   * sweep fraction across the day's actual sunrise/sunset span, not a
   * true compass azimuth (the same decorative-precision philosophy as
   * the rest of this module; see getSunTimes). Meaningless outside
   * daylight hours, but harmless there since elevation is negative and
   * the sun is hidden regardless. */
  horizontalProgress: number;
}

/**
 * Where the sun actually is in the sky right now, not just whether
 * Golden Hour is active — reuses the exact same latitude/declination/
 * solar-noon inputs as getSunTimes below (including its DST correction)
 * rather than a second approximation. Elevation comes from the standard
 * solar-elevation formula (asin of the same terms getSunTimes derives
 * its hour angle from); horizontalProgress reuses getSunTimes directly.
 * Consumed by the sky layer to place the sun relative to the horizon by
 * real solar position — see .atmosphere-sun in globals.css — instead of
 * a fixed on-screen position.
 */
export function getSolarPosition(date: Date): SolarPosition {
  const latRad = (getApproxLatitude() * Math.PI) / 180;
  const n = dayOfYear(date);
  const declRad = ((23.44 * Math.PI) / 180) * Math.sin(((2 * Math.PI) / 365) * (n - 81));
  const solarNoon = isDaylightSaving(date) ? 13 : 12;
  const h = hourOfDay(date);
  const hourAngleRad = ((h - solarNoon) * 15 * Math.PI) / 180;
  const elevationRad = Math.asin(
    Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad)
  );
  const elevation = (elevationRad * 180) / Math.PI;

  const { sunrise, sunset } = getSunTimes(date);
  const span = sunset - sunrise;
  const horizontalProgress = span > 0 ? Math.min(1, Math.max(0, (h - sunrise) / span)) : 0.5;

  return { elevation, horizontalProgress };
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

/** Shared with getGoldenAmount above — kept as one source of truth so the
 * sky's color progression and its intensity bump always agree on exactly
 * where Golden Hour starts, peaks, and ends. Exported so
 * atmospherePreview.ts's "Sunrise" preview can land exactly on this same
 * peak instead of re-guessing it. */
export const GOLDEN_EVENING_CENTER_OFFSET = -0.4;
export const GOLDEN_MORNING_CENTER_OFFSET = 0.3;
const GOLDEN_HALF_WIDTH_HOURS = 1.0;

/**
 * 0 → 1, monotonic, across the *same* window getGoldenAmount bumps over
 * (same center, same half-width — see the shared constants above) — not
 * the intensity of Golden Hour, but *where in it* the visitor currently
 * is: 0 at the window's first instant, 1 at its last. Atmosphere.tsx
 * writes this to --golden-progress, and the sky gradient's own color
 * stops (globals.css, .atmosphere-sky) color-mix() between an
 * "early" and "late" hex per stop using this value, so the sky's actual
 * colors shift continuously as real sunset/sunrise time passes — not
 * just one fixed gradient fading in and out via opacity (that's still
 * --golden's job). Picks whichever of the evening/morning windows is
 * currently active by comparing their amounts, exactly like
 * getGoldenAmount's Math.max does.
 */
export function getGoldenProgress(date: Date): number {
  const { sunrise, sunset } = getSunTimes(date);
  const h = hourOfDay(date);
  const eveningCenter = sunset + GOLDEN_EVENING_CENTER_OFFSET;
  const morningCenter = sunrise + GOLDEN_MORNING_CENTER_OFFSET;
  const evening = triangleBump(h, eveningCenter, GOLDEN_HALF_WIDTH_HOURS);
  const morning = triangleBump(h, morningCenter, GOLDEN_HALF_WIDTH_HOURS);
  const center = evening >= morning ? eveningCenter : morningCenter;
  const progress = (h - (center - GOLDEN_HALF_WIDTH_HOURS)) / (2 * GOLDEN_HALF_WIDTH_HOURS);
  return Math.min(1, Math.max(0, progress));
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

/**
 * Five real sky states, not a fixed-clock-hour mood board — every
 * boundary below is read directly off getGoldenAmount/getSolarPosition/
 * getNightAmount (all above), the exact same values that already drive
 * the sky's own gradient, the sun disc, and the moon's opacity. No new
 * astronomy is added here; this is a categorical *view* over signals
 * that already exist, the same relationship getTimePhase (this file's
 * previous, fixed-hour-bucketed version of "what mood is it") used to
 * have — this replaces that system rather than running alongside it,
 * so there's exactly one notion of "what time-of-day state is it" in
 * the codebase.
 */
export type SkyMessagePhase = "sunrise" | "day" | "golden-hour" | "sunset" | "night";

/**
 * golden > 0 means the visitor is inside *one* of getGoldenAmount's two
 * triangle windows (morning, centered near sunrise, or evening, centered
 * near sunset) — it doesn't say which. horizontalProgress (from
 * getSolarPosition, already 0 at sunrise and 1 at sunset, crossing 0.5
 * at solar noon) is reused here purely to tell those two windows apart:
 * before solar noon is unambiguously the morning window, after is the
 * evening one. The two windows' own hour spans (see the shared
 * GOLDEN_*_CENTER_OFFSET constants and GOLDEN_HALF_WIDTH_HOURS above)
 * never reach far enough past solar noon in either direction to make
 * this ambiguous.
 *
 * The single morning window is reported as one state, "sunrise" — the
 * brief only asked for one morning-side message. The evening window
 * splits into two: "golden-hour" while the sun's real elevation is still
 * above the horizon (the light is warm, but the sun is still up), and
 * "sunset" once elevation crosses to 0 or below (the sun itself is gone;
 * the sky is what's left glowing) — reusing getSolarPosition's own
 * elevation, the same value that already fades .atmosphere-sun's opacity
 * near the horizon, rather than inventing a second sunset calculation.
 *
 * Outside both windows, it's a plain night>=0.5 vs. <0.5 split. The two
 * windows' own hour spans (golden ±1h around their centers) and the
 * night ramp's dawn/dusk spans (±0.75h/1.25h and 1.5h/1h — see
 * getNightAmount) end within minutes of each other at both ends of the
 * day, so there's no dead zone where neither a golden window nor a
 * clear day/night reading applies.
 */
export function getSkyMessagePhase(date: Date): SkyMessagePhase {
  const golden = getGoldenAmount(date);
  if (golden > 0) {
    const { elevation, horizontalProgress } = getSolarPosition(date);
    if (horizontalProgress < 0.5) return "sunrise";
    return elevation > 0 ? "golden-hour" : "sunset";
  }
  return getNightAmount(date) >= 0.5 ? "night" : "day";
}

/**
 * Exact copy per the brief — quiet, one line, no punctuation flourish
 * beyond what's given. The trailing "✦" is kept out of the string itself
 * (AtmosphereNote.tsx renders it as its own styled span) so the glyph can
 * carry a distinct, atmosphere-toned treatment without the message text
 * needing to know about markup.
 */
export const SKY_MESSAGES: Record<SkyMessagePhase, string> = {
  sunrise: "Morning leaves a little light at the edge of the world.",
  day: "Somewhere above us, the sky keeps changing.",
  "golden-hour": "For a moment, the light forgets to leave.",
  sunset: "Even after the light fades, a little of it stays.",
  night: "Come in, there's always room among the stars.",
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
