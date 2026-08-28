# Archive content

Every entry in The Starhwa Encyclopedia is one Markdown file in
`content/entries/`. This directory **is** the database. Nothing here is UI
code — you never need to touch anything in `src/` to add, edit, correct, or
remove an entry.

## Add an entry

1. Copy `_TEMPLATE.md` to a new file named after the entry, e.g.
   `2026-world-tour-seoul-stage.md` or `golden-hour-part-2-comeback.md`.
   The **filename (without `.md`) becomes the entry's URL slug** —
   `/archive/golden-hour-part-2-comeback` — so keep it short, lowercase,
   and hyphenated. This is the only place the slug is set.
2. Fill in the fields described below.
3. Save. In `npm run dev`, the entry appears immediately — no restart, no
   code change. In production it's picked up on the next build/deploy.

Delete a file to remove an entry. Edit a file's frontmatter or body to
correct one. That's the whole workflow.

## Fields

| Field          | Required | Notes                                                                                          |
| -------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `title`        | yes      | Plain text, no markdown.                                                                        |
| `date`         | yes      | `YYYY-MM-DD`. Drives sort order, the year filter, and which era the entry belongs to.           |
| `category`     | yes      | One of the fixed categories below — must match exactly.                                          |
| `verification` | no       | `"verified"` or `"unverified"` (default). Unverified entries show a small badge on their page.  |
| `tags`         | no       | Short lowercase phrases. Used by search and future filtering.                                    |
| `sources`      | yes      | List of `{ label, url }`. At least one. Link to the original — never rehost media.               |
| `image`        | no       | `{ url, credit, type }`. An editorially curated visual anchor — see "Image selection" below.    |
| `related`      | no       | List of **other entries' filenames** (no `.md`), e.g. `golden-hour-part-1`.                     |
| body text      | yes      | Everything below the closing `---` is the entry's summary. One or two original sentences.        |

Valid `category` values — from `src/lib/types.ts`, edit that file to add a
new one:

Music · Performances · Interviews · Fashion · Magazines · TV · Radio ·
Variety · Social Media · Awards · Tours · ANITEEZ · Official Content

## What you never set by hand

Three fields are computed automatically so they can never drift out of
sync with the data that determines them:

- **`slug`** — the filename.
- **`year`** — the first four digits of `date`.
- **`era`** — whichever era in `src/data/eras.ts` contains `date` in its
  date range. If an entry's date falls outside every defined era, the
  build fails with a clear error — extend the era's range or fix the date,
  don't work around it.
- **`id`** (the `SHW-YYYY-NNN` catalog number shown on every card) — assigned
  in date order once all entries are loaded, so it's always sequential and
  never needs renumbering by hand.

## Validation

Every file is checked against the schema in `src/lib/schema.ts` when the
site starts or builds. A missing required field, a malformed date, an
unrecognized `category`, or a `related` entry that points at a filename
that doesn't exist will throw a build/dev error naming the exact file and
what's wrong — bad data can't silently reach the site.

## Source link priority

Prefer a specific official source over the generic KQ Entertainment schedule
link (`https://ateez.kqent.com/schedule`) whenever one exists for the exact
event — an official ATEEZ/ATEEZ Japan/KQ social post, an official
event/organizer/venue page, an official brand/collaboration page, an
official YouTube video, or a verified X/Instagram/TikTok post. When a
specific link is found, remove the generic schedule link rather than
keeping both. Keep the generic schedule link only when no better specific
source can be found.

## Source redundancy

Prefer an official YouTube upload over an X/Twitter video post (🎬-labeled
sources) when both cover the same performance/moment — remove the X source
and keep the YouTube one. Only substitute a genuine official-channel
upload, never a fan-repost; if no official YouTube equivalent exists, keep
the X source. Likewise, remove a `@ATEEZofficialjp` source when it's a
same-content cross-post already covered by a `@ATEEZofficial` (KR) source
in the same entry (same photo/video, near-identical caption, posted within
minutes of each other) — but never remove a Japan-account source that's
the entry's only source or that covers genuinely Japan-specific content
with no KR equivalent.

## Verification claims

`verification: "verified"` requires direct inspection of the actual
content — watching the video, reading an accessible transcript/captions,
or another first-party representation that directly confirms Seonghwa
appears. Never mark an entry verified just because a third-party site,
hashtag, search snippet, or episode listing claims he's in it. Since
inspecting video content directly usually isn't possible when adding
entries via an AI assistant, a YouTube-sourced entry whose Seonghwa
relevance can't be directly confirmed stays `"unverified"`, even when
reliable external evidence supports adding the entry at all.

## Don't re-verify established information

Once a fact is established — an accepted source, existing archive data, or
an explicit instruction from the archive owner — accept it and move on.
Don't re-search it, question an accepted date/title/category, add
unnecessary verification caveats, or ask for reconfirmation of something
already given. Only re-check when sources clearly contradict each other,
new evidence conflicts with the record, or the archive owner asks for
re-verification. Establish → record → move on.

## Non-English sources

The original-language URL always stays as the primary source. Only add a
translation link (e.g. Google Translate) if you've actually confirmed it
resolves to readable translated content — some sites show an anti-adblock
wall on translate proxies, which fails this check. Never fabricate a
translation, and never replace the original with one; label each clearly
("Original:" / "English translation:") if both are present. If no
reliable translation access exists, omit it and rely on the entry's
English body-text summary instead.

## Description style

Body text should be natural, concise, reader-facing encyclopedia prose —
state plainly what the entry is about. Never put research methodology,
uncertainty explanations, source-validation commentary, or verification
reasoning into the body text; that belongs in metadata (`verification`,
source labels), not the prose.

## Source labels

Write a real, descriptive `label` for every source — never a generic
placeholder like "YouTube — Video," "Instagram — Post," or "ATEEZ Official
(X) — Post." Look up the actual title/caption and reflect it, matching the
style already used across the archive, e.g. `"KCON Official X
(@KCON_official) — KCON Hong Kong 2024 Daily Lineup: ATEEZ (Day 2)"`.

## Image selection

`image` is optional and should stay rare. The test is never "does a
legitimate image exist for this entry" — it's "is this the strongest
image that represents the entry and fits Starhwa's visual direction" (the
warm ivory/plum, restrained, archival tone documented in `DESIGN.md`).
Availability of *a* legitimate photo is necessary but not sufficient:

- Actively look for a relevant, legitimate image from the original/official
  source (or an appropriately licensed source) that directly relates to
  this specific entry — prefer that over a generic Seonghwa photo.
- Never use an unrelated, fan-taken, sasaeng, or questionable-provenance
  image just to fill the slot.
- If the only legitimate option is weak, awkward, low-quality, or off-tone,
  **omit `image` entirely** — the site's typographic fallback (the large
  year-numeral treatment) beats a mediocre image every time.
- For product-related entries, an official product image (`type:
  "product"`) is an acceptable anchor when no appropriate Seonghwa image
  exists.
- `url` must be a **stable, non-expiring** official/licensed host —
  YouTube, a brand's own site, a press kit, a magazine's own CDN. Most
  Instagram and X/Twitter image URLs are signed and expire; don't hotlink
  those even when the post itself is a legitimate official source — if no
  stable mirror of the image exists, that's a case for omitting `image`,
  not for linking a URL that will 404 later.
- `credit` is required whenever `url` is set — name the outlet, brand, or
  rights holder (e.g. `"ELLE Korea — September 2026 issue (cover)"`,
  `"adidas"`, `"KQ Entertainment"`).
- A curated `image` always takes priority over the automatic YouTube
  thumbnail a video source would otherwise generate for the entry's card.
  On the entry's own page, an embedded playable video still takes
  priority over a static `image` in the hero slot — a video source and a
  curated `image` can coexist on the same entry without conflict.
- New hosts must be added to `next.config.ts`'s `images.remotePatterns`
  before an `image.url` on that host will load — see `DESIGN.md`.

## Adding a new era

Eras are the four broad chapters shown on the homepage timeline and
Chronology page — they're structural, not per-entry data, so they live in
`src/data/eras.ts` rather than here. Add a new era there when the current
one ends; entries dated after its `startDate` will pick it up automatically.
