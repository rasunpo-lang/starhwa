/**
 * Tuning for the 떵별이 (DDEONGbyeoli) "sighting" prototype — a rare,
 * unprompted appearance by Seonghwa's ANITEEZ bunny mascot (see
 * DdeongbyeolSighting.tsx). Every
 * knob that controls how often/long it appears lives here so it can be
 * adjusted without touching the component logic.
 */
export const DDEONGBYEOL_CONFIG = {
  /** How often (ms) we roll the dice on whether to trigger a sighting. */
  checkIntervalMs: 45_000,
  /** Chance (0–1) a sighting fires on each roll, if the cooldown allows it. */
  triggerChance: 0.15,
  /** Minimum time between two sightings for the same visitor (persisted
   *  in localStorage, so it holds across page navigations/reloads). */
  cooldownMs: 20 * 60 * 1000,
  /** Total lifetime (ms) of one sighting — must match the
   *  `ddeongbyeol-sighting` keyframe duration in globals.css. */
  sightingDurationMs: 4000,
} as const;
