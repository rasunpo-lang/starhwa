# Social Links Inventory — @ateez_official_ Instagram, Seonghwa-Related Posts

Research inventory of posts from the official ATEEZ Instagram account (`@ateez_official_`, https://www.instagram.com/ateez_official_/, 11M followers / 4,256 posts as of this pass) that feature or reference Seonghwa. Built as a best-effort research pass, **not exhaustive** — see methodology and coverage limitations below. Not part of the published archive (this file lives outside `content/entries/` and is never read by the content loader), same convention as `SOCIAL_ATEEZOFFICIAL_X_SEONGHWA.md` and `EVENTS_RESEARCH_LOG.md`.

## Why this isn't exhaustive

Unlike X/Twitter (where `status/<id>` posts are broadly search-indexed and this project's X inventory could sweep systematically), Instagram's individual post pages (`/p/<shortcode>/`, `/reel/<shortcode>/`) are very poorly indexed by general web search. `site:instagram.com/ateez_official_` queries mostly surface:

- fan pages, fansite/paparazzi accounts, and media/magazine accounts that **mention or tag** `@ateez_official_` and `@_starhwa_` (Seonghwa's personal account) in their own captions — not actual posts by the official account, and
- a small, inconsistent scatter of genuine `ateez_official_/p/...` and `ateez_official_/reel/...` URLs that happen to surface for specific keyword combinations.

Every candidate URL surfaced by search was opened directly (via browser render of the individual post page, reading the real rendered caption/account-name/date/like-count from the DOM — not a search-engine snippet) to confirm (a) it was actually posted by `ateez_official_` and not a third party, and (b) its real caption and date. A blind control fetch of a fabricated/nonexistent shortcode correctly returned "no content found," confirming this method reports genuine page content rather than guessing plausible-sounding data.

Given the account's scale (4,256 posts across 2018–2026) and the weak indexing, this pass should be read the same way the X inventory's early passes were: a genuine, verified starting set — not a claim that every Seonghwa appearance (especially group photos/carousels with no individual framing) has been found. A literal frame-by-frame reconstruction of every carousel slide across 8 years of posts is not achievable through public search indexing; it would require scrolling the account's full history directly while logged in, which these tools cannot do.

## Scope decision — individual/Seonghwa-framed content

Consistent with how this archive's X inventory and the rest of the site already treat group content (`SOCIAL_ATEEZOFFICIAL_X_SEONGHWA.md`'s "Explicitly rejected as not Seonghwa-specific" section — group fancams/photos with no Seonghwa-specific tag or framing are excluded even though he's visible in them), this pass prioritized posts that are **specifically about or centered on Seonghwa** (solo concept photos, DAILY_ATEEZ-style individual spotlights, individual concept-photo/photobook/season's-greetings previews, individual Special Clips, birthday content, individual news/announcements) over cataloguing every group post he appears in. Group photos/carousels were not individually itemized here.

## Method

1. Searched `site:instagram.com/ateez_official_` combined with "성화"/"떵화"/"SEONGHWA", by year, by era, and by known content series (DAILY_ATEEZ, concept photo, Special Clip, Season's Greetings, photobook, ASMR self-intro, birthday).
2. Every distinct `instagram.com/.../p/` or `/reel/` URL surfaced was opened directly and its rendered account name, caption, and date recorded.
3. Cross-checked against all existing `content/entries/*.md` (the 3 pre-existing Instagram entries, plus any entry whose sources already reference an Instagram or cross-posted X/YouTube version of the same content) before treating anything as new.
4. New, confirmed-official, non-duplicate finds were added as new entries; confirmed-official finds that duplicated an existing entry's content (different platform, same release) were merged in as an additional source on that entry rather than a new entry.

## Confirmed official posts (this pass)

| Date | URL | Caption (as rendered) | Outcome |
|---|---|---|---|
| 2018-07-12 | https://www.instagram.com/p/BlIDXKXAVFJ/ | "[🎬] ATEEZ(에이티즈) ASMR 자기소개 - 성화" | **New entry** — [seonghwa-instagram-asmr-selfintro-2018.md](entries/seonghwa-instagram-asmr-selfintro-2018.md) |
| 2024-07-14 | https://www.instagram.com/p/C9bdyBOxSuZ/ | "[📷] ATEEZ 2024 SUMMER PHOTOBOOK Preview '성화(SEONGHWA)'" | **New entry** — [seonghwa-summerphotobook-preview-2024.md](entries/seonghwa-summerphotobook-preview-2024.md) |
| 2024-11-27 | https://www.instagram.com/p/DC5p7yrTir6/ | "[📷] 2025 SEASON'S GREETINGS '성화(SEONGHWA)'" | **New entry** — [seonghwa-seasons-greetings-2025-preview.md](entries/seonghwa-seasons-greetings-2025-preview.md) |
| 2025-04-03 | https://www.instagram.com/p/DH-zm6XybH_/ | "[🎬] [Special Clip] ATEEZ(에이티즈) 성화 '로이킴 - 봄이 와도'" | **Enriched existing entry** — added as second source on `special-clip-roykim-bomiwado-2025.md`; date directly confirmed as April 3, 2025, so verification upgraded from `unverified` to `verified` |
| 2026-01-01 | https://www.instagram.com/p/DS_hA91ERve/ | "[📷] ATEEZ(에이티즈) 성화 'Skin' | ATEEZ Present" | **Enriched existing entry** — added as second source on `skin-mv-2026.md` (teaser photo for the same MV) |
| 2025-02-13 | https://www.instagram.com/ateez_official_/reel/DGA44PNS6P1/ | "🥁🎻🎹🎼" — tagged `#SEONGHWA #성화 #YUNHO #윤호` | **New entry** — [seonghwa-yunho-instagram-reel-2025.md](entries/seonghwa-yunho-instagram-reel-2025.md), a joint Seonghwa/Yunho reel |

## Checked and confirmed NOT from the official account — excluded

Search snippets frequently present third-party captions that *mention* `@ateez_official_`/`@_starhwa_` inline, which can look like an official post at a glance. Each of these was opened directly and confirmed to be posted by a different account:

- https://www.instagram.com/p/DFmy7NazIMc/ — posted by `izitmag_` (fashion news account), Feb 3, 2025 — reports Seonghwa's Isabel Marant global ambassador announcement, doesn't post it itself. (Already covered via `seonghwa-mingi-paris-fashionweek-2026.md` / other Fashion-category entries for this ambassadorship.)
- https://www.instagram.com/p/DWP3uvyAavK/ — posted by `marieclairekorea`, not `ateez_official_` — already covered by `marieclaire-korea-cover-2026.md`.
- https://www.instagram.com/p/DUTSoqkjS4I/ — posted by `seon.ghwatf`, a fansite account (2026 World Tour Jakarta candid) — not an official post, excluded per this project's rule against fan-taken/fansite images.
- https://www.instagram.com/p/DTp5iXvEn41/ — posted by `san_mato_`, a fansite account — excluded, same reason.
- https://www.instagram.com/p/DZ6d7g0EcwO/ — posted by `koreadispatch` (media outlet airport candid) — not an official account post, excluded from this Instagram-specific sweep (Dispatch content is handled under this archive's existing separate Dispatch-sourced entries where applicable).
- https://www.instagram.com/p/DH4uzPvTA_N/ and https://www.instagram.com/p/DH8Qo_Wz2sX/ — posted by `photoismjp`, a brand/collab account (PHOTOISM x ATEEZ), not `ateez_official_`.

## Coverage gaps / recommended next passes

- **DAILY_ATEEZ series**: only the 3 pre-existing entries (2018, 2019, 2020) are confirmed; the series likely continued well beyond 2020 but no further installments surfaced via search in this pass.
- **Concept photo series** (ZERO: FEVER Part.2/3, THE WORLD EP.1/2/Fin, GOLDEN HOUR Part.1–4): individual "성화(SEONGHWA)" concept-photo posts almost certainly exist on the official Instagram for each era (several are already documented on `ateez.kqent.com`, e.g. THE WORLD EP.FIN concept photo 2), but their specific `ateez_official_` Instagram post URLs weren't individually located in this pass.
- **Birthday content** (2019–2026): the X inventory already documents most official birthday posts; equivalent Instagram-native posts weren't individually re-searched here given the volume — likely significant overlap (cross-posted content) rather than distinct new material.
- **2018–2019 (pre- and early-debut era)** and **2021–2023**: search indexing was weakest for these years; almost nothing surfaced beyond what's already in the archive.
- A genuinely exhaustive pass would need direct, authenticated, sequential scroll-through of the account's full grid — outside what public search-engine indexing and unauthenticated page fetches can provide.
