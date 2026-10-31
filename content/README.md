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
| `verification` | no       | `"verified"` or `"unverified"` (default). Internal only; not shown to visitors.  |
| `tags`         | no       | Short lowercase phrases. Used by search and future filtering.                                    |
| `sources`      | yes      | List of `{ label, url }`. At least one. Link to the original — never rehost media.               |
| `image`        | no       | `{ url, credit, type }`. An editorially curated visual anchor — see "Image selection" below.    |
| `related`      | no       | List of **other entries' filenames** (no `.md`), e.g. `golden-hour-part-1`.                     |
| body text      | yes      | Everything below the closing `---` is the entry's summary. Follow the "Main page / Read entry" structure below.        |

## Body structure: Main page / Read entry

Every entry's body follows the same two-part structure, applied
consistently across the whole archive — old entries being revised and
new entries alike. Never invent a different shape for an individual
entry.

**Main page** — the `summary` shown on cards, in search results, and as
the page's meta description:

- One short line. A fragment is fine — it doesn't need to be a complete
  sentence.
- Concise, but meaningfully descriptive: keep the most important/
  newsworthy identifying information — the brand, collaborator, project,
  event, performance, or publication — that's the actual reason the
  entry is notable. Don't strip it down to a bare "who/what/when" label
  if that loses that reason.
- Secondary detail — photographer/stylist credits, extended event
  context, background, supporting facts — belongs in "Read entry" below,
  not here.
- No research methodology, source explanations, uncertainty notes, or
  long detail — none of that belongs here.

**Read entry** — the fuller text shown on the entry's own page:

- 1–3 short paragraphs.
- Opens with basic context: what it is, the publication/brand, the
  issue or event, and the date when relevant.
- Then briefly covers the Seonghwa-specific content.
- Includes a quote or detail only when it adds real value — not
  exhaustively.
- Reads like a normal archive entry, not a research report — never
  explains how information was found, reconstructed, or verified.
- Never includes "unverified," "could not be confirmed," or similar
  methodology language. If a detail can't be supported, leave it out
  rather than caveating it — `verification` in the frontmatter is where
  that status actually lives.
- Mentions other ATEEZ members only when necessary to understand the
  Seonghwa-specific content.
- Paraphrases the source naturally — never copies its wording directly.

**Sources** stay in the frontmatter `sources` field, not in the prose —
keep links/credits out of both "Main page" and "Read entry" text.

`SHW-YYYY-###` catalog IDs are internal bookkeeping (see "What you never
set by hand" below) — never write one into the "Main page" or "Read
entry" prose itself.

This short-card/full-text split is the standing default structure for
every entry — new entries and edits to existing ones alike, not a
special case reserved for unusually long material. Always put the
`<!-- full-text -->` marker on its own blank line between the two parts:
everything **before** it is the "Main page" summary (`summary`),
everything **after** it is the "Read entry" content, shown collapsed as
"Read the Full Entry" on the entry's own page. When revising an existing
entry to fit this structure, preserve all of its existing substantive
information — move it into the `fullText` section below the marker
rather than deleting it.

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

## Embedding an X post

Social Media entries automatically embed their first official ATEEZ X post.
Every other category — Music, Awards, and the rest — is opt-in: add
`embed: true` to the one source you want shown. Adding an X link to a Music
entry's `sources` does **not** embed it on its own, so an entry in a series
(e.g. a GOLDEN HOUR concept photo) stays consistent with its neighbours
unless an embed is chosen deliberately:

```yaml
sources:
  - label: "Hanteo Music Awards Official X — ..."
    url: "https://x.com/Hanteo_HMAs/status/..."
    embed: true
```

It works for any X account, is ignored when the entry already has an
embeddable YouTube video (never two players), and the link stays listed
as a normal source.

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

## Tour/concert entry sourcing (Tours category)

This is a stricter, permanent override of "Source link priority" above,
scoped to `category: "Tours"` entries tagged `"concert"` — the shows
listed on `/tours` (`src/app/tours/page.tsx`, `src/lib/tours.ts`), which
enforces one uniform row per entry (`[Date] — [Tour/Event]` /
`[Location]` / `View source →`) and never shows a source's type, only
the link itself, when one qualifies.

**The rule.** A concert entry's "View source" link may point ONLY to
official ATEEZ content specifically about that show:
- an `@ateezofficial`/`@ateezofficialjp` post on X — either a
  `#TODAY_ATEEZ` post, or a confirmed ATEEZ selfie/photo taken at that
  specific concert venue; or
- an official ATEEZ YouTube video/short about that specific show (e.g.
  a per-city tour-recap short).

Never a KQ platform link (schedule or a specific `contents/` page),
never Facebook, Dispatch, a venue/promoter account, a fan account, a
repost, or any other secondary source — regardless of how
official-looking or KQ-adjacent it is.

**Adding or fixing a concert entry's source:**
1. Identify the concert's date, tour/event name, and city (venue if
   known — most entries only record city, since that's what the
   platform itself publishes; never invent a venue name).
2. Find the actual official post/video for that specific date —
   for X, read its real content (a proxy like
   `api.fxtwitter.com/<handle>/status/<id>` works when `x.com` itself
   returns a 402; do not guess a status ID); for YouTube, a title alone
   is often enough to confirm the city, but cross-check the date
   against a source like setlist.fm when the upload date itself isn't
   readable (YouTube's own pages don't expose it to a simple fetch).
3. Confirm the post/video genuinely corresponds to that show — a
   matching date alone isn't enough if the account posted about
   something else that day; it should name the tour/city/day number, or
   be an unambiguous same-event photo/video.
4. Save it as a `source` on that entry, and set
   `qualifiesForTourSource: true` on that specific source (see
   `src/lib/types.ts` `Source.qualifiesForTourSource` and
   `src/lib/schema.ts`) — only after actually confirming step 3, never
   by default or by inferring it from the label text. This flag, not
   the label wording, is what `qualifyingSourceUrl()` in
   `src/lib/tours.ts` uses to decide whether `/tours` shows a link at
   all. For a YouTube source this flag is the ONLY signal the code can
   use (there's no handle to check in a `youtube.com`/`youtu.be` URL the
   way an X profile has one) — never skip actually confirming it's the
   official ATEEZ channel first. (A same-day pre-show
   announcement/poster/hype post does not qualify, even from the right
   X account — it must be the day-of venue content itself.)
5. If more than one qualifying post/video exists for the same date, use
   whichever is more directly about that specific show (a
   `@ateezofficialjp` post naming the exact Japan date beats a generic
   `@ateezofficial` regional poster, for instance).
6. **If nothing qualifies, don't substitute KQ or anything else to fill
   the slot.** The entry still needs at least one `source` (the schema
   requires it), so keep whatever's the best available citation — KQ
   is fine here, same as any other category — but do not set
   `qualifiesForTourSource` on it. `/tours` will correctly show no
   "View source" link for that entry until a real one is found; that's
   the intended, permanent state, not a bug to route around.

**On an aggregate multi-date entry** (e.g. a "Europe Leg" entry covering
several cities under one entry rather than per-city entries): don't
split it into per-city entries just because a per-city source (like a
YouTube short) happens to name one. Attach each verified source to the
existing aggregate entry instead — multiple qualifying sources can
coexist on one entry; `qualifyingSourceUrl()` just uses the first
match. Only restructure into per-city entries if that's explicitly
asked for.

This process applies automatically to every new Tours/concert entry
going forward, not just a one-time cleanup — check it every time such
an entry is added or edited.

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
state plainly what the entry is about. See "Body structure: Main page /
Read entry" above for the specific shape every entry's body follows.

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

## Image sourcing & permission

Different official boards/platforms have different rules about external
sharing — e.g. KQ's ATEEZ Official Platform has multiple boards, and
they don't all permit the same thing: the **FOR_ATINY** board explicitly
permits external sharing with ATEEZ Official Platform attribution, while
**ATINY ZONE** explicitly prohibits it. A screenshot being technically
possible, or a post being publicly visible, is never evidence of
permission — only an explicit, confirmed rule from the source is.

Every `image` therefore carries a `sharePermission` field
(`"permitted" | "prohibited" | "unknown"`, see `EntryImage` in
`src/lib/types.ts`):

- Set `sharePermission: "permitted"` **only** after you've actually
  confirmed the specific board/platform/outlet allows it — e.g. an image
  from KQ's FOR_ATINY board. Also fill in `sourcePlatform` (the specific
  board/outlet, not just the general brand — e.g.
  `"ATEEZ Official Platform — FOR_ATINY"`) and `sourceUrl` (the original
  post/page) when available, so the permission decision stays traceable
  back to where it was confirmed.
- Set `sharePermission: "prohibited"` for an image from a board/source
  known to disallow external sharing (e.g. ATINY ZONE) — this documents
  the finding, and also guarantees the app never surfaces it (see
  below), even if someone later adds a `url`/`credit` for it.
- **Leave the field unset (or explicitly `"unknown"`) whenever
  permission hasn't actually been confirmed** — this is the default, and
  the correct choice any time you're not sure. Never write `"permitted"`
  as a guess, and never reason from "it's an official account" or "it's
  already public" to "permitted" — those aren't the same thing, and
  KQ's own boards prove it (FOR_ATINY and ATINY ZONE are both official,
  both public, and have opposite rules).

**This isn't just documentation — it's enforced in code.**
`publicImage(entry)` in `src/lib/layout.ts` is the single gate every
public image display in the app goes through (card thumbnails, an
entry's hero image, OG/Twitter meta images, the homepage's Featured Era
photo) — it returns an entry's `image` only when `sharePermission` is
exactly `"permitted"`, and `null` otherwise. An `"unknown"` or
`"prohibited"` image still renders fine as data (it's valid frontmatter,
and still useful as a documented, traceable record of what exists and
why it can't be shown), it just never appears anywhere on the live site
until someone actually confirms permission and updates the field.

## Adding a new era

Eras are the four broad chapters shown on the homepage timeline and
Chronology page — they're structural, not per-entry data, so they live in
`src/data/eras.ts` rather than here. Add a new era there when the current
one ends; entries dated after its `startDate` will pick it up automatically.
