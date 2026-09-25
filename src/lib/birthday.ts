/**
 * BIRTH OF A STAR — Seonghwa's birthday (April 3, KST), a once-a-year
 * celestial/editorial moment split across two places rather than one
 * self-contained easter egg:
 *
 * - Atmosphere.tsx renders one extra hero-tier star at BORN_STAR_POSITION
 *   below, conditionally on isSeonghwaBirthdayToday(), directly inside its
 *   existing `.atmosphere-stars` field — so it inherits the exact same
 *   real-time day/night/golden-hour opacity mechanics every other star
 *   already has (see `.atmosphere-stars`'s opacity formula in globals.css)
 *   with zero new CSS. That's the persistent, all-day half: the star fades
 *   in through dawn, recedes through daylight and golden hour exactly like
 *   any other star, and is simply part of the night sky once night falls.
 * - BirthdaySighting.tsx is only the one-time editorial caption (no
 *   mascot, no burst) — see that file's own doc comment.
 *
 * Everything the feature needs to be retuned, tested, or removed lives in
 * these two lib/component files, the `.birthday-*` CSS block in
 * globals.css, and one mount line each in layout.tsx (BirthdaySighting)
 * and Atmosphere.tsx (the born star itself).
 */
export const SEONGHWA_BIRTHDAY = { month: 4, day: 3 } as const;

/** Where the "born" star sits in the sky (same top/left percentage
 * coordinate system as Atmosphere.tsx's own STAR_POSITIONS) — hand-picked
 * clear of every existing hand-placed star, high and roughly centered so
 * it reads as a notable new point in the sky. Shared here (rather than
 * defined inline in Atmosphere.tsx) so BirthdaySighting.tsx's caption can
 * anchor itself relative to the same point without duplicating it. */
export const BORN_STAR_POSITION = { top: "3%", left: "51%" } as const;

// The caption's total on-screen lifespan isn't configured here — it's
// computed in BirthdaySighting.tsx from its own simple reveal timing, so
// it can never silently drift out of sync with the CSS keyframe it drives.

const SESSION_KEY = "starhwa:birthday:seen";

/**
 * True only on April 3 in Korea Standard Time — the timezone every
 * self-dated release in this archive is already anchored to (see e.g.
 * "released at midnight KST" across entry bodies) — not the visitor's
 * local calendar date. Using KST means the egg lands on Seonghwa's
 * actual birthday for every visitor, rather than a date that drifts by
 * timezone and can span up to ~48 real-world hours if checked naively
 * against each visitor's local clock.
 */
export function isSeonghwaBirthdayToday(date: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  return month === SEONGHWA_BIRTHDAY.month && day === SEONGHWA_BIRTHDAY.day;
}

/** Has this browser tab/session already played the sighting? sessionStorage
 * (not localStorage) is deliberate — "once per visit," not "once per year
 * per device" — so it naturally resets on a fresh session without needing
 * a year-keyed storage key to invalidate later. */
export function hasSeenBirthdaySightingThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    // Storage can throw in locked-down/private-browsing contexts —
    // fail safe by treating it as "not seen" rather than crashing.
    return false;
  }
}

export function markBirthdaySightingSeenThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Non-fatal — worst case the sighting can replay this session.
  }
}
