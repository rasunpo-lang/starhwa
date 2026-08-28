# KQ Official Site Sweep Log — Full History, All Post Types

Tracks a full historical sweep of ATEEZ's official KQ platform (`ateez.kqent.com`) for Seonghwa-relevant posts, across all post types (not limited to concept photos or calendar events, which prior passes already covered — see `CONCEPT_PHOTO_RESEARCH_LOG.md` and `EVENTS_RESEARCH_LOG.md`). Not part of the published archive (lives outside `content/entries/`, never read by the content loader).

## Method

1. Queried the platform's own public tag-feed API directly (`ateez.kqent.com/svc/home/api/v1/feeds/tagged?tag=성화`, paginated), which returns every post KQ has tagged with Seonghwa's name — 50 items total, spanning 2023-05-14 to 2026-06-22 (this appears to be the feed's full lifetime history, not a partial window).
2. Diffed every item's content ID against the 36 KQ content IDs already cited across the existing archive.
3. For each of the 21 unmatched items, fetched the full post via the platform's content-detail API (`ateez.kqent.com/svc/content/api/v1/contents/{id}`) — title, exact `publishedAt` timestamp, tags, and body text — read directly rather than inferred from the feed summary.
4. Cross-checked titles against the existing archive by keyword search before treating anything as new, since several titles look like duplicates of already-covered content at a glance (e.g. multiple posts titled "WILL Concept Photo 1/2/3").

## Finding: two parallel "Concept Photo N" series per era

THE WORLD EP.FIN: WILL era has **two distinct sets of posts** sharing the same "Concept Photo 1/2/3" numbering but different content IDs: one set is Seonghwa's individual solo photos (already in the archive), the other is joint/group photos pairing Seonghwa with different member combinations (Concept Photo 1: Hongjoong+Seonghwa; 2: Wooyoung+Jongho+Seonghwa; 3: Yunho+Yeosang+Wooyoung+Seonghwa) — distinguished only by each post's tag list, not its title. This wasn't a duplicate; both series were genuinely posted. Added the joint versions as separate entries, following the existing precedent of `seonghwa-will-unit-poster-2023.md` (a 2-member unit poster already in the archive under the same "individual content"-adjacent pattern).

## Added (19 entries)

**THE WORLD EP.2: OUTLAW era:**
- Character Poster (2023-05-14) — individual
- OPERATION Preview Poster, "This World" (Seonghwa, Yeosang) (2023-05-23)
- OPERATION video, "This World" (Seonghwa, Yeosang) (2023-05-23)

**THE WORLD EP.FIN: WILL era:**
- Comeback teaser, individual (2023-10-25) — the announcement post for the Dec 1, 2023 release; the existing `the-world-ep-fin-will.md` entry covers release day itself via Apple Music and was left untouched, this is a distinct earlier announcement post
- Character Poster (2023-11-14) — individual
- Joint Concept Photo 1 (Hongjoong, Seonghwa) (2023-11-01)
- Joint Concept Photo 2 (Wooyoung, Jongho, Seonghwa) (2023-11-02)
- Joint Concept Photo 3 (Yunho, Yeosang, Wooyoung, Seonghwa) (2023-11-09)
- "World A" MATZ Cut (2023-12-31)
- MATZ Performance Video (2024-01-28)
- Tour promo photo, individual, TOWARDS THE LIGHT IN SEOUL (2023-12-21)

**GOLDEN HOUR era:**
- ATEEZ's WORK Profile, group (2024-05-19)
- GOLDEN HOUR: Part.1 'WORK' D-1 Poster, individual (2024-05-29)
- TEAM 'Z' PLAYER 77, fanmeeting teaser, individual (2024-04-28)
- Room No.1117 — Concierge Manager, individual (2025-05-02)
- Room No.1117 (Seonghwa, Yeosang, Jongho), joint (2025-05-04)
- Tour promo photo, individual, IN YOUR FANTASY IN INCHEON (2025-06-24)
- GHOSTEEZ — Your Friendly Ghost, individual (2026-04-25)
- GHOSTEEZ — My Besties, individual (2026-05-12)

## Supplemented (2 existing entries)

- `matz-mv-2024.md` — added the matching official KQ platform post as a second source alongside the existing YouTube source.
- `matz-mv-making-film-2024.md` — added the matching official KQ platform post as a second source. This post is self-dated 2024-01-05, which directly confirms the date the entry was previously citing only via secondary reporting — **upgraded from `unverified` to `verified`** on that basis.

## Not added — reviewed and excluded

- No items were found requiring exclusion; all 21 unmatched feed items were confirmed as genuine, distinct Seonghwa-relevant content and added or used as supplementation.

## Scope note

This pass covered the `성화` (Seonghwa) tag feed only. It did not re-check the `/schedule` calendar (already swept in `EVENTS_RESEARCH_LOG.md`) or attempt a fresh crawl of `ipnation.com` (KQ Entertainment's corporate site, distinct from the ATEEZ-branded `ateez.kqent.com` platform) — a future pass could check whether `ipnation.com` carries any Seonghwa-specific press releases or announcements not mirrored on the ATEEZ platform.
