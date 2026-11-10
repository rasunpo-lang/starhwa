import { getAnniversaryMessage, getAnniversaryYears, isDebutAnniversary } from "../src/lib/anniversary.ts";
let fail = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  if (got !== want) { fail++; console.log(`FAIL ${name}: got ${got}, want ${want}`); } else console.log(`ok   ${name}`);
};
const d = (iso: string) => new Date(iso);
// KST = UTC+9
eq("2026-10-24 00:00 KST on", isDebutAnniversary(d("2026-10-23T15:00:00Z")), true);
eq("2026-10-23 23:59 KST off", isDebutAnniversary(d("2026-10-23T14:59:59Z")), false);
eq("2026-10-24 23:59 KST on", isDebutAnniversary(d("2026-10-24T14:59:59Z")), true);
eq("2026-10-25 00:00 KST off", isDebutAnniversary(d("2026-10-24T15:00:00Z")), false);
// Vancouver Oct 23 20:00 PDT = Oct 24 03:00 UTC = Oct 24 12:00 KST → on (Korean date)
eq("Vancouver Oct 23 evening = KST Oct 24", isDebutAnniversary(d("2026-10-24T03:00:00Z")), true);
eq("years 2026", getAnniversaryYears(d("2026-10-24T03:00:00Z")), 8);
eq("years 2027", getAnniversaryYears(d("2027-10-24T03:00:00Z")), 9);
eq("2027 on", isDebutAnniversary(d("2027-10-24T03:00:00Z")), true);
eq("2018 debut day not an anniversary", isDebutAnniversary(d("2018-10-24T03:00:00Z")), false);
eq("message 2027", getAnniversaryMessage(9), "9 years of ATEEZ. And the story continues…");
process.exit(fail ? 1 : 0);
