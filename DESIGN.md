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
  border-color 150ms ease` in `.btn`, `globals.css`).
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
