/**
 * Hosting/domain renewal deadlines for the private /maintenance page.
 * Imported only by that (server) page — the dates reach the browser solely
 * inside the password-gated response. Each deadline is the start of the
 * listed calendar day in Vancouver, so the countdown never overstates it.
 *
 * The dates are read from server-only environment variables (see
 * .env.example) and are deliberately NOT stored in the repository, which is
 * public. A missing or malformed date simply leaves that row out.
 */

export const RENEWAL_TIME_ZONE = "America/Vancouver";

export type Renewal = {
  label: string;
  service: string;
  /** Calendar date of expiry, YYYY-MM-DD, in RENEWAL_TIME_ZONE. */
  date: string;
};

function validDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  return check.getUTCFullYear() === y && check.getUTCMonth() === m - 1 && check.getUTCDate() === d;
}

/** Read at request time (the page is force-dynamic), never at build time. */
export function getRenewals(): Renewal[] {
  const env = process.env;
  const rows: Renewal[] = [];
  if (validDate(env.RENEWAL_HOSTING_DATE)) {
    rows.push({
      label: "Hosting Renewal",
      service: env.RENEWAL_HOSTING_NAME?.trim() || "Hosting",
      date: env.RENEWAL_HOSTING_DATE,
    });
  }
  if (validDate(env.RENEWAL_DOMAIN_DATE)) {
    rows.push({
      label: "Domain Renewal",
      service: env.RENEWAL_DOMAIN_NAME?.trim() || "Domain",
      date: env.RENEWAL_DOMAIN_DATE,
    });
  }
  return rows;
}

/** UTC offset (ms) of RENEWAL_TIME_ZONE at the given instant. */
function zoneOffsetMs(instant: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RENEWAL_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(new Date(instant));
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** Epoch ms of 00:00 on `date` (YYYY-MM-DD) in RENEWAL_TIME_ZONE. */
export function startOfDayMs(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d);
  // Two passes settle the offset even if a DST change falls near midnight.
  const first = guess - zoneOffsetMs(guess);
  return guess - zoneOffsetMs(first);
}

/** Human-readable expiry date, e.g. "August 28, 2027". */
export function formatExpiry(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
