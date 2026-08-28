# Events Research Log — Festivals, Music Shows, Award Shows, Concerts, Showcases, TV/Radio

Tracks the sweep for ATEEZ's official participation in worldwide festivals, award shows, concerts/world tours, showcases, fanmeetings, special stages, and TV/radio events, requested to cover all years using official KQ/ATEEZ sources only. Not part of the published archive (lives outside `content/entries/`, never read by the content loader).

## Primary discovery: the official KQ calendar API

`ateez.kqent.com` (the official ATEEZ/KQ platform already used for concept-photo research) has a **public schedule/calendar** at `/schedule`, backed by a JSON API: `https://ateez.kqent.com/svc/space/api/v1/calendar?startAt=...&endAt=...` (max one month per request). Each event has a title, date, category label (`CONCERT`, `EVENT`, `TV`, `RADIO`, `FAN SIGN`, `BIRTHDAY`, `YouTube`, `ETC`), and optionally a list of specific member "attendees" for individual (non-group) content.

**Coverage limit discovered**: the calendar's own metadata reports `firstEventStartAt: 2023-03-02T00:00:00Z` — it has no data before March 2, 2023. This mirrors the same May-2023 cutoff found earlier for the platform's tag-feed API; the platform itself appears to have no retroactive schedule data.

The full calendar was fetched month-by-month from March 2023 through November 2026 (its `lastEventEndAt`), directly via the platform's own API while the page was loaded from `ateez.kqent.com` (not a search-engine snippet). 576 total calendar entries were retrieved; 219 fell under `CONCERT`, `EVENT`, or the mixed-bag `ETC` label.

## Scope decisions

- **Included**: world tour dates (`CONCERT`), festivals, award shows, showcases, fanmeetings, and notable TV/radio specials found under `EVENT`/`ETC`, plus one `RADIO`-labeled live special (the routine weekly `RADIO`-labeled "Idol Radio Season 3" cohosting slot is almost entirely Hongjoong/Yunho only and not Seonghwa-relevant, so it was excluded except where explicitly Seonghwa-tagged — none were).
- **Excluded as out of this task's requested scope**: routine `(녹화)` re-recording tags for shows already covered elsewhere (Immortal Songs 2, K-909), `[ALBUM] 발매` release-date markers (not events), and single-member fashion-show/first-pitch/ambassador items tagged to a member other than Seonghwa. Seonghwa-tagged fashion-show/ambassador calendar items (Songzio, Isabel Marant, the Jinju ambassador ceremony) were noticed but left out of this pass — they belong to the existing Fashion-category workflow and weren't part of the requested event types (festivals/award shows/concerts/showcases/TV-radio).
- **"Wavve 원얼스: 아트피아"** — a Seonghwa+Hongjoong-tagged streaming talk/variety show, calendared 3 times (Jul 21, Jul 28, Aug 4, 2023) — included under Variety since it's genuinely a TV/streaming program and explicitly Seonghwa-tagged.
- **Attendee filtering**: group-wide calendar entries (no specific attendee tag) were treated as including Seonghwa, consistent with how the rest of the archive treats group content. Entries tagged to a different single member only were excluded as not Seonghwa-specific.
- **Source URL**: the calendar has no per-event permalink (confirmed by inspecting the raw API response — no link field beyond a boolean `linked` flag). Every calendar-derived entry therefore cites `https://ateez.kqent.com/schedule` as the source URL, with the exact calendar event title quoted in the source label so it's traceable back to the specific entry.
- **Europe leg, 2025 World Tour [Towards The Light: Will To Power]**: the calendar's own titles for this leg (Jan 18–Feb 25, 2025) are literally just "IN EUROPE" for every date, with no per-date city — rather than inventing city names, this was added as one consolidated leg entry spanning the date range.
- **Future/scheduled dates**: several calendar entries (into late 2026) are officially scheduled but had not yet occurred as of this research. They were included as officially-confirmed scheduled participation, consistent with the calendar being KQ's own forward-looking official schedule, not a fan projection.
- Two calendar items titled only **"The Performance"** (2025-03-30, 2026-04-11) were too ambiguous to classify without guessing — not added, tracked here.
- **"Mrs. GREEN APPLE presents 'CEREMONY'"** (2025-06-18) and **"ASEA 2026"** (2026-05-17) — appeared on ATEEZ's calendar but the nature of ATEEZ's involvement wasn't clear from the title alone and wasn't independently verified — not added, tracked here.

## Cross-checked against the existing archive

Before adding anything, the archive was checked for existing Performances/Awards/TV/Radio/Variety/Tours coverage. Found: extensive existing coverage of **weekly music-show fancams/facecams** (M Countdown, Music Bank, Show Champion, Music Core, Inkigayo, Gayo Daejeon, Weekly Idol, The Show, K909, Kingdom, Immortal Songs 2, Simply K-Pop) across every era — these were left untouched. Found only 2 existing Awards entries (MAMA 2019, MAMA 2021), 4 KCON Performances entries (2019 ×3, 2022 Saudi), and 3 casual Tours photos (Madrid 2022, London 2023, Mexico City 2023) — meaning almost none of the festival/award-show/world-tour ground was previously covered.

The Aug 23, 2023 Mexico City tour date overlaps in date with the existing casual-photo entry `seonghwa-x-mexico-tour-2023.md`; rather than duplicating, the new formal tour-date entry links to it via `related`.

## Pre-calendar era (2018 – Feb 2023): supplementary sweep

Since the official calendar has no data before March 2023, this earlier period was covered via a reasonable-effort search of `@ATEEZofficial`'s own posts (not the calendar), same verification standard as always — every candidate opened and read directly.

**Added (4):**
- 34th Golden Disc Awards — Next Generation Award (2020-01-04), confirmed via official announcement post
- 2022 World Tour [THE FELLOWSHIP: BEGINNING OF THE END] — Seoul / USA / Europe legs (3 entries), confirmed via the official tour poster post, which gives leg-level date ranges (Seoul Jan 7–9, USA Jan 18–30, Europe Feb 13–Mar 1) but no per-city breakdown — so these are leg-level entries, not per-city, to avoid inventing city names the official poster doesn't give.

**Checked but not confirmed via an official post — tracked, not added:**
- ATEEZ's attendance/performance at MAMA 2020 and MAMA 2022 — found only fan-account and Mnet-account mentions, no `@ATEEZofficial` post located confirming either.
- Melon Music Awards 2020–2023 attendance — found only third-party mentions; no official ATEEZ post located for these specific years (2024's MMA appearance/Global Artist win *is* officially confirmed and already covered under the calendar-derived entries).
- Individual per-city dates for the pre-calendar-era 2022 "Beginning of the End" tour — only the leg-level official poster was located; per-city official posts (if they exist) were not individually searched given time constraints.
- Seoul Music Awards attendance in years before 2026 — no official ATEEZ confirmation post located this pass.

This pre-calendar gap (2018–Feb 2023 award-show/festival participation beyond what's listed above) is real and only partially closed — a future pass specifically targeting `@ATEEZofficial`'s per-year award-show/festival announcement posts could close more of it.

## Organizer-side official sources (second pass)

For entries sourced from the KQ calendar (which has no per-event deep link), added a **second source** from the event organizer's own official account/site — festival, broadcaster, award show, or venue — wherever one could be directly verified. KQ/ATEEZ sources remain the primary (first-listed) source on every entry; organizer sources are additive, never a replacement.

**Verified official and added (8 entries):**
- 2023 MAMA Awards — Mnet's own `@MnetMAMA` account (Worldwide Fans' Choice announcement, tags @ATEEZofficial)
- 2024 Melon Music Awards — Melon's own `@melon` account (MMA2024 full-performance post)
- 40th Golden Disc Awards — the awards' own `@_GoldenDisc` account (Best Album trophy congratulations)
- KCON 2023 Thailand — `@KCON_official` (lineup replay content)
- KCON LA 2023 — `@kconusa` (artist lineup announcement)
- KCON Hong Kong 2024 — `@KCON_official` (daily lineup, Day 2)
- WATERBOMB Japan (Tokyo) 2023 — `@Waterbomb_Japan`, the festival's own account (references the 2023 Tokyo performance)
- Summer Sonic 2024 — `@summer_sonic`, the festival's own verified account (Osaka Day 1 lineup card, linking to summersonic.com)

**Checked but not added — no confirmed official account/post found:**
- Asia Artist Awards 2025 — no official AAA social account could be confirmed (only fan/update accounts and ATEEZ's own KQ community-board post, which is already KQ-side).
- The Fact Music Awards (2023, 2026), Edaily Culture Awards, Hanteo Music Awards (×2), Korea Grand Music Award (×2), K-World Dream Awards, Seoul Music Awards 2026 — an official-looking account exists for some of these (e.g. `@factmusicawards`, `@SMA_korea`) but a specific post confirming ATEEZ's participation wasn't located within this pass's search budget.
- **Coachella 2024** — no post from Coachella's own official account/site was located confirming ATEEZ (only secondary/media coverage), so no organizer source was added despite this being a well-documented appearance.
- **Dream Concert 2025** — a "`@DreamConcertae`" account surfaced in search results and was cited by several fan accounts as if official, but the handle returned a 404 (account does not exist) when checked directly — a good example of why every source in this project is verified by direct fetch rather than trusted from a search snippet. Not added.
- Every other festival, showcase, fanmeeting, and TV/radio special added in the first pass — not individually re-searched for an organizer-side source in this pass, given the volume (130+ entries); this remains open for a future targeted pass.

## Organizer-side official sources (third pass)

Two parts to this pass: (1) the user supplied 5 official İstanbul Festivali Instagram links directly to add to the existing Istanbul entry; (2) continued the organizer-source sweep from the second pass across the remaining ~133 entries that still had only the KQ calendar source.

**User-supplied links, verified and added (İstanbul Festivali, 5 links):** Each URL was opened directly and confirmed to be posted by the official `istfestivali` Instagram account and to reference ATEEZ (either in the visible caption or, where the caption was truncated, confirmed via the page's underlying HTML containing "ATEEZ"). Added to `ateez-istanbul-festivali-2026.md` as 5 additional sources alongside the existing KQ source.

**Newly verified official and added (3 entries):**
- 31st Hanteo Music Awards (2023) — the awards' own `@Hanteo_HMAs` account (stage-video post naming ATEEZ's performance)
- 33rd Hanteo Music Awards (2025 cycle) — `@Hanteo_HMAs` (Hanteo Top 10 nominees announcement naming ATEEZ)
- 2025 Korea Grand Music Awards — `@KGMA_en`, the awards' own account (red carpet post naming ATEEZ, Nov 14 2025, Inspire Arena)

**Checked but not added — no confirmed official post found within this pass's search budget:**
- The Fact Music Awards (2023) — `@factmusicawards` is genuinely official and posts about the ceremony generally, but no post naming ATEEZ specifically from that account was located (only fan-account coverage).
- Edaily Culture Awards — the `edaily_friends`/`edailynews` Instagram accounts exist, but the specific "ATEEZ win Best Concert Award" posts found in search results returned "profile isn't available," and a later Edaily post checked directly didn't mention ATEEZ. Not added.
- K-World Dream Awards 2026 — official account `@kwda_official` confirmed to exist and post lineups, but the specific posts naming ATEEZ in search results came from ticket-reseller accounts, not `@kwda_official` itself.
- Korea Grand Music Award 2024 (as opposed to 2025, added above) — no official `@KGMA_en` post specifically naming ATEEZ was located for the 2024 ceremony.
- Mawazine Festival 2024 and Grand Mint Festival 2024 — both festivals' official Instagram accounts (`@mawazine`, `@grandmintfestival`) were confirmed to exist and (per secondary reporting) did post about ATEEZ's appearances, but the specific post URLs weren't located directly within this pass.
- Busan One Asia Festival 2025 — official accounts (`@bof_official_kr`, `@bof.kr`) confirmed to exist; no ATEEZ-specific post located.
- The remaining ~125 entries (other festivals, showcases, fanmeetings, TV/radio specials, and most world-tour tour-date entries) were not individually re-searched in this pass, given the volume — this remains open for further passes. Fanmeeting entries in particular have no true external "organizer" distinct from KQ/ATEEZ itself, so an organizer-side source may not exist for those by nature.

## Full month-by-month, all-category sweep (fourth pass)

Re-fetched the **complete** KQ calendar — every month from March 2023 through November 2026 (the platform's full `firstEventStartAt`–`lastEventEndAt` range, unchanged since the earlier passes), and this time **every category**, not just `CONCERT`/`EVENT`/`ETC`: `TV`, `RADIO`, `BIRTHDAY`, `YouTube`, and `FAN SIGN` were all pulled and reviewed. 576 total calendar rows.

**Method:** every row was cross-checked against all existing archive entries (by date + normalized title, with a fallback that treats a routine group-wide weekly-show TV broadcast as already-covered if the archive has any other entry that same date — since this archive's existing weekly-show fancams use English titles that don't string-match the calendar's Korean broadcast names). Rows tagged to a specific member other than Seonghwa (fashion shows, first pitches, solo radio slots, etc.) were treated as out of scope for this Seonghwa-focused archive, consistent with earlier passes. Group-wide rows (no attendee tag) and rows explicitly tagging Seonghwa (성화/떵화) were kept as candidates.

**Scope decisions specific to this pass:**
- **`BIRTHDAY` category (40 rows, e.g. "HAPPY SEONGHWA DAY," "HAPPY ATEEZ DAY")** — these are bare calendar reminders with no distinct content or source beyond the marker itself; the actual birthday *content* (behind photos, MD announcements, live streams) is already separately catalogued via real posts elsewhere in the archive. No entries added for the markers themselves — added 0, none needed.
- **`FAN SIGN` category (40 rows)** — almost entirely per-retailer signing-event listings for two album eras (OUTLAW 2023: 20 rows; GOLDEN HOUR: Part.1 2024: 17 rows), each row differing only in which retailer/platform hosted that date's signing. Rather than 37 near-identical entries, each era's campaign was consolidated into **one entry** covering the full date range and retailer list. The one genuinely distinct fan-sign-category event — "The Silent Soul X ATEEZ Video Call" (Hongjoong, Seonghwa), Nov 12 2025 — got its own entry.
- **`YouTube` category (102 rows)** — a recurring low-content segment ("돌박이일," appearing 9 times across the whole range with no distinguishing per-episode information) was left out as too granular/repetitive to document individually. The official "ATEEZ+" content series (9 identically-titled calendar rows, Aug–Sep 2025) was consolidated into one series entry rather than 9 stub entries. Every other YouTube-category row — one-off guest appearances on outside shows/platforms, whether group-wide or Seonghwa-tagged — got its own entry.
- **`RADIO` category (61 rows)** — the recurring "Idol Radio Season 3" Hongjoong/Yunho cohosting slot (the large majority of this category) was left out as before (not Seonghwa-relevant, routine). The 6 rows that do tag Seonghwa (one-off guest slots on other hosts' shows) were added.
- **`TV` category (113 rows)** — routine weekly music-show broadcasts already implicitly covered by this archive's existing per-date fancam/facecam entries were skipped. Broadcasts of an event *already* added as its own `ETC`/`CONCERT` entry (e.g. a TV rebroadcast of "Korea on Stage in London" or "Idol Radio Live in Seoul" weeks after the live event) were treated as the same event, not a duplicate. Genuinely new TV specials — SBS/MBC year-end Gayo specials (2023–2025), an SBS Super Concert, a Music Bank Global Festival Japan broadcast, an Immortal Songs 2 APEC special, the 2025 KBS Entertainment Awards, and two group-wide variety-adjacent broadcasts — were added.
- **`ETC` category** — reviewed the small remainder not already covered in the second/third passes: found 2 genuine gaps (the OUTLAW-era media showcase, and the "2023 K Global Heart Dream Awards" — a *different*, earlier award show from the already-covered 2026 "K-World Dream Awards," easy to conflate by name).
- **`CONCERT`/`EVENT`** — re-verified against all 86 `CONCERT` and 2 `EVENT` rows from the full range; the only apparent gaps were individual dates inside the already-consolidated "Europe Leg" entry (expected, not a real gap) and one genuine miss: KCON 2023 Thailand's Meet & Greet session (separate calendar row from the concert itself), now added.

**58 new entries added this pass**, spanning Performances, Awards, TV, Radio, Variety, and Official Content. Combined with the 144 (first pass) + 4 (pre-calendar sweep) + organizer-source enhancements from earlier passes, this closes out the systematic month-by-month sweep of the full KQ calendar across every available year (2023–2026) and every category.

## Totals

**202 new entries added across all passes**: 140 (first pass, CONCERT/EVENT/ETC) + 4 (pre-calendar sweep) + 58 (fourth pass, full category sweep: TV/RADIO/YouTube/FAN SIGN/remaining ETC/CONCERT gaps). 0 duplicates created — every candidate was cross-checked against the existing archive first; the handful of overlaps found (same event covered by both a calendar row and an existing casual-photo/X-post entry) were linked via `related` or merged as an additional source rather than duplicated.

**11 existing entries enhanced** with organizer-side official sources across the second and third passes (no new entries — additional official sources only), as listed above.
