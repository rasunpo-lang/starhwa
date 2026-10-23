/**
 * ATEEZ's debut anniversary — October 24, every year (debut: 2018).
 *
 * The date is read in Korea Standard Time (Asia/Seoul), not the visitor's
 * local calendar, so a visitor in Vancouver (or anywhere else) sees it on
 * the actual Korean anniversary — same reasoning as isSeonghwaBirthdayToday
 * in birthday.ts. The anniversary number is derived from the KST year, so
 * nothing needs editing after 2026.
 */
export const DEBUT_YEAR = 2018;
export const DEBUT_ANNIVERSARY = { month: 10, day: 24 } as const;

export type KstDate = { year: number; month: number; day: number };

/** Calendar date in Asia/Seoul for the given instant. */
export function getKstDate(date: Date = new Date()): KstDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** True only on October 24 (KST), from the debut year's first anniversary on. */
export function isDebutAnniversary(date: Date = new Date()): boolean {
  const { year, month, day } = getKstDate(date);
  return year > DEBUT_YEAR && month === DEBUT_ANNIVERSARY.month && day === DEBUT_ANNIVERSARY.day;
}

/** Anniversary number for the KST year of `date` (Oct 24, 2026 → 8). */
export function getAnniversaryYears(date: Date = new Date()): number {
  return getKstDate(date).year - DEBUT_YEAR;
}

export function getAnniversaryMessage(years: number): string {
  return `${years} years of ATEEZ. And the story continues…`;
}
