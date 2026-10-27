# Design Specification

This document describes the design system already implemented across
`src/app` and `src/components`. It is descriptive, not aspirational — every
rule below reflects a pattern that exists in the codebase today. When adding
or editing UI, match these patterns rather than introducing new ones.

This file governs visual/UI design. For adding or editing archive content,
see [content/README.md](content/README.md) instead.

## 1. Point of View & Design Direction

The site reads as a catalog/archive, not a fan blog or a marketing site.
Every surface reinforces this:

- Entries carry an ID and a date stamp, displayed like catalog metadata
  (e.g. `EntryCard.tsx`, `StandardEntry.tsx`).
- Section labels use short uppercase "eyebrow" text above headings
  (`"On This Day"`, `"Featured Era"`, `"Latest Additions"` in `page.tsx`).
- Headlines pair a serif display face with monospace metadata — the
  contrast between the two signals "curated record," not "blog post."
- Copy is factual and restrained (see `Footer.tsx`'s disclaimer language,
  `about/page.tsx`) — no marketing tone, no exclamation points.

New pages/components should keep this catalog voice: label things with
IDs/dates/categories before prose, and let structure carry authority
rather than decorative flourish.

## 2. Typography

Three typefaces, each with one fixed role, loaded via `next/font/google`
in `src/app/layout.tsx`:

| Role | Font | CSS var | Used for |
|---|---|---|---|
| Display | Fraunces (`opsz`, `SOFT`, `WONK` axes) | `--font-display` | Headlines, entry titles, big numerals |
| Body | Archivo | `--font-sans` | Paragraph text, nav, default body font |
| Meta/mono | IBM Plex Mono (400/500/600) | `--font-mono` | Eyebrow labels, meta labels, buttons |

Rules:

- All fonts load with `display: "swap"` — never block render on font load.
- Meta/label typography always goes through the shared `.eyebrow` (11px)
  or `.meta` (10px) classes in `globals.css`, both uppercase with
  `0.14em` letter-spacing. Don't hand-roll a one-off label style —
  extend `.eyebrow`/`.meta` instead.
- Headline sizing scales fluidly where it's a hero moment, using `clamp()`
  (see the H1 in `page.tsx`: `clamp(2.75rem,6vw+1rem,4.5rem)`), and with
  fixed Tailwind steps (`text-2xl` → `text-5xl`) elsewhere.
- Body copy defaults to `leading-relaxed` at `text-sm`/`text-base`; never
  set body text below `text-xs` except for the mono meta labels.

## 3. Color System

Nine CSS custom properties, defined once in `globals.css` and nowhere
else. No ad-hoc hex values elsewhere in the codebase.

```css
--ivory: #f5f1e6;       /* primary background */
--ivory-dim: #eae2cd;   /* secondary/panel background */
--ink: #15130f;         /* primary text, filled buttons, image backdrops */
--charcoal: #3a352c;    /* secondary text (used with /opacity, e.g. charcoal/75) */
--plum: #5c1f30;        /* the single accent color — links, hover, active state */
--plum-deep: #431722;   /* reserved dark variant of plum */
--plum-tint: #8a4356;   /* reserved light variant of plum */
--line: #cabe9f;        /* borders */
--line-soft: #ddd3b6;   /* soft/secondary borders */
```

Rules:

- **Plum is the only accent.** Every hover state, active nav item, and
  emphasis color in the codebase is `plum` — there is no second accent
  color. Don't introduce one without updating this spec.
- Borders, not shadows, delineate sections and cards (`border-line`
  throughout; grep finds no `box-shadow`/`shadow-*` usage in components).
- Text color is layered with Tailwind opacity modifiers on `charcoal`
  (`text-charcoal/70`, `/75`, `/80`, `/85`) rather than new named colors —
  reuse this pattern for new secondary-text needs instead of adding a
  new gray.

## 4. Hierarchy & Whitespace

- Page sections are separated by `border-b border-line`, not background
  color changes or shadows (see every `<section>` in `page.tsx`).
- Section vertical padding follows a consistent scale as viewport grows:
  `py-14` (mobile) → `sm:py-16`/`sm:py-20` → `lg:py-28` for hero-weight
  sections. Reuse these exact steps rather than inventing new ones.
- Two container widths are used site-wide: `max-w-[1400px]` for grid/list
  pages (home, archive, chronology) and `max-w-3xl` for single-column
  reading content (entry pages, about). Don't introduce a third.
- Grids use `gap-x-6 gap-y-10` at the base, widening to `sm:gap-y-12
  lg:gap-x-8` (see `EntryGrid.tsx`) — keep row gap larger than column gap
  in card grids, matching this ratio.
- The entry grid is intentionally heterogeneous (feature / media / standard
  / compact-group variants, planned in `src/lib/layout.ts`), not a uniform
  card wall — this is a deliberate editorial layout, not an oversight.

## 5. Imagery

- All raster images go through `next/image` with `fill` + a responsive
  `sizes` attribute matched to the grid column width at each breakpoint
  (see `MediaEntry.tsx`, `FeatureEntry.tsx`). Never use a bare `<img>`.
- Every entry's visual anchor resolves through one function,
  `imageFor()` in `src/lib/layout.ts`: an editorially curated
  `entry.image` (see `content/README.md` "Image selection" — never
  attached mechanically) takes priority over an automatic YouTube
  thumbnail derived from an embeddable video source; entries with neither
  have no thumbnail. This is the only place that decides which image an
  entry shows — card components never source an image themselves.
  `imageFor()` itself only ever considers a curated image that passes
  `publicImage()` (same file) — see §11 "Image sourcing & permission"
  for what that gate does and why.
- Two image treatments, chosen by `entry.image.type`:
  - `"photo"` (default, and always what an auto-derived YouTube thumbnail
    uses) — full-bleed `object-cover` on a `bg-ink` backdrop, never
    stretched. `FeatureEntry.tsx` additionally overlays a subtle
    `from-ink/25` gradient for legibility.
  - `"product"` — `object-contain` with padding on a `bg-ivory-dim`
    backdrop instead, so a product shot (typically already shot on a
    light background) isn't cropped or forced into a photo's letterbox
    treatment. No gradient overlay.
- When an entry has no thumbnail, `FeatureEntry.tsx` falls back to a large
  display-font numeral (the entry's year) rather than a placeholder image
  or empty space — reuse this pattern for other no-image states.
- The entry detail page (`archive/[slug]/page.tsx`) shows, in priority
  order: an embedded playable video if the entry has one (richer than any
  still), otherwise a static hero rendering of `entry.image` at
  `object-contain` (uncropped, since a hero may be a portrait magazine
  cover that `object-cover` would ruin) with its `credit` printed beneath
  it, otherwise nothing. Grid-card thumbnails stay `object-cover`/crop —
  the uncropped treatment is specific to the single full-width hero slot.
- **Alt text policy:** content images use `alt=""` because the entry
  title is always rendered as adjacent visible text in the same card or,
  on the entry page, directly above the hero (title doubles as the text
  alternative). This is intentional, not an oversight — keep doing this
  *only* when a text equivalent is visibly adjacent; if a future
  image-only surface has no adjacent title text, it must get a real
  descriptive `alt`.
- Video is embedded only via `youtube-nocookie.com`, with `loading="lazy"`
  and a fixed `aspect-video` wrapper (`VideoEmbed.tsx`) — no autoplay.
- New image hosts must be added to `next.config.ts`'s
  `images.remotePatterns` before they'll load — keep this an explicit
  allowlist, never disable it.

## 6. Motion

Motion is intentionally minimal and utilitarian — it confirms an
interaction, never decorates.

- All transitions are capped at **150–300ms**, `ease`/`ease-out` only
  (`transition: color 150ms ease, background-color 150ms ease,
  border-color 150ms ease` in `.btn`, `globals.css`). Three explicit,
  documented exceptions exist — 별빛팡팡 (§6.1, 700–900ms), the 떵별이
  sighting prototype (§6.1, 4000ms), and the Moonlit Archive's day/night
  transition (§9, 8s/3.5s) — because each is a rare or slow-by-design
  beat, not ordinary UI feedback. Don't add a fourth without the same
  reasoning.
- The only motion beyond color/border transitions is a subtle
  `scale-[1.03]` on thumbnail hover (`MediaEntry.tsx`) and a 1-character
  arrow nudge on card hover (`group-hover:translate-x-1`, `EntryCard.tsx`).
- No entrance animations, no scroll-triggered effects, no animation
  libraries in `package.json` — motion is CSS-only.
- `prefers-reduced-motion: reduce` is honored globally (`globals.css`,
  collapses all animation/transition durations to near-zero) **and**
  per-component where relevant (`motion-reduce:transition-none
  motion-reduce:group-hover:scale-100` on the thumbnail hover in
  `MediaEntry.tsx`). Any new motion must ship with an explicit
  reduced-motion fallback, not just rely on the global rule.

### 6.1 별빛팡팡 (byeolbit pangpang) — the one decorative motif

The site's single piece of "unnecessary" motion, deliberately scoped so
it reads as a discovered detail rather than decoration. It exists
because the brand mark (`Mark.tsx`, `icon.svg`) already carries a
4-point glint in its corner — 별빛팡팡 is that same glyph, extracted into
`Glint.tsx`, recurring briefly elsewhere. It is not a second decorative
language layered onto the archive; don't invent a different sparkle
shape, easing, or color for it.

- **Component:** `Glint.tsx` renders one glint (`aria-hidden`,
  `pointer-events-none`, absolutely positioned). It never decides *when*
  it's visible — that's the trigger class on its positioned ancestor.
- **Triggers (`globals.css`, `@keyframes glint-pop`, 700–900ms
  ease-out, single-shot — never `infinite`):**
  - `.glint-hover` — the glint pops on `:hover`/`:focus-within` of the
    element carrying the class, and resets every time hover re-applies.
    Use for repeatable interactive surfaces: card hover
    (`EntryCard`/`MediaEntry`/`StandardEntry`/`FeatureEntry`/
    `CompactGroup` row), the header brand mark, and the homepage's one
    primary CTA. Don't add it to every button or every nav link — one
    or two glints per hovered element, not a shower.
  - `.glint-burst` — plays once, unconditionally, on mount. Reserve for
    genuinely "you've arrived somewhere notable" moments: the entry
    page's `<h1>` when the entry has a real hero (video or curated
    image — see `hasHero` in `archive/[slug]/page.tsx`), and the
    homepage's "On This Day" panel. Never gate this on scroll position;
    it's an arrival beat, not a scroll trigger.
- **Color:** always `var(--plum)` with a faint `drop-shadow` in the same
  color for a soft glow — no new hue. This stays true to "plum is the
  only accent" (§3); 별빛팡팡 is plum given motion, not a second color.
- **Static motif:** a single unanimated `✦` also appears as a quiet,
  permanent glyph in two spots — `YearDivider.tsx` (next to the year
  rule) and as a prefix on "hero" eyebrows (`FeatureEntry.tsx`, and the
  entry page when `hasHero`) — signaling "this one's a highlight"
  without motion. Don't replace the ubiquitous `·` metadata separator
  used everywhere else with `✦`; that pattern stays as-is.
- **Reduced motion:** `.glint { display: none; }` under
  `prefers-reduced-motion: reduce` (`globals.css`) — glints disappear
  entirely rather than flashing once, which the global near-zero-duration
  rule alone would produce.
- **Restraint is the point.** Not every card row, not every button, not
  every page load. If a new surface is genuinely a repeatable hover
  interaction or a genuine arrival moment, it may earn a glint —
  everything else stays quiet.

## 7. Mobile-First / Responsive

- Tailwind classes are written mobile-first throughout: unprefixed
  utility = base/mobile style, `sm:`/`lg:` add complexity upward. Never
  write a `lg:`-only style with no mobile-appropriate base.
- Two effective breakpoints are used consistently: `sm:` (~640px, mostly
  spacing/type-size bumps) and `lg:` (~1024px, structural changes like
  grid-column counts and the desktop nav). `xl:` appears only once
  (search bar width) — don't add new `xl:`-only behavior without reason.
- Navigation is fully separate between breakpoints: a horizontal bar +
  inline nav row at `lg:`, collapsing below that into a full-screen
  drawer (`role="dialog"`, focus trap, `Escape`-to-close, body-scroll
  lock) — see `Header.tsx`. Reuse this drawer pattern for any future
  mobile-only overlay.
- Grid column counts step up with viewport: 1 → `sm:grid-cols-2` →
  `lg:grid-cols-3` (or `lg:grid-cols-4` for the official-links grid) —
  never jump straight from 1 to a 3+ column grid without the
  intermediate step.

## 8. Performance, Accessibility & SEO

**Performance — in place:**
- Fonts load with `display: swap`.
- YouTube embeds are `loading="lazy"`.
- Entry pages are statically generated (`generateStaticParams` in
  `archive/[slug]/page.tsx`).
- Remote images are restricted to a known host allowlist
  (`next.config.ts` → `images.remotePatterns`, currently `i.ytimg.com`
  only) — add new hosts here explicitly rather than disabling the
  allowlist.

**Accessibility — in place:**
- Skip-to-content link as the first focusable element (`layout.tsx`).
- Visible `:focus-visible` outline defined globally (`globals.css`).
- `aria-label`, `aria-current="page"`, `aria-expanded`, `aria-haspopup`,
  and `role="dialog"` used correctly on interactive/nav components
  (`Header.tsx`).
- `eslint-config-next`'s `core-web-vitals` config (which includes
  `jsx-a11y` rules) runs on every lint pass (`eslint.config.mjs`).

**SEO — in place:**
- Every route defines `metadata` or `generateMetadata` (title +
  description), including per-entry dynamic titles.

**SEO — gap, not yet implemented:**
- No `sitemap.ts`, `robots.ts`, or web app manifest exist in `src/app`.
- No Open Graph / Twitter Card metadata or JSON-LD structured data on any
  page.

These two SEO items are the only open gaps against this spec as of the
date this document was written. Closing them (adding `sitemap.ts`,
`robots.ts`, and OG metadata to `generateMetadata` calls) is recommended
but out of scope for this document.

## 9. The Moonlit Archive (day/night atmosphere)

The site's atmosphere shifts continuously with the visitor's local time —
not a manual dark-mode toggle, and not a hard switch at a fixed hour.
`src/lib/atmosphere.ts` computes a 0–1 "night amount" from a
piecewise-linear curve centered on the visitor's real local sunset and
sunrise (see 🌅 Golden Hour below for how those are calculated) rather
than a fixed clock hour — gradual ramps either side, ~2.5h at dusk and
~2h at dawn; `Atmosphere.tsx` (mounted once in `layout.tsx`) writes that
value to `--night`/`--night-text` on `<html>` every 30s, and a registered
`@property` + `transition: --night 8s ease, --night-text 3.5s ease`
(`globals.css`) does the actual smooth easing between ticks — no JS
animation loop.

**This is why the 7 core color tokens are no longer flat hex values.**
`--ivory`, `--ivory-dim`, `--line`, `--line-soft`, `--ink`, `--charcoal`,
and `--plum` are each a `color-mix()` between a `-day` and `-night` hex,
blended by `--night` (backgrounds) or the steeper `--night-text`
(foreground/text — see the code comment above `:root` in `globals.css`
for why text needed its own, faster-swapping curve: a shared curve made
body text pass through a near-unreadable contrast midpoint for a real
stretch of the transition). Every existing component already consumes
these token names via Tailwind utilities (`bg-ivory`, `text-charcoal/70`,
`border-line`, etc.) — none of them were or should be edited for this;
the blend is the whole mechanism. `--plum-deep`/`--plum-tint` stay static,
untouched, exactly as reserved in §3.

**Known trade-off, by design, not a bug:** `--plum` and `--charcoal` dip
to roughly 2.1–2.5:1 contrast for ~10–12 minutes twice a day, mid-ramp —
`--ink` (primary body text) never drops below ~3.9:1. Further lightening
`--plum`/`--charcoal`'s night hex was tested and plateaus without
abandoning "stays in the plum family, not washed-out pink." Accepted as
bounded and secondary-text-only rather than solved with per-token custom
easing curves.

The decorative sky layer itself (a soft moon, ~18 twinkling stars, a rare
sparkle reusing 별빛팡팡/`Glint.tsx` — no second sparkle shape — and a rarer
shooting star) lives in `Atmosphere.tsx`/`.atmosphere-*` classes,
`fixed inset-0 -z-10 pointer-events-none aria-hidden`, behind all real
content. It requires `body { isolation: isolate; }` — without it, a
negative-z-index fixed child paints behind body's own background and
disappears entirely, not just behind content. Stars fade in *after* the
moon (a delayed opacity curve, not the same one), matching "a moon
appears, and the first tiny stars begin to emerge" as two staggered
beats. Twinkle/shooting-star animations stop under
`prefers-reduced-motion: reduce` (mirroring the `.glint`/
`.ddeongbyeol-sighting` `display: none` pattern in §6.1 — the global
near-zero-duration rule alone isn't enough for `infinite` animations);
the moon and stars themselves stay visible, just static.

`AtmosphereNote.tsx` (rendered once, in `Footer.tsx`) is the feature's one
piece of microcopy — a single quiet `.meta`-styled line picked from 7
time-of-day buckets, recomputed every few minutes, never on every clock
tick. Its tone ("The moon has found the archive. 🌙") is a deliberate,
scoped departure from §1's documented "factual, restrained, no marketing
tone" voice — same Easter-egg spirit as 별빛팡팡, not a precedent for
loosening that voice elsewhere.

This is scenery, not a character: `DdeongbyeolSighting.tsx` (§6.1's 떵별이
sighting) is untouched by this feature and remains the site's only
creature. The sky layer's moon/stars/sparkle are kept as separate pieces
specifically so a future wandering creature could eventually be added to
the night atmosphere without restructuring it — nothing here implements
that creature.

**🌅 Golden Hour — a third state, Day → Golden Hour → Moonlit Night.**
Night's timing (above) and Golden Hour both derive from the same real
sunrise/sunset calculation — `getSunTimes()` in `atmosphere.ts`, the
standard solar-declination/hour-angle formula — rather than a fixed
clock hour, so the sequence stays coherent across seasons instead of a
fixed "5pm" drifting out of sync with an actual sunset that moves by
hours over the year.

The one input that formula needs beyond the date — latitude — has no
external service and no permission prompt behind it:
`Intl.DateTimeFormat().resolvedOptions().timeZone` gives an IANA zone
name, mapped to an approximate representative latitude via a small
lookup table (`TIMEZONE_LATITUDES`, ~35 common zones, ~35°N default
otherwise). That's the one approximation in the calculation — expect
real local sunrise/sunset to land within roughly ±30–45 minutes of the
computed value, appropriate for a decorative atmosphere rather than a
solar calculator (the same precision philosophy as the lunar-phase math
below).

`getGoldenAmount()` is a bump, not a ramp — 0 well before and after,
peaking shortly before sunset and shortly after sunrise — driving a
`--golden` custom property nested *on top of* the existing day/night
blend: `--ivory`, `--ivory-dim`, `--line`, and `--line-soft` each gain a
warm `-golden` variant blended in by `--golden`, layered over their
day/night `color-mix()` result rather than replacing it. Deliberately no
`--ink-golden`/`--charcoal-golden`/`--plum-golden` — text and the
plum/pink accent stay driven only by `--night-text`, completely
untouched by Golden Hour, and so is the lunar-phase math itself (the
moon's shape/position formulas are unchanged — only its *opacity* now
also depends on `--golden`, see below). Because `--golden` is 0 at both
endpoints, full day
and full night are provably identical to before this feature existed —
verified directly (forcing `--night`/`--golden` and reading computed
styles): day resolves to exactly `#f5f1e6`, night to exactly `#181120`,
matching the pre-Golden-Hour hex values with zero drift.

**✦ ASTRAL SKY — the sky is permanently visible, evolving continuously
through DAWN → DAY → GOLDEN HOUR → TWILIGHT → NIGHT, not five separate
presets.** `.atmosphere-sky` (`globals.css`, renamed from the earlier
`.atmosphere-goldensky`) is rendered by `Atmosphere.tsx` as the first
child of the same fixed `.atmosphere` layer the moon/stars use — behind
them, and behind all real content. Earlier, this layer's opacity was
literally `var(--golden)`, so outside the Golden Hour bump there was no
sky at all, just the flat `--ivory`/`--ink` token colors — that flatness
was the actual reason day and night didn't read as one continuous living
sky. Its opacity is now a permanent `1`; every stop's *color* carries the
whole day's evolution instead.

Each of the sky's 14 gradient stops resolves through the same 2-level
`color-mix()` chain the `--ivory` token above already uses, extended to
3 levels:

1. `--sky-N-day` / `--sky-N-night`, blended by the existing `--night`
   (already the correct, real-sun-time-anchored day↔night curve — no new
   astronomy). This alone makes plain day and plain night each a genuine
   vertical gradient — a pale, luminous blue-white sky by day, a deep
   near-black indigo by night, both fading gently toward the horizon —
   instead of the previous flat nothing.
2. `--sky-N-transition`, blended in on top by a new derived value,
   `--sky-transition` (`:root`): `calc(1 - abs(var(--night) * 2 - 1))` —
   0 at full day and full night, peaking at 1 exactly when `--night =
   0.5`, the midpoint of whichever real dawn or dusk ramp
   `getNightAmount` is in the middle of. This needs **no new astronomy
   and no entry in the transition list** — it's a derived expression of
   the already-registered, already-transitioning `--night`, so it
   re-resolves every frame for free. (It *is* registered via
   `@property`, like `--night`/`--golden` — an earlier draft of this
   paragraph claimed it didn't need to be; see the code comment on its
   `@property` block for why an unregistered derived value nested inside
   another `color-mix()`'s percentage argument doesn't reliably resolve.)
   Deliberately symmetric: dawn and dusk share the same indigo/violet
   character (both are genuinely "blue hour" skies); the
   approaching-day-vs-approaching-night distinction is already carried
   by which direction `--night` itself is moving. This tint exists
   because mixing the day and night hexes directly would produce a
   muddy, flat gray exactly at the moment the sky most needs color — the
   transition hexes are instead a genuinely saturated rose-violet at the
   horizon, fading to something very close to that 50/50 day/night blend
   by the zenith stops, so the top of the sky barely moves (the same
   "zenith stays put" trick Golden Hour's own early/late stops already
   use — achieved through hex *choice*, not a numeric weight term).
3. `--sky-N-early`/`--sky-N-late` (unchanged), blended by
   `--golden-progress` into `--sky-N-goldenmix`, then layered on top by
   `--golden` exactly as before — Golden Hour's own appearance is
   untouched, only what it now sits on top of has changed.

Each stage is its own custom property (`--sky-N-base` →
`--sky-N-transitioned` → `--sky-N-goldenmix` → `--sky-N-final`) rather
than one nested expression inline in the gradient, so any single stage
is independently inspectable in DevTools.

The horizon haze (a `linear-gradient` layered above the main sky
gradient) needed its own explicit gate once the parent's opacity stopped
gating it: it's now mixed toward `transparent` by
`calc((1 - max(var(--golden), var(--sky-transition) * 0.6)) * 100%)`, so
it's genuinely absent during flat day/night and only present near Golden
Hour or the dawn/dusk peak, rather than relying on a parent opacity that
no longer exists for this purpose.

It's still 14 close hex stops per stage rather than 3–4 hue-jumping
ones — interpolating directly between distant hues bands or muddies, so
each stop nudges only slightly (deep blue → indigo → violet → dusty
mauve → soft rose → peach → champagne, for the golden overlay; pale
blue-white → warm neutral for day; deep indigo → near-black for night;
rose-violet → blue-gray for the transition tint) to read as one
continuous wash. Every hex, at every stage, stays low-saturation — no
neon, no postcard color — the transitions themselves carry the beauty,
not effects layered on top of them. No cloud shapes are drawn here —
there's no real weather data behind this feature, and decorative clouds
that wouldn't correspond to actual conditions were deliberately left out
rather than kept as unconditional scenery; if real weather/cloud data is
ever wired in, it belongs in this same layer.

Two homepage panels use translucent backgrounds over this layer — the
"On This Day" panel (`bg-ivory-dim/60`) and "Featured Era" section
(`bg-ivory-dim/40`) in `page.tsx` — so the sky now visibly shows through
them, continuously shifting with time of day. This is the "one
continuous sky" effect working as intended, not a side effect; text
contrast against it was verified across all five phases (below) before
shipping.

**Atmospheric depth — a layered ZENITH → HORIZON volume, not another
gradient stacked on the palette.** The 14-stop sky above establishes
*color*; this is a separate, additive pass establishing *depth*, layered
as two extra `background-image` entries on `.atmosphere-sky` ahead of the
existing haze and main-gradient layers — it changes no `--sky-N-*` hex
and no stop position.

1. A vertical wash from `rgba(255,244,225,var(--sky-horizon-lift))` at
   0% through transparent across 38–62% to
   `rgba(18,14,22,var(--sky-zenith-recede))` at 100%. The wide transparent
   middle band is deliberate: mid-sky is left untouched by either cue, so
   it reads as the calm, atmospheric middle distance between a warmer,
   denser horizon and a quieter, receding zenith, rather than becoming a
   third visible band.
   - `--sky-horizon-lift` (`:root`, registered `@property`, same
     resolution reason as `--sky-transition`) is
     `max(var(--golden), var(--sky-transition) * 0.85, calc((1 -
     var(--night)) * 0.14))` — a small constant baseline by Day, the
     strongest value at Golden Hour, a slightly reduced peak at
     Twilight/Dawn, and **exactly 0 at full Night** — the horizon stays
     deep and clear there rather than acquiring a permanent haze.
   - `--sky-zenith-recede` (same registration) is `calc(var(--night) *
     0.18 + 0.04)` — a small, mostly state-independent recession that
     only deepens at Night ("dark upper sky"), consistent with "zenith
     stays put" elsewhere in this system: it's a depth cue layered over
     the palette, not a change to it.
2. A second, much fainter layer — a wide `radial-gradient` anchored at
   `calc(8% + var(--sun-x) * 84%) 102%` — biases that same horizon glow
   toward wherever the sun actually sits horizontally
   (`rgba(255,240,210,calc(var(--sky-horizon-lift) * 0.4))`, a flat 0.4×
   fraction of the lift above), so light reads as entering from a
   direction rather than uniformly along the whole horizon. Deliberately
   kept to a fraction of the first layer's own intensity so it never
   reads as a second glowing blob — no new visible shape, only a soft
   asymmetry in the glow that's already there.

Star depth is size *and* softness, not a second animation:
`.atmosphere-star` picks 5 of the 18 hand-placed stars (via `nth-child`)
to render at 3px instead of 2px, and one at 4px, so a handful read as
nearer/brighter — each size tier also gets a slightly smaller `blur()`
(0.4px at the base tier down to 0.15px at the brightest), so the tiniest,
most distant-reading stars are also the softest, and the sky's one
standout star is the crispest — without any new keyframe; the existing
`atmosphere-twinkle` animation is untouched, and the blur is a static
filter, not an animated one.

`.header-golden-glass`'s formula widened from responding to `--golden`
alone to `max(var(--golden), var(--sky-transition) * 0.5)`, using
`max()` rather than addition so the two effects don't stack unboundedly
at any edge overlap — the header reads glassy against the sky during
dawn/dusk too, more subtly than its more dramatic Golden Hour peak, with
no changes to `Header.tsx` itself.

**Closing the beige framing at the top and bottom edges of the
viewport.** The sticky header and the footer are the two real, opaque UI
elements in front of `.atmosphere` in the stacking order (header at
z-40, footer in normal flow, sky at z-‑10) — however rich the sky
gradient became, either one's own background could still block it, at
the exact top and bottom edges of the viewport where the whole point of
this feature was for the sky to visibly reach.

A first pass just made both translucent, tinted toward `--ivory` (the
existing day/night/golden-blended token already used everywhere else in
the color system). That closed most of the gap but still left a visible
seam: `--ivory` is a real time-of-day blend, but it's computed
*independently* of the sky gradient, so its hue simply doesn't match
`.atmosphere-sky`'s own color at that position — even at low opacity, a
mismatched hue reads as "a panel sitting in front of the sky," not
"glass that's part of it."

The actual fix was to stop referencing `--ivory` for this at all, and
tint each surface toward the sky gradient's *own* nearest stop instead:
- `.header-golden-glass` tints toward `--sky-100-final` — the zenith
  stop, which is exactly what `.atmosphere-sky`'s `to top` gradient
  renders at `top: 0`, the header's own fixed position. Same source, not
  a matching color, so there's no hue left to seam against — only this
  layer's own opacity, which now reads as glass thickness rather than a
  different surface. A flat 38% year-round, no golden/transition-based
  formula — matching the hue is what made that formula unnecessary.
- `.footer-sky-glass` (replacing an earlier `bg-ivory/55` utility in
  `Footer.tsx`) tints toward `--sky-0-final`, the horizon stop, the same
  way. The footer isn't pinned to one fixed viewport position the way
  the header is, so this is a close approximation rather than an exact
  match — close enough, once blurred, that there's no perceptible seam
  in practice, since `.atmosphere` is `fixed; inset: 0` and therefore
  always covers exactly the current viewport: the sky slice directly
  behind the footer at any given scroll position is the same live
  gradient, moon, and stars as everywhere else on the page.
- Both rules also carry `border-{b,t}-line/40` instead of the site's
  usual full-strength `border-line` — the hairline divider pattern
  itself (`DESIGN.md` §4) stays, just softened where it now faces the
  sky directly rather than dividing two ordinary content sections.
- Both layer in one more thing: a second, low-alpha (16%) background
  image using `--surface-scrim` (`:root`) — `color-mix(in srgb, black,
  white calc((1 - var(--night-text)) * 100%))`, i.e. neutral white when
  text is day-dark, neutral black when text is night-light, with no hue
  of its own. This exists because `--sky-100-final` can land on a fairly
  dark blue during Golden Hour (`--sky-100-early`/`-late` are genuinely
  dark — an accurate "Golden Hour has a deep upper sky," not a bug) at
  the same moment `--ink`/`--charcoal` are still fully day-dark (text
  color is deliberately untouched by `--golden` — see above) — dark text
  on a suddenly-dark header. Being neutral rather than colored, the
  scrim can't reintroduce the hue-mismatch seam these rules exist to
  remove; being keyed to `--night-text` rather than a flat constant, it
  only asserts itself when the text it's backing up actually needs it.

Neither change touches a `--sky-N-*` stop, `--night`/`--golden`/
`--sky-transition`, the atmospheric-depth properties, or any astronomy
function — all three surfaces (header, footer, and the scrim) are built
entirely from values the sky system already computes.

**Known, deliberate, out-of-scope limitation:** the moon's screen
position stays fixed (`top`/`right` in `.atmosphere-moon`), not
elevation-driven like the sun. Real lunar position needs moonrise/
moonset math — it shifts roughly 50 minutes a day against the sun — which
is materially new astronomy, out of scope for a pass whose whole premise
was reusing existing calculations rather than adding new ones.

**The sun (`.atmosphere-sun`) is positioned by its real solar elevation
and horizontal sweep, not a fixed spot on the page, and — unlike Golden
Hour's sky tint — it's visible across the *entire* day, not only during
the warm window around sunrise/sunset.** `getSolarPosition` in
`atmosphere.ts` reuses the exact same latitude/declination/solar-noon
inputs `getSunTimes` derives its hour angle from (including the DST
correction), running them through the standard solar-elevation formula
to get degrees above/below the horizon, plus a simplified east-to-west
sweep fraction across the day's actual sunrise-to-sunset span. Those
become `--sun-elevation`/`--sun-x`, which `.atmosphere-sun` reads
directly: `bottom` places the sun's un-shifted edge at a height
proportional to elevation (70° treated as the practical top of the sky),
and `transform: translate(-50%, 50%)` re-centers the disc on that point.
At elevation 0 (exactly the horizon) the disc's center lands exactly on
`.atmosphere`'s own bottom edge — and because `.atmosphere` clips
overflow, precisely the top half renders there; as elevation keeps
falling the disc slides further past that edge and is clipped away
entirely. A real sunset (full circle → partial circle → gone) falls out
of ordinary geometry and clipping, not a second cutout asset or a
separate "half-sun" state. A `clamp()`'d opacity curve (fading out only
between roughly −8° and −2° elevation) is a secondary safety net for the
same disappearance, not what drives it. The disc itself is deliberately
small and quiet — one radial-gradient (a warm champagne core softening
to transparent at its own edge) with one faint `drop-shadow`, sized
closer to a coin than a feature (`clamp(28px, 3.6vw, 42px)`, smaller
than the moon) — so the sky's own color and the horizon behavior carry
the scene, not the disc.

**The sun and the moon are still mutually exclusive.** The moon's own
opacity is steeply suppressed by `--golden` (see its rule below), fully
hidden through the Golden Hour window bracketing sunrise/sunset — which
lines up with the sun's own elevation-based fade on the other side of
that same window, so in practice the two never render together, without
either one needing to know about the other directly.

The moon's own opacity rule uses a steep `max(0, 1 - --golden * 10)`
factor (`opacity: calc(var(--night) * max(0, 1 - var(--golden) * 10))`),
and `.atmosphere-stars` the same factor alongside its existing
night-based clamp — a plain `(1 - --golden)` factor only reaches true 0
at the single instant `--golden` hits its exact peak, and `getGoldenAmount`
is a slow bump, so for nearly all of the Golden Hour window a plain
factor left the moon merely dimmed, not absent. The steeper factor snaps
both to 0 by the time `--golden` crosses roughly 0.1 — a few minutes
into the ramp — so they read as fully absent for virtually the entire
Golden Hour window, not just its peak, while still easing at the very
edges where `--golden` is near 0. Nothing about the moon's shape or
lunar-phase math changed; only this opacity formula did.

**Celestial integration — the moon and stars read as embedded in the
sky, not laid on top of it.** Two additions, both reusing existing
signals (`--sky-transition`, `--night`, `--golden`, `--moon-illum`) —
no new astronomy, no new keyframes, no change to the 14 sky stops or the
lunar-phase math.

*The moon* (`.atmosphere-moon`) picks up two phase-aware cues on top of
its existing illumination-scaled glow, both driven by `--sky-transition`
(0 at full Day/Night, peaking exactly at the dawn/dusk midpoint — the
same value the atmospheric-depth layer already uses, so this needed no
new signal):
- A small `blur()` on the disc itself — `calc(0.15px + var(--sky-
  transition) * 0.55px)` — near-zero at Night (crispest) and growing
  through Twilight/Dawn (more atmospheric diffusion), instead of one
  fixed sharpness at every phase.
- The glow's own color, precomputed in a local custom property
  (`--moon-glow-tint: color-mix(in srgb, var(--moon-color), var(--sky-
  94-final) calc(var(--sky-transition) * 40%))`) leans toward
  `--sky-94-final` — a near-zenith sky stop, close to where the moon
  actually sits — by that same amount, so the glow it casts picks up a
  little of the *actual current sky's* tint instead of always being a
  fixed pink-white ("interacts with the surrounding sky" rather than a
  flat CSS-sticker glow). At Night this fully resolves back to pure
  `--moon-color` (undiluted); it only tints during the transition
  window. The glow's radius also grows a little through that same
  window (`calc(7px + var(--moon-illum, 0.5) * 11px + var(--sky-
  transition) * 12px)`), still capped well short of anything read as
  bloom.
  Precomputing that blend as its own custom property, rather than
  writing the `color-mix()` directly as `drop-shadow()`'s color
  argument, isn't just tidiness — a `color-mix()` nested *inside
  another* `color-mix()` there was silently flattened away by the
  build's CSS minifier (down to plain `--moon-color`, no tint, no
  build error) — a minifier limitation with that specific double-
  nesting, not a browser one. One level of `color-mix()` directly in
  `drop-shadow()` — exactly what the pre-existing glow already did
  safely — was fine; the fix keeps that shape and does the sky-tint
  blend as a separate step first.

*The stars* (`.atmosphere-star`) keep their existing three size tiers
(2px/3px/4px) and per-tier blur untouched in kind, just extended with a
matching luminance ceiling via the CSS `opacity()` filter function —
`filter: blur(...) opacity(...)`. `opacity()` here multiplies against
whatever `atmosphere-twinkle`'s own animated opacity currently is, so
the twinkle's *shape* is identical for every star (same keyframe, same
duration, no new animation) and only its brightness ceiling differs by
tier: the default/furthest tier dims to 68%, the mid tier to 88%, and
the one standout star stays at 100% with a small `brightness(1.08)`
nudge. Container-level visibility (`.atmosphere-stars`'s opacity, gating
the whole field by `--night`/`--golden`) is untouched — stars already
emerged gradually through Twilight and were fully absent by Day through
that existing mechanism; this only changed how the 18 individual stars
relate to *each other*.

**A real bug this pass found and fixed: the 14 sky stops' computed
custom properties (`--sky-N-day/-night/-transition/-early/-late` and
the `-base/-transitioned/-goldenmix/-final` stages) were declared
*inside* `.atmosphere-sky` itself, not `:root`.** That was invisible as
long as only `.atmosphere-sky`'s own `background` consumed them, since
a custom property declared on an element is only visible to that
element's own declarations and its descendants — but `.header-golden-
glass`, `.footer-sky-glass` (both added in the surface-integration pass before
this one), and now `.atmosphere-moon`'s new `--sky-94-final` reference
are none of them DOM descendants of `.atmosphere-sky` — they're
siblings under the same `.atmosphere` container, or entirely outside it
(the header and footer aren't inside `.atmosphere` at all). A custom
property declared only on `.atmosphere-sky` is simply undefined on
those elements, which silently invalidates any declaration that
references it — `.header-golden-glass`'s `background-color` and
`.footer-sky-glass`'s `background-color` had actually been computing to
fully transparent (`rgba(0,0,0,0)`) the entire time since that pass,
not the sky-matched tint they were designed to show; they still looked
approximately right by coincidence (transparent + backdrop-blur + the
neutral `--surface-scrim` layer reads very similarly to a light sky
tint) rather than because the mechanism worked. The fix moves all of
those declarations to `:root` — same 14 stops, same formulas, zero
value changes — so every consumer, present and future, actually
inherits them. `.atmosphere-sky`'s own background is unaffected, since
`:root` is an ancestor of it too.

Verified clean with this feature in place: `tsc --noEmit`, `eslint`, and
`npm run build` all pass.

## 10. Editorial Composition (Homepage)

`src/app/page.tsx` was audited against a simple test: does this look like
a professionally art-directed publication sitting inside the living sky,
or a component-generated "heading + cards" page that happens to have a
sky behind it? Before this pass, every one of its five sections used the
identical formula — eyebrow, `text-3xl sm:text-4xl` heading, optional
right-aligned link, `border-b border-line`, `py-14 sm:py-16` — and two
of them (the hero's "On This Day" panel, the Featured Era section) put
their content inside an opaque or translucent `bg-ivory` box. Individually
reasonable, together it read as one repeating pattern five times, and it
boxed content in front of a sky layer that four other design passes had
just spent considerable effort making feel alive. Only `page.tsx` and
`src/lib/layout.ts` (one export added, `imageFor`, no behavior change)
were touched — `EntryCard`, `FeatureEntry`/`MediaEntry`/`StandardEntry`,
and `Timeline` are shared with the archive/chronology pages and were left
exactly as they were.

**Principle: sky = environment, content = editorial layer, glass =
occasional functional surface — not sky = background, everything = a
card.** Only one surface on the homepage still uses a glass panel now
(the hero's CTA buttons and header/footer, which are UI chrome, not
editorial content). Every section's own background is transparent,
letting `.atmosphere-sky` (§9) show through directly; hierarchy is
carried by typography, rules, and whitespace instead of by boxing.

**Section rhythm — six beats, deliberately not equal in volume:**

1. **Hero (statement).** The H1 grew from `clamp(2.75rem, 6vw+1rem,
   4.5rem)` to `clamp(3rem, 6vw+1.5rem, 5.75rem)` — a real scale jump,
   not a nudge — establishing the one moment on the page allowed to be
   this loud. The "On This Day" panel lost its box entirely (`border
   border-line bg-ivory-dim/60 p-6` → `border-l-2 border-plum/50 pl-6`):
   a single accent rule and generous left padding now do the job a full
   card used to, and the sky shows through where the tinted background
   used to sit.
2. **How This Record Is Kept (quiet).** No border, no box: one short
   line — "It happened once. Here, it happens again." — set in display
   type at a real but restrained size (`clamp(1.75rem, 3vw+1rem,
   3rem)`), full stop. Two earlier drafts of this section were cut, each
   for the same underlying reason: a giant entry-count numeral (a raw
   metric with no real relationship to what STARHWA is — a number
   chosen only to fill a design beat, exactly the template-driven
   element §1 argues against), then a sentence explaining the archive's
   own sourcing/verification policy ("every entry is dated, sourced,
   and verified... nothing is invented") — accurate, but it read as
   defensive trust copy, the kind of line any archival database could
   carry, not something with STARHWA's own voice. The line that replaced
   both isn't a policy statement or a stat; it's an observation about
   what an archive actually does — a stage, a broadcast, a single
   posted photo all happen once and are gone, and this is the place
   where each of them is still happening, on the page, however long
   after the fact someone finds it. That's true of every entry on the
   site without exception, which is what lets the line stay this short.
   If this section's copy ever needs to change, the same test applies:
   it must say something genuinely true about the archive, Seonghwa's
   documented history, or the passage of time across eras, in STARHWA's
   own quiet register — never a metric or a methodology statement
   reached for because a landing page "should" have one.
3. **Chronology at a Glance (information).** Unchanged — `Timeline.tsx`
   was already a compact, non-boxed data component and didn't need
   touching.
4. **Featured Era (visual impact).** Previously a heading plus a plain
   `sm:grid-cols-2` grid of generic `EntryCard`s inside a
   `bg-ivory-dim/40` tint — the single most "component-generated"
   moment on the old page, reusing the archive's own list-item card for
   what was supposed to be the homepage's biggest editorial moment. Now
   an asymmetric `lg:grid-cols-12` spread: a large `aspect-[16/10]`
   (`aspect-[4/3]` on mobile) photograph — the era's own richest
   available image, resolved via the newly-exported `imageFor()` from
   `lib/layout.ts`, the same curated-image-first logic every other card
   on the site already uses, so this adds no new image-selection rule —
   spans 7 of 12 columns, with the era name set at
   `clamp(2.5rem, 5vw+1rem, 4.25rem)` and a plain text list (category ·
   date · title, no borders, no cards) of the era's other entries beside
   it. On an era with no resolvable image, the image column is simply
   omitted and the text column widens — no placeholder box.
5. **Latest Additions (information, deliberately quieter than #4).** The
   existing heterogeneous `EntryGrid` (feature/media/standard/compact —
   already the site's most sophisticated layout, see §-adjacent
   `EntryGrid.tsx` docs) is unchanged; only its own heading shrank
   (`text-3xl sm:text-4xl` → `text-2xl sm:text-3xl`) so it doesn't
   compete with Featured Era's now-larger heading immediately above it —
   rhythm through contrast, not through changing the grid itself.
6. **Official Channels (closing quiet/statement).** Previously a
   `grid-cols-2 gap-px border border-line bg-line` grid of individually
   bordered, background-filled cells with an inverted hover state — a
   literal button/directory-app grid, and the page's clearest "SaaS,
   not editorial" moment. Replaced with a two-column (`sm:grid-cols-2`)
   list of plain rows, each with a top-of-viewport-independent
   `border-b border-line` hairline, the platform name set in display
   type (`text-2xl`), the handle in the existing `.meta` mono style, and
   — newly surfaced, previously collected in `officialLinks` data but
   never rendered — each link's own `note` field as a real supporting
   sentence. Hover state matches the rest of the site (`group-hover:
   text-plum`, arrow nudge) instead of a background-color invert. No new
   data was added; `note` already existed in `src/data/officialLinks.ts`.

**What stayed exactly as it was, deliberately:** the 14 sky stops and
every atmosphere/celestial mechanism (§9); `EntryCard.tsx` and the
`entry-grid/*` components (shared surfaces, still used on `/archive` and
`/chronology`); `Timeline.tsx`; the header/footer sky-glass treatment;
all archive content and images — every entry title, summary, date,
category, and image URL rendered on the homepage is exactly the data
that was already there, just composed differently.

Verified: desktop (~1180px, where the `lg:` asymmetric grids activate)
and mobile (375px, where every asymmetric section collapses to a single
dominant element — image-before-text on Featured Era, single-column list
on Official Channels) across all five atmospheric phases, confirming no
loss of contrast now that these sections sit directly against the sky
with no background tint. `tsc --noEmit`, `eslint`, and `npm run build`
all pass.

## 11. Imagery & Visual Storytelling (Homepage)

**Audit finding: the homepage had exactly one bespoke image moment
(Featured Era), and it wasn't showing editorial photography.**
`imageFor()` (`lib/layout.ts`) resolves an entry's curated `image` field
when one exists, otherwise an auto-derived YouTube thumbnail — the right
priority for a small card thumbnail, where *something* is better than
nothing. But Featured Era picked its image by scanning the era's entries
newest-first for the first one `imageFor()` could resolve *anything*
for, curated or not — and since only 2 of the archive's 1045 entries
have a curated `image` as of this pass (`content/entries/*.md`, `image:`
frontmatter — see `content/README.md`), while dozens of recent entries
have an auto-derived video thumbnail, the section's one big image was,
in practice, always a YouTube frame grab — in the version verified in
§10, literally a screenshot with Korean caption text baked into the
frame. That's the opposite of "editorial photography, not thumbnails"
(§5) at exactly the size where it mattered most. Nowhere else on the
homepage had any imagery at all: the `latest` slice (4 most recent
entries) happened to be announcement/schedule-type entries with no
image data at all — not a bug, just what recent content currently looks
like — and every other section (Hero, How This Record Is Kept, Timeline,
Official Channels) is text by design (§10).

**The fix, built on one new rule: an entry's own curated `image`
(`Entry.image`, never `imageFor()`'s thumbnail fallback) is required
for anything the homepage treats as a genuine photographic moment.**
`curatedPhoto()` (`page.tsx`) returns `null` for an entry with no
curated image, never a thumbnail substitute. **Featured Era's image**
now prefers the era's own most recent *curated* photo, falling back to
the old `imageFor()`-based behavior (curated-or-thumbnail) only when
the era has no curated photo of its own yet — so a brand-new era with
only schedule-type entries still shows something, but a curated photo
always wins the moment one exists. Its container's aspect ratio changed
from a landscape `aspect-[16/10]` (sized for a 16:9 video thumbnail) to
a portrait `aspect-[4/5]` — the archive's curated photos are tall
editorial portraits, and `object-cover` inside the old wide box would
have cropped into exactly the composition the photograph was shot for.
The on-image gradient overlay (`from-ink/25`, copied from the shared
`FeatureEntry` component, where it protects on-image text) was
removed — nothing is ever written on top of this image, so the overlay
had no job to do and was pure unnecessary filter per §10's own
restraint principle. A small `.meta`-styled credit line now prints
beneath the image, reusing `EntryImage.credit` exactly the way the
entry detail page's own hero image already does (§5) — real data, not
new copy.

**A second standalone photograph was added in this pass, then removed
in the same pass, and the reasoning is worth keeping.** It used the
archive's only other curated photo — smaller, uncropped, asymmetrically
placed between Featured Era and The Latest — and the execution itself
was sound. But its selection rule was "the next most recent curated
photo, excluding whichever one Featured Era used" — availability, not
editorial purpose. Tested against the questions that actually matter —
Does it deepen the Featured Era story? Does it bridge meaningfully into
The Latest? Does its relationship to the first photo say anything?
Does it surface a moment, mood, or side of Seonghwa the surrounding
text doesn't already cover? — the honest answer to all four was no. It
was a second good photo placed where a design beat happened to want an
image, which is the exact failure mode already named and corrected once
this session (§10, the entry-count numeral cut for the same reason).
**A beautiful photograph is not on its own a reason to place a
photograph.** If a future entry's curated image genuinely earns a
second homepage moment — because it illustrates something the
surrounding copy doesn't, not because it happens to exist — it should
be placed with that specific relationship made legible (a caption, a
juxtaposition, a transition that says *why* it's there), not dropped in
using the same "most recent, not already used" rule this one used.

**What this deliberately does not do:** no new grid or card component;
no image added or restored to replace the one that was removed; no
border, glow, filter, or hover-zoom added to Featured Era's image
beyond the existing `.glint-hover` motif already used on every other
linked visual on the site; `latest`/`EntryGrid` on the homepage is
untouched, still showing exactly the entries it always would with
exactly the treatment `entry-grid/*` already gives them.

Verified at ~1180px desktop and 375px mobile: Featured Era's image
renders at its intended aspect ratio, its credit prints correctly from
real `content/entries/*.md` data, and the sticky header's sky-glass
(`.header-golden-glass`, §9) picks up a soft blurred wash of the
photograph's own color as it scrolls beneath it — an unplanned but
welcome confirmation that the header genuinely reads what's behind it
rather than showing a fixed tint. `tsc --noEmit`, `eslint`, and
`npm run build` all pass.

### Image sourcing & permission

An audit surfaced a real gap once this section's own reasoning ("make
the images feel like they belong to STARHWA") got applied to *rights*,
not just *quality*: nothing in the schema recorded whether an image's
source had actually agreed to let it be shown here at all.
Concretely — KQ's ATEEZ Official Platform has multiple boards with
different rules: FOR_ATINY explicitly permits external sharing with
attribution, ATINY ZONE explicitly prohibits it. Two boards, same
brand, opposite rules — proof that "official" and "public" are not the
same thing as "permitted," and that permission has to be recorded per
image, not assumed from the outlet.

`EntryImage` (`src/lib/types.ts`) now carries `sharePermission:
"permitted" | "prohibited" | "unknown"`, `sourcePlatform` (the specific
board/outlet an image came from, distinct from the display `credit`),
and `sourceUrl` (the original post/page, when one exists). Zod
(`imageSchema`, `src/lib/schema.ts`) defaults `sharePermission` to
`"unknown"` when a `content/entries/*.md` file doesn't set it —
authoring an `image` block without explicitly confirming and writing
`sharePermission: "permitted"` never grants it by default.

**The rule is enforced in code, not just documentation.**
`publicImage(entry)` (`src/lib/layout.ts`) is a single gate every public
image display in the app now goes through — `imageFor()` (card
thumbnails), the entry detail page's hero image and OG/Twitter meta
images, and the homepage's Featured Era photo (`curatedPhoto()`,
`page.tsx`) all call it instead of reading `entry.image` directly.
It returns the image only when `sharePermission === "permitted"`;
`"unknown"` and `"prohibited"` both resolve to `null`, falling through
to the same behavior an entry with no curated image at all already
had (an auto-derived video thumbnail where one exists, otherwise no
image). An entry's `image` data itself is never deleted or hidden for
having unconfirmed permission — it stays valid, documented frontmatter,
just not something the live site ever renders, links to, or embeds in
metadata until someone actually confirms permission.

Of the archive's two currently curated photos: the FOR_ATINY "Skin For
ATINY Photos" entry is marked `sharePermission: "permitted"` (with
`sourcePlatform: "ATEEZ Official Platform — FOR_ATINY"` and the
original post's `sourceUrl`) — this is what Featured Era's homepage
image now resolves to. The "ANITEEZ IN COLOR" entry's image is sourced
from ANITEEZ's official X account — a different platform than either
KQ board, with no confirmed sharing rule either way — so its
`sharePermission` is deliberately left unset (`"unknown"`), and
`publicImage()` correctly excludes it from every public surface. See
`content/README.md` "Image sourcing & permission" for the authoring-side
version of this rule.

**A separate, pre-existing issue this audit surfaced but did not fix:**
the ANITEEZ entry's `image.url` is a `pbs.twimg.com` link, which
`content/README.md`'s existing "Image selection" guidance already
flags — X/Twitter media URLs are signed and can expire, so they
shouldn't be hotlinked as a stable `image.url` regardless of permission.
Moot for now since `publicImage()` already excludes this entry on
permission grounds, but worth fixing (re-verify a stable mirror exists,
or omit `image`) independently of the permission question if this
entry's `sharePermission` is ever confirmed `"permitted"` later.

## 12. Celestial Dimensionality (stars, moon, sun)

The Moonlit Archive's sky (§9) had real astronomy and real color depth,
but its three celestial bodies were still flat CSS primitives: stars were
a filter-blurred dot, the moon was two solid-color discs, the sun was a
single 5-stop radial gradient. This pass makes all three read as volume
and light rather than decoration, using only techniques already present
in the codebase (layered `radial-gradient()` backgrounds, `drop-shadow()`
chains, registered `@property` custom values, the existing `--scroll-y`
parallax signal) — no canvas, no SVG, no new libraries, and no change to
any astronomy function, opacity formula, or the moon-phase mechanism
itself.

**Stars.** `.atmosphere-star` was a flat dot with a blur filter; it's now
a small radial-gradient (bright core fading through its own tint to
transparent) plus a matching `box-shadow` halo, so a star reads as a
point of light with a glow rather than a dot with soft edges. Depth is
now driven by a `depth: "far" | "mid" | "near" | "hero"` field on each
entry in `STAR_POSITIONS` (`Atmosphere.tsx`), rendered as an
`atmosphere-star--<depth>` class — replacing the old `:nth-child`
tiering, which only coincidentally tied visual depth to array order.
Each tier sets size, halo radius, blur, a luminance ceiling, a tint (far
stars lean cool via `--star-cool`, near stars lean warm via
`--star-warm`, hero stars run pure white), a twinkle duration, and a
parallax fraction of the existing `--scroll-y` signal — distant stars
barely drift on scroll, nearer stars drift a little more, reusing the
same rAF-throttled listener the midground layer already set up rather
than adding a new one. The field is 8 far / 3 mid / 4 near / 3 hero,
spread apart by hand like the positions themselves. The 3 hero stars
additionally get a static 4-point diffraction cross (`::before`/`::after`,
crossed gradient lines) — the classic look of a bright point source
refracting through a lens — animated with the *same* `atmosphere-twinkle`
keyframe at the star's own duration, so the spikes brighten and dim in
sync with the star rather than pulsing on their own timer. No new
keyframe was needed for either the halo or the sparkle.

**Moon.** The phase mechanism (`.atmosphere-moon-lit` /
`.atmosphere-moon-shadow`, two overlapping disc, the shadow disc sliding
by `--moon-illum`) is completely unchanged — this pass only changes what
gets painted on the lit disc and how the moon as a whole is lit from
outside. `.atmosphere-moon-lit`'s flat `var(--moon-color)` fill became
four small, fixed, hand-placed crater blobs (same "hand-placed, not
random" determinism as `STAR_POSITIONS`) layered under a spherical-
shading gradient — an off-center highlight standing in for the sun as
the moon's one real light source, softening toward `--moon-shadow-color`
at the disc's far edge. A slow `background-position` drift
(`atmosphere-moon-drift`, 44s) makes the crater layer creep very
slightly, reading as a hint of rotation without new lunar-rotation
astronomy; it only has room to move because `background-size: 130%` was
added first — at the previous 100% size, `background-position`'s
percentage formula is a no-op. `.atmosphere-moon` itself gained a second,
tighter, cooler `drop-shadow()` (an atmospheric rim light, scaled by
`--moon-illum` so a thin crescent doesn't get a full moon's rim) layered
after the existing warm glow, and a small scroll-linked parallax
(`--scroll-y * -0.012`, its own multiplier distinct from the midground's
and the stars') so the moon reads as sitting at its own depth rather than
moving in lockstep with everything else.

**Sun.** `.atmosphere-sun`'s single radial gradient became a stack of
background layers — four small, fixed radial-gradient blobs (two
barely-brighter, two barely-dimmer) reading as surface granulation, under
the core-to-edge gradient itself, now sourced from `--sun-core`/`-mid`/
`-edge` tokens. The edge stop blends toward a new `--sun-horizon-tone`
by `--sun-horizon-mix`, a new registered `@property` derived purely from
the already-computed `--sun-elevation` (1 at the horizon, 0 by ~28° up) —
the one genuinely new physical detail in this pass: a low sun reddens
because its light crosses more atmosphere, a high sun stays a pale
gold-white, using an input the sun's position already depended on. The
single `drop-shadow()` glow became three, tight-to-wide, so the bloom
falls off with distance instead of reading as one flat ring; the widest
is warm-red and scaled by `--sun-horizon-mix`, so it only appears as the
sun nears the horizon rather than existing as a permanent halo. A new
`--sun-pulse` custom property (registered, animatable, initial value
`1`) drives a slow 9s breathing — a touch of `brightness()` and a touch
of `scale()` — standing in for solar convection; kept to a 3.5% amplitude
so it reads as alive, not as an aggressive flare.

**Reduced motion.** The two new animations this pass adds — the sun's
breathing and the moon's surface drift — are disabled in the existing
`prefers-reduced-motion: reduce` block, same as every other animation on
the page; the hero stars' sparkle animation is disabled there too. The
static shading, craters, granulation, and glow layers underneath all of
these are ordinary background/filter declarations, not animations, so
they're unaffected — the sun and moon still read as volumetric under
reduced motion, just still. The stars' per-tier parallax needs no
explicit reset: it depends on `--scroll-y`, which (per §9) is never
attached under reduced motion in the first place, so it resolves to no
motion for free.

**What stayed exactly as it was, deliberately:** every astronomy function
in `atmosphere.ts` (solar elevation, moon phase, sunrise/sunset, night/
golden-hour amounts); the moon-phase disc-slide mechanism and its 3s
transition; the sun and moon's screen positions and size formulas; the
existing `atmosphere-twinkle` and `atmosphere-shoot` keyframes, reused
rather than replaced; all 14 sky-gradient stops and the atmospheric-depth
layer (§9); the mutual-exclusion opacity formulas between sun, moon, and
stars. Verified: `tsc --noEmit` and `eslint` both pass clean; computed
styles read directly in a live browser session confirm `--sun-horizon-mix`
resolves exactly against real solar elevation (e.g. elevation 25.9°
→ 0.0697, matching `clamp(0, 1 - (elevation + 2) / 30, 1)` precisely),
the moon-phase shadow transform is untouched and still tracks
`--moon-illum`/`--moon-dir`, and all three new animations
(`atmosphere-sun-breathe`, `atmosphere-moon-drift`, the hero sparkle)
are active and named correctly on their elements.

## 13. Background Depth (spatial planes behind the celestial objects)

§12 made the moon, sun, and stars individually dimensional; the space
*around* them was still just two layers — `.atmosphere-sky` (the 14-stop
color gradient plus its own zenith/horizon depth wash) and
`.atmosphere-midground` (5 blurred dots, the fastest-parallaxing thing in
the scene). This pass adds the planes in between, so the scene reads as
`background → cosmic → mid-depth → far stars → near/hero stars →
midground` — six distinct distances, not "a background plus some stars."

**What was reused rather than duplicated.** `.atmosphere-sky`'s existing
14-stop gradient and its zenith-recede/horizon-lift wash already *are* the
"deep background — very dark, almost imperceptible gradient establishing
distance" this pass was asked for; no new deep-background layer was
added, only one more translucent overlay in that same element's existing
background stack (below). `.atmosphere-midground` already *is* the
"foreground atmospheric layer — a handful of particles closer than the
stars" this pass was asked for — it was already the fastest-parallaxing
thing in the file (`-0.035`, vs. the star tiers' `-0.002`/`-0.008`) and
already documented as "nearer than stars." It's untouched by this pass
beyond a comment reframing it as that layer explicitly; duplicating it
under a new name would have been exactly the "don't add effects, reuse
what exists" mistake this pass was asked to avoid.

**What's genuinely new: two planes, both minimal.**

1. **A vignette on `.atmosphere-sky`** (a new first/topmost layer in its
   existing `background` list — placed there deliberately, since the
   14-stop base gradient is opaque and a translucent layer placed *after*
   it in the list would be entirely hidden behind it). One `radial-
   gradient`, transparent through the middle 55%, easing to a soft
   `rgba(6, 4, 10, ...)` darkening at the far corners, scaled by `--night`
   (peak ~0.19 alpha at night, ~0.03 by day — "almost imperceptible" by
   design). This is the one piece of "enormous distance" framing that
   wasn't already present: it draws the eye inward rather than letting
   the sky read as a flat rectangle, at every time of day.

2. **`.atmosphere-cosmic`** (new element, between `.atmosphere-sky` and
   `.atmosphere-mid-depth`) — the "distant cosmic layer." Two large,
   soft-edged (70%+ transparent falloff, deliberately no hard edge — a
   harder one reads as "a blob," which the brief explicitly ruled out)
   radial-gradient patches, each built from a token the file already
   defines (`--plum-day`, `--moon-shadow-color`) mixed to 96% transparent
   — at most 4% of the color shows. No new hue was introduced anywhere in
   this pass. Opacity reuses `.atmosphere-stars`' own existing formula
   (`night, steeply zeroed through Golden Hour`) verbatim rather than a
   new one, so this layer shares the stars' day/twilight/night behavior
   exactly. No parallax — at this alpha, motion would add nothing
   perceptible, and it's meant to be the most stationary thing in the
   scene besides the sky.

3. **`.atmosphere-mid-depth`** (new element, between `.atmosphere-cosmic`
   and `.atmosphere-midground`) — "mid-depth atmosphere." Two more soft
   gradient washes (`--star-color`, `--plum-night`, each mixed to 96%
   transparent), no particles — particles are `.atmosphere-midground`'s
   job, not duplicated here. Its own parallax rate, `-0.005`, sits
   deliberately between the far star tier's `-0.002` and the near/hero
   tiers' `-0.008`, giving it a perceptibly distinct plane rather than
   moving in lockstep with either. Always present (not night-gated, unlike
   `.atmosphere-cosmic`) — at ~4% tint strength it stays imperceptible by
   day regardless, so it needed no new gating logic.

**Parallax hierarchy, end to end** (all reusing the one `--scroll-y`
signal `.atmosphere-midground` already established, rAF-throttled, never
attached under reduced motion): `.atmosphere-sky` and `.atmosphere-cosmic`
0 (stationary) → far stars `-0.002` → `.atmosphere-mid-depth` `-0.005` →
near/hero stars `-0.008` → `.atmosphere-clouds-far` `-0.010` →
`.atmosphere-clouds-mid` `-0.017` → `.atmosphere-clouds-near` `-0.024` →
`.atmosphere-midground` `-0.035` (fastest, closest) — the three cloud
tiers (§14) were slotted into this same ladder between the star tiers and
the midground haze, not appended after it, since real clouds sit closer
than any star but farther than the midground's own near-viewer haze. The
moon and sun were deliberately left out of this ladder —
per the brief, they stay "visually anchored rather than floating around
excessively"; their own small independent drifts from §12
(`.atmosphere-moon`'s `-0.012` scroll parallax, the sun's breathing pulse)
are untouched.

**What stayed exactly as it was:** every astronomy function; the moon-
phase mechanism; all 14 sky-gradient stops and their existing depth wash;
`.atmosphere-midground`'s dot markup, count, and parallax rate; the star
tiers' own parallax from §12. Reduced motion: the one new animated
value (`.atmosphere-mid-depth`'s transform) is reset in the existing
`prefers-reduced-motion: reduce` block; `.atmosphere-cosmic` has no
transform to reset, and its opacity formula (not an animation) is
unaffected either way. Verified: `tsc --noEmit` and `eslint` both pass
clean.

## 14. Cloud Layers

§9–§13 gave the sky real color, volumetric celestial bodies, and layered
background depth — but it still had no clouds, so it read as a clear sky
at every hour rather than a sky with real atmosphere in front of it. This
pass adds three CSS-only cloud tiers (`.atmosphere-clouds-far/-mid/-near`,
rendered in `Atmosphere.tsx` as three more markup-free `<div>`s, same as
`.atmosphere-cosmic`/`.atmosphere-mid-depth`) — no canvas, no SVG, no new
astronomy, and no per-item React data (unlike the hand-placed stars, a
cloud layer needs no array of positions; it's one static gradient stack
per tier).

**Color: a cloud is a paler version of the light already around it, not
its own palette.** `--cloud-body` (`:root`) lightens the sky's own live
mid-height stop, `--sky-64-final` — already time-of-day-correct (pale
blue by Day, deep indigo/violet by Night, rose-peach at Sunrise/Golden
Hour) — toward white, rather than introducing a second day/night/golden
color system. `--cloud-highlight` lightens that further and warms it
toward a soft peach *specifically* by `--golden` (not `--sky-transition`,
which stays cool) — concentrating "the sun catching the upper edge"
warmth at Golden Hour/Sunrise, rather than tinting every cloud orange at
every hour of the day. Both are built as three single-level `color-mix()`
stages, never one inline nested `color-mix()`, for the same minifier-
safety reason documented on `.atmosphere-moon`'s `--moon-glow-tint` in
§12. `--cloud-visibility` (`:root`) is the shared "how present are clouds
right now" factor across all three tiers — a steady 0.55 baseline (so
clouds are part of Live/Sunrise/Night alike, never a Sunrise-only effect)
with a `--golden`-driven lift and a `--night`-driven reduction, never
reaching exactly 0 at any hour.

**Shape: an off-center light source, not a flat illustrated puff.** Each
cloud "blob" is a pair of `radial-gradient()`s sharing one footprint — a
smaller `--cloud-highlight` ellipse (listed first in the `background-
image` list, so it paints on top) offset slightly toward the *top* of a
larger `--cloud-body` ellipse beneath it. This is the exact off-center-
gradient technique §12 already uses for the sun's and moon's own
volumetric shading, reapplied here: one real physical light cue (light
reads as coming from above) from a single geometry choice, not a second
lighting system. Every stop keeps a wide transparent falloff (64–80%,
matching `.atmosphere-cosmic`/`.atmosphere-mid-depth`'s own restraint)
and blobs are spread apart with generous gaps between them — this reads
as atmosphere with real openings the sky (and the sun/moon behind it)
shows through, never a solid overcast sheet. Blob positions/sizes are
hand-placed, not random — same determinism as `STAR_POSITIONS` — with
irregular ellipse sizes so nothing reads as a repeating tile.

**A real bug this pass caught before shipping: ellipse size must be in
`vw`, never `%`, for both axes.** `radial-gradient()`'s `ellipse <x> <y>`
sizes each axis against the element's own box — width against the box's
width, height against its height, independently. A `%`/`%` ellipse
therefore only reads as a flat, cloud-like band on a viewport whose own
width:height ratio happens to be wide; on a narrower/taller viewport the
exact same percentages size a visibly rounder blob, since the two axes
are tracking two different reference lengths that no longer agree with
each other. Sizing both axes in `vw` — `radial-gradient(ellipse 30vw
5.4vw at 15% 62%, ...)` — ties both axes to the *same* reference length,
so the blob's aspect ratio (and therefore its "flat cloud" read) stays
constant regardless of viewport proportions. Position (`at X% Y%`) stays
percentage-based, since placement should still track the viewport's own
proportions the way every other layer in this file does — only the size
argument needed the fix.

**Depth across three tiers, four cues moving together, not just size.**
Far (small, faintest, positioned lowest-opacity-multiplier `×0.46`) → Mid
(`×0.68`) → Near (`×0.88`, largest, softest, positioned lowest in the
frame) — each tier steps up together in blob size, `--cloud-visibility`
multiplier, parallax rate (see the updated ladder in §13 above — three
new rungs slotted between the near/hero star tier and the midground
haze, not appended after it, since real clouds sit closer than any star
but farther than the midground's own near-viewer haze), and drift speed/
direction (below). All three tiers are confined to the lower-to-mid sky
only (roughly 55–100% of the fixed `.atmosphere` box, top→bottom),
leaving the star field and moon's own upper-sky territory clear rather
than overlapping it.

**Motion: a slow, independent drift per tier, plus the existing scroll
parallax — kept cheap, not "if it can be done efficiently" as an
afterthought.** Each tier's `background-size` is set just over 100%
(108–124%) purely so `background-position` has room to move at all — the
same technique `.atmosphere-moon-lit`'s own surface drift (§12) already
uses — then a slow (80–150s), small-amplitude (a few % of position),
`ease-in-out infinite alternate` keyframe shifts it, nearer tiers
drifting faster and in a slightly different direction than farther ones
(not one shared timer), reading as independent wind-blown banks rather
than the whole sky panning uniformly. This is a `background-position`
animation (paint-cost, not a compositor-only `transform`), same
trade-off `.atmosphere-moon-lit`'s existing drift already accepts — kept
affordable here the same way that one is: slow duration, one gradient
stack per tier (three total), no `will-change` promotion, nothing
scroll- or frame-driven about it. The existing scroll-linked `--scroll-y`
parallax (`transform: translate3d`, cheap and already established
site-wide) is layered on top of the same element independently — the two
mechanisms don't conflict, since `transform` and `background-position`
are unrelated properties.

**Reduced motion.** The three drift animations are disabled in the
existing `prefers-reduced-motion: reduce` block, same as every other
animation on the page, with `background-position` reset to `0% 0%` and
`transform` reset alongside it (mirroring `.atmosphere-sun`/`.atmosphere-
moon`'s own reset pattern in §12) — the static gradient shading itself is
an ordinary `background-image` declaration, not an animation, so the
clouds stay fully visible and shaped, just still. Scroll parallax needs
no explicit reset here either, for the same reason it needs none
elsewhere in this file: `--scroll-y` is never attached under reduced
motion in the first place (`Atmosphere.tsx`), so the `transform`
`calc()` simply never updates.

**Stacking order: clouds render in front of the sun/moon/stars, behind
the midground haze.** `Atmosphere.tsx` renders the three cloud `<div>`s
immediately after `.atmosphere-stars` and before the rare shooting-star
element — real tropospheric clouds are far closer than any celestial
body, so a cloud partially veiling the sun or moon through a gap (rather
than always sitting fully behind them) is the physically correct read,
not an inconsistency. `.atmosphere-midground`'s own handful of dots stay
the closest thing in the scene, in front of the clouds, unchanged.

**What stayed exactly as it was, deliberately:** every astronomy function
in `atmosphere.ts`; the 14 sky-gradient stops and their existing depth
wash; the moon-phase mechanism and the sun's own volumetric shading; the
star field's markup, tiers, and parallax; `.atmosphere-midground`'s dot
markup, count, and parallax rate. Nothing about Golden Hour's own
appearance changed — `--golden` is simply one more input the clouds now
read, the same signal every other phase-aware layer in this file already
reads. Verified: `tsc --noEmit`, `eslint`, and `npm run build` all pass
clean, and the shape fix above was confirmed directly in a live browser
session (narrow/tall viewport showed round blobs with `%`/`%` sizing,
flat cloud bands with `vw`/`vw` sizing) across Live, Sunrise, and Night
preview modes (§9's preview toggle).

## 15. Search Box (atmosphere-reactive UI chrome)

§9–§14 gave the sky and its own scenery real, continuous color; the
search field (`HeaderSearch.tsx`, used both inline in the desktop header
and inside the mobile search drawer) was the one piece of everyday UI
still sitting on a flat `bg-ivory`/`border-line` — a fixed beige box that
read as pasted on top of a sky that was otherwise alive at every hour.
This pass is deliberately narrow: it makes the search box's own fill,
hairline, and an occasional soft glow track the atmosphere, and touches
nothing else — no new astronomy, no new palette, no change to the
header/footer glass treatments (§9) that already exist.

**Reuses `--sky-64-final` — the same mid-height sky stop the cloud layers
(§14) already read — rather than a third palette.** The header/footer
glass surfaces intentionally anchor to the zenith/horizon stops
(`--sky-100-final`/`--sky-0-final`), which "barely move" by design (see
those rules' own comments) — correct for a large, always-present chrome
panel, but it would under-represent the very swings (indigo → blue-violet
→ rose/peach → blue-sky → gold → coral) this request specifically asked
the search box to visibly carry. The mid stop moves enough to read as
genuinely alive without becoming a bright swatch — the same reasoning
that picked it for cloud color in §14, applied here to a second consumer
instead of inventing a new one.

**Tinted, not repainted.** `.search-sky-glass` (`globals.css`) mixes
`--sky-64-final` into `--ivory` at 30% for the fill and into `--line` at
46% for the hairline — both mixes keep the existing token as the
majority weight, so the field stays a clearly legible, distinctly
bordered input at every hour rather than turning into "whatever color the
sky happens to be right now." The Golden Hour glow is a real, small
`box-shadow` (`0 0 16px`, warmed toward `--sun-mid`), scaled directly by
`--golden` via a `calc()` in its own alpha channel — the same
proven-safe single-level `color-mix()` pattern the horizon-haze and
atmospheric-depth layers already use (§9/§13) — so it's essentially
invisible outside Sunrise/Golden Hour and never reads as a permanent
shadow on ordinary chrome. `backdrop-blur-sm` (added directly in
`HeaderSearch.tsx`) supplies the "translucency" half of the request; it's
inert (harmlessly, not a bug) inside the mobile drawer's own flat
`bg-ivory` backdrop, where there's nothing behind it to blur, and fully
visible inline in the desktop header where it sits over the live sky.

**A real risk this pass caught before shipping: an unlayered rule here
would have silently broken the search box's own focus state.**
`.header-golden-glass`/`.footer-sky-glass` (§9) are deliberately left
unlayered, which is safe for them only because nothing else ever
contests `background-color` on those elements at another cascade layer.
`.search-sky-glass` sets `border-color`, and `HeaderSearch.tsx` already
had (and keeps) a Tailwind `focus-within:border-plum` utility on the same
element — plum staying the one accent for focus, per DESIGN.md §3. CSS
cascade layers rank strictly above specificity: an unlayered rule beats
*any* layered rule regardless of selector specificity, so an unlayered
`.search-sky-glass` would have permanently pinned the border to its own
sky-tinted color and made the existing focus outline invisible, even
though `:focus-within` is the more specific selector. The fix is
`.search-sky-glass` living inside its own `@layer base { }` block —
`base` sits behind Tailwind's own `utilities` layer, so
`focus-within:border-plum` continues to win exactly as it did before this
rule existed, with zero change to `HeaderSearch.tsx`'s own focus markup.

**What stayed exactly as it was:** every astronomy function and sky
token; the header/footer glass treatments and the values they reference;
the search box's own markup, behavior, results dropdown, and focus/hover
interactions — only its idle-state fill, hairline, and (near Golden Hour)
glow are new. Verified directly in a live browser session: `--night`/
`--golden` and the field's own computed `background-color`/`border-color`
/`box-shadow` were read via `getComputedStyle` across Live, Sunrise, and
Night preview modes (§9), confirming a deep indigo fill with the glow at
0 alpha at Night, a warm dusty-rose fill with a visible warm glow at
Sunrise, and the same live-updating behavior in ordinary Live mode — both
in the desktop header and inside the mobile search drawer. `tsc --noEmit`,
`eslint`, and `npm run build` all pass clean.

## 16. Daytime Atmospheric Depth

§9–§15 gave Sunrise and Night real, felt dimension — a genuine sky
gradient, volumetric celestial bodies, layered background depth, cloud
banks with their own parallax. Day was left running the *same* system
but visibly came out flatter: at `--night: 0` and `--golden: 0`, several
phase-aware layers (the golden/twilight haze, the sun's horizon-warmth
bias, the cloud tiers' own light/shadow cues — none of these existed yet
this pass) are mathematically at or near zero, so a clear midday sky had
nothing standing in for them. This pass adds Day-reactive depth using
only tokens the system already computes — no new astronomy, no new
palette, no particles, no lens flare, nothing that reads as "weather."
**Every new value below is 0 or negligible at both Sunrise and Night**
(each formula is shown with the reasoning for why), so nothing already
approved needed to change to add this.

A fourth preview mode, **Day** (`atmospherePreview.ts`, forced to solar
noon — 12:00 local, safely clear of every dawn/dusk ramp and of Golden
Hour's own window at any latitude in the timezone table), joins Live/
Sunrise/Night in the preview toggle (§9) specifically so Day can be
judged on demand the same way those two already could be, rather than
waiting on real local time.

**1. Sky palette — richer overhead, unchanged at the horizon.**
`--sky-64-day` through `--sky-100-day` (the upper half of the 14-stop
gradient) are deepened and given more chroma, progressively more so
toward the zenith (`--sky-100-day` moved from a pale `#a4caef` to a
genuinely richer `#78b6ec` — still well inside the file's existing
"low-saturation, no postcard color" ceiling, not a saturation jump).
`--sky-0-day` through `--sky-56-day` are untouched — the horizon stays
exactly as pale and light as before. Every `-night`/`-transition`/
`-early`/`-late` hex is untouched, so this only ever reaches Sunrise/
Night as a small remainder in their own existing day-hex blend term
(`color-mix(..., var(--night) * 100%)`), already the system's normal,
expected behavior for every other token in the file — not a new risk
this pass introduces.

**2. A day-only horizon veil — real atmospheric perspective, not a
second golden-hour effect.** The existing horizon haze (`.atmosphere-sky`,
§9) is deliberately golden/twilight-only — a warm dusk/dawn effect with
nothing standing in for Day. A new haze layer sits alongside it: cool and
pale (`rgba(228, 236, 240, …)`, not the golden layer's warm peach),
gated by `(1 - --night) * (1 - --golden) * 0.16` — a genuine 0 the
instant either Golden Hour or Night takes hold, so the two haze layers
are never both meaningfully active together. This is the "distant
horizon should have a subtle veil" ask, answered with the same
`linear-gradient(to top, color 0%, transparent N%)` shape the golden haze
already uses — no new technique, a new instance of an existing one.

**3. A soft glow around the sun's actual position — the sun warming its
own sky, not an isolated disc.** A new wide, very-low-alpha radial
gradient (`ellipse 50% 32%`, peak ≈0.12 alpha) centered at
`calc(8% + var(--sun-x) * 84%)` / the same bottom→top elevation
conversion `.atmosphere-sun` itself uses — same coordinates, same
`--sun-mid` token, no new astronomy or color. Gated only by `--night`
(`transparent calc(88% + var(--night) * 12%)`), so it's present through
Day *and* Golden Hour alike — real sunlight scatters through the air at
both — and fades only as Night rises. Deliberately not a flare: no rays,
no hard core, just the sky itself reading slightly warmer near where the
sun really is.

**4. Cloud depth — atmospheric perspective and light/shadow, not more
clouds or more opacity.** Two additive cues on the *existing* three
tiers (§14), sharing the same technique that tier already uses (an extra
stop in an existing radial-gradient, never a new gradient layer or a new
blob):
   - **Atmospheric perspective.** The far/mid tiers' body color is no
     longer flat `--cloud-body` — `--cloud-aerial-far`/`-mid` blend in
     42%/22% of `--sky-0-final`, the sky's own *live* horizon stop, so a
     distant cloud visually leans toward the color of the air between it
     and the viewer, the way real distant clouds do. The near tier is
     untouched (`--cloud-body`, plain) — closest, least atmosphere in
     front of it. Not Day-gated: since `--sky-0-final` is already
     time-of-day-correct, this reads as pale-toward-horizon at Day, more
     warmly horizon-tinted at Sunrise (a genuine improvement there too —
     distant clouds picking up more of a sunrise's own warmth than near
     ones is correct, not an inconsistency), and slightly more indigo at
     Night — one mechanism, three coherent results, because it's built
     from a token that already knows what hour it is.
   - **Light/shadow modeling.** Every body gradient gains one more color
     stop — `--cloud-shadow(-far/-mid)`, each tier's own tone mixed
     toward `--sky-32-final` — sitting past the highlight's own reach
     (≈55–58%, before the existing transparent falloff), so the blob's
     lower/outer body now reads as its own shadowed side instead of just
     fading to nothing. Strength is `--cloud-shadow-mix: (1 - --night) *
     (1 - --golden) * 100%` — nearly 0 at Sunrise/Night (where §14's
     existing golden-lit highlight already carries "this has a light
     source") and strongest at Day, which was the actual complaint: a
     cloud that was simply a paler, flat copy of the sky with no
     directional light on it at all.

**5. Layer separation — confirmed, not restructured.** Sky → the two
haze layers → far clouds → mid clouds → near clouds → foreground/site UI
was already the correct DOM/paint order from §9/§14; this pass adds
depth *within* that existing order (new gradient stops, new haze layers
in the already-established "translucent overlays before the opaque base
gradient" stack) rather than reordering or duplicating any layer.

**What stayed exactly as it was, deliberately:** every astronomy function
in `atmosphere.ts`; all `-night`/`-transition`/`-early`/`-late` hex sets
and the golden/twilight haze's own formula and color; the moon-phase
mechanism and the sun's own disc/shading; the cloud tiers' markup,
positions, sizes, opacity ladder, and parallax/drift; the search box
(§15) and every other consumer of the tokens this pass touched — each
simply inherits the same richer Day values those tokens already produce
everywhere else. Verified directly in a live browser session across the
new Day preview mode and re-checked Sunrise/Night: `getComputedStyle` on
`.atmosphere-sky` and `.atmosphere-clouds-far` confirmed every new
`color-mix()`/`calc()` chain resolves to a real, valid color (not an
invalid/dropped value) at Day, and side-by-side screenshots confirmed
Sunrise and Night render unchanged in character. `tsc --noEmit`,
`eslint`, and `npm run build` all pass clean.

## 17. Search Box — Day Follow-Up (a real bug §16 surfaced)

§16 assumed the search box (§15) would simply read richer once the Day
sky palette deepened, since it already consumed `--sky-64-final`. That
assumption was wrong, and measuring it directly (`getComputedStyle`)
proved it: at Day the field computed to a near-neutral `rgb(227,233,231)`
while the actual sky sat at a genuinely rich `#78b6ec`–`#b9d5ea`. The
root cause was the blend's own weighting, not the sky palette: `.search-
sky-glass` (§15) built its fill as `color-mix(--ivory, --sky-64-final
30%)` — *mostly ivory, lightly tinted by the sky* — so no matter how rich
`--sky-64-final` became, the field could only ever read as "ivory with a
hint of blue," never as "the sky itself, lightened." Deepening the sky
in §16 made this gap visible; it didn't create it.

**The fix inverts the weighting — lighten the sky's own color, don't
dilute it through a mostly-neutral one.** `--search-glass-tint` now
mixes `--sky-64-final` with white via `color-mix()` — the exact
technique `--cloud-body` (§14) already uses to turn the sky's live color
into a paler decorative tone, reused here for the same reason: majority
sky, lightened, rather than majority ivory, tinted. `--ivory` is still
blended in afterward, at a real but clearly minority 22%, so the field
keeps the site's own editorial warmth without that warmth taking back
over the color.

**The lightening amount is time-aware, which is what keeps Sunrise/
Golden Hour/Night correct without touching their own formulas.**
`--search-glass-lighten`/`-border-lighten` are both `(1 - --night) * N%`
— near 0 at Night (the field stays close to `--sky-64-final`'s own
already-dark indigo, unlightened, rather than washing toward gray) and
at full strength by Day (where the sky is naturally pale and the field
needs real lift to stay legible). Golden Hour needed no separate term at
all: its warmth already lives inside `--sky-64-final` itself (the same
blend chain §9's golden overlay stage already feeds), so it flows
through automatically — the fix only ever had to reason about lightening
strength, never about hue.

A small final step also blends in a genuine 6% transparency — not just
"lightened," a little "translucent" too, per the request — so
`backdrop-blur-sm` (already on the element, `HeaderSearch.tsx`) has
something real to reveal in the desktop header, where the live sky sits
directly behind it. Kept deliberately small: a hint of glass, not a wash
of see-through blue that would fight legibility.

**What stayed exactly as it was:** the focus-within:border-plum
interaction and its `@layer base` reasoning (§15) — untouched, and
verified again directly (`.blur()`/`.focus()` on the actual visible
instance, since `Header.tsx` renders two `HeaderSearch` copies and the
hidden desktop one doesn't take real focus at mobile widths — an early,
invalid test against the wrong instance is why this needed a second,
targeted check); the Golden Hour glow's own formula; the mobile search
drawer's behavior (still autofocuses, still closes on navigation);
`--sky-64-final` and every other atmosphere token this rule reads.
Verified directly in a live browser session across Day, Sunrise, and
Night (`getComputedStyle` on the live `.search-sky-glass` background/
border): Day now reads as a clearly blue-tinted, translucent field
instead of near-neutral gray; Sunrise still reads as the same dusty
rose-violet as before this fix; Night stayed deep indigo, if anything
slightly more correct (unlightened at `--search-glass-lighten: 0%`, it
now sits even closer to the sky's own true night color than the
previous ivory-dominant blend did). `tsc --noEmit`, `eslint`, and
`npm run build` all pass clean.

## 18. Brand Mark & Lockup (locked)

The identity is `[星化] | STARHWA` over "The Encyclopedia", defined once in
`BrandLockup.tsx` (header, mobile drawer, footer) around `Mark.tsx`.

- **The mark is Seonghwa's supplied handwriting, never redrawn.** It is
  processed into two silver-chrome cuts (`public/brand/starhwa-mark-light.png`
  for day/dusk, `-dark.png` for night; 780px wide, same crop box so they
  register). Only the thinnest strokes are reinforced (adaptive, tapers
  preserved) and given deep reflective cores, bright highlights and
  mint / ice-blue / lilac / champagne reflections. Glints emerge from where
  the chrome catches light — varied, uneven, some slipping past a stroke's
  edge — never evenly placed "stars". `brand-source/` holds the untouched
  original, the masters and the generator (see its README). Don't hand-edit
  the exported PNGs, and don't add more glints without a design decision.
- **Day/night:** `Mark.tsx` stacks both cuts and crossfades them with
  `--night-text` (`.brand-mark__light/__dark`, `globals.css`) — the same
  signal that flips text ink→ivory — so the mark is legible at every hour.
- **Hierarchy:** the mark leads (56px desktop / 44px mobile header), STARHWA
  supports it (Archivo regular, 14px/12px, 0.5em tracking), separated by a
  1px `charcoal/30` hairline. Don't re-bold the wordmark or shrink the mark.
- No circles, badges, frames or added stars around the mark.

## 19. Rare Aurora

An occasional, unannounced appearance of the original STARHWA aurora
artwork (mint, turquoise, ice blue, lavender; 星化 calligraphy in its
centre) in the Astral Sky —
a discovered moment, not a night-time default. `Aurora.tsx` is mounted
inside `Atmosphere.tsx` (after the stars, before the clouds) and renders
nothing at all unless its roll succeeded; there is no second sky system.

**Rarity (`ATMOSPHERE_CONFIG.aurora`, `atmosphere.ts`).** Eligibility
first, consuming nothing: `getNightAmount >= 0.6` (twilight or deeper),
`getGoldenAmount <= 0.05`, and outside a 5-day per-browser cooldown
(localStorage `starhwa:aurora:lastSeen`, same pattern as the 떵별이
sighting). Then **one** roll per browser session at 5% (sessionStorage
`starhwa:aurora:session`; win or lose is recorded, so reloads and
navigation never re-roll). A win stores its start time; a reload during
an appearance resumes it (negative `animation-delay`) rather than
replaying it. An appearance lasts 150s (`durationMs`, passed to CSS as
`--aurora-duration`): slow fade-in, hold, fade-out. No network, backend
or identifier is involved. `?aurora=now` forces one for review (still
invisible by day — pair with the Night preview).

**Layering.** `.atmosphere-aurora`'s opacity reuses the stars' night/
golden gate, so it recedes with dawn or Golden Hour regardless of its own
timer. It lives in the fixed, `-z-10` `.atmosphere` layer behind all
content at ≤ ~0.3 effective alpha in the upper sky only, so light night
text keeps its contrast. 떵별이, shooting stars and sparkles are
untouched and simply pass in front of it.

**Performance / fallbacks.** Motion is transform and opacity only (curtain
sway, a ray-shimmer pseudo-element, the life fade); blur sits on an inner
element so the animated parent isn't re-rasterised. Curtains need
`mask-image`; inside `@supports` they render, otherwise the mask-free
`.atmosphere-aurora-glow` wash is the whole effect. Under
`prefers-reduced-motion` there is no fade, sway or shimmer — a still,
softer wash for the rest of that page load. The third curtain is dropped
at ≤ 640px.

**Artwork, not generated shapes.** The picture is `public/brand/aurora-sky.jpg`,
the sky of the supplied aurora scene (source: the 2026-10-09 ChatGPT-made
mockup, 1536px wide), cropped to y 140–740 so its baked-in nav, wordmark,
taglines and the mountain/lake landscape are excluded; the 星化 lockup is
left untouched. `.atmosphere-aurora-art` blends it with `mix-blend-mode:
screen` (the sky's dark blue dissolves into the live sky, only its light
adds), feathers all edges with a mask, and caps the image at 0.62 opacity so
night text keeps its contrast. The picture is fully static — an earlier
120s drift/zoom made the artwork's own diagonal ray structure crawl across
the screen (the 1536px source is upscaled ~2x on retina), so it was removed;
only the appearance's fade in/out remains. The earlier CSS curtains/glow were
removed; the rarity, cooldown, fade lifecycle and `?aurora=now` are unchanged.
Higher-resolution source would sharpen it on large displays.

**When it appears (twilight tier).** Eligibility starts at `minNight` 0.3
(blue hour); below `softNight` 0.6 the roll is half as likely
(`twilightChanceFactor`) and the picture is capped at 0.35 opacity — a soft,
translucent version. Full luminosity (and the night-only "swell" below) is
reserved for deep night. By day (`--night` < 0.3) opacity is 0 and nothing is
eligible. Golden Hour still removes it.

**Living aurora — scoped WebGL exception.** §6's "motion is CSS-only, no
animation libraries" rule has one documented exception: `AuroraArt.tsx`
(mounted by `Aurora.tsx` only during an actual appearance) runs a small raw
WebGL pass — no library — so the artwork has genuine, organic movement. A
slow noise flow field pushes the picture's own pixels sideways (more toward
the curtains' lower hem), so folds reshape and ripple; broad brightness
swells, drifting luminous patches and soft filament shimmer move the light
inside them. Three derived layers — `aurora-far.jpg` (diffuse far haze),
`aurora-sky.jpg` (the artwork) and `aurora-near.jpg` (its own brightest fine
light, premultiplied on black, ~160KB) — are warped at different speeds and
scales for depth. Time is continuous (no loop), nothing slides as a sheet,
and the layers are *derived* (`brand-source/aurora-layers.py`), not copies.
Added light is gently calmed around the Moon (feathered, base sky untouched:
no halo) and the Moon is drawn in front (§19 layering above).

Safeguards: it exists only while the rare aurora is mounted, and is paused
while the tab is hidden or the aurora's own night/golden gate has faded it to
~0 (checked each second); ~30fps, DPR ≤ 1.5, ≤ 1.2M pixels, low-power
context; everything (loop, observers, timer, textures, program, context,
canvas) is released on unmount. **Reduced motion:** one stable still frame,
no loop. **Fallback:** if WebGL is unavailable, shader/program/texture
creation fails, or the context is lost, the earlier static picture plus two
out-of-phase CSS opacity swells (`.atmosphere-aurora-swell`, 52s/67s, static
under reduced motion) is shown instead.

**Rain is disabled.** The dev rain prototype's layers are no longer rendered
and its preview row is removed from `AtmospherePreviewToggle`; its state/CSS
are inert.


## 20. Sunrise / Golden Hour / Sunset — distinct skies

These three states used to read as one mauve-gray sky. Causes: (1) one
shared `-early → -late` golden overlay served both the morning and evening
windows, so Sunrise (progress 0.5), Golden Hour (0.3) and Sunset (0.85) all
sampled the same palette; (2) its hexes were desaturated mauve/blue-grays
with only the horizon stop warm; (3) the symmetric `--sky-transition`
rose-violet tint was mixed in underneath at every one of them (0.56–0.96
weight), washing out whatever the overlay added.

Now, in `:root` of `globals.css`: `--sky-evening` (0 = morning, 1 = evening,
derived from `--sun-x`, no JS) picks the palette. Per stop: `-dawn-a/-dawn-b`
(pale rose/lavender/peach with morning blue overhead) for Sunrise;
`-early` (honey, amber, champagne) → `-late` (orange horizon, rose, magenta,
plum, violet) for the evening, with `-early` held longer via a squared
progress; `-transition-dawn` / `-transition` as direction-aware blue-hour
tints. `--sky-tint-weight` holds the dusk tint back until night is under way,
and the overlay's weight is `min(1, --golden * 1.5)` so it can dominate.
Full day and full night are unchanged (verified: identical stop colors).

## 21. The Crew's Secret entrance (footer)

A single, quiet doorway to a separate multiplayer game (The Crew's Secret),
kept deliberately outside the archive's content, search and sitemap. It lives
in the footer's "Project" column (`CrewHourglass.tsx`, under the link list) and
is not a banner, section or page of its own.

- **Artwork:** `public/brand/crews-secret-lightstick.webp` — a 320×480
  transparent studio render of an *original* Cromer-style light stick
  (hourglass in an engraved star-chart globe, clear orbit band, silver grip),
  shown at 40×60px. It was rendered in Blender, not drawn in CSS; the cube
  button and ring markings are original geometry, not copied artwork. The
  source scene is not in this repo.
- **Treatment:** Decorative, so `alt=""` with the visible mono label
  ("The Crew's Secret") as its text alternative (§5). Idle: a faint turquoise
  glow. Hover/focus: the glow warms to turquoise + gold (200ms, `filter`
  only) and the shared 별빛팡팡 glint pops once (§6.1). Reduced motion: no
  transition (the glint is already hidden).
- **Destination:** `NEXT_PUBLIC_CREWS_SECRET_URL`. Unset → hidden in
  production, a dimmed non-interactive placeholder in development. Set → opens
  the game in a new tab (`rel="noopener noreferrer"`) with a screen-reader note
  that it's a separate game.
- **Footprint:** 60px minimum height keeps a comfortable tap target without
  adding a new layout step; no new colour token (the glow is a scoped custom
  property in `globals.css`).
