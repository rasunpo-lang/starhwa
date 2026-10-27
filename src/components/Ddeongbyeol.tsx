/**
 * A minimal, original line-art rendering of 떵별이 (DDEONGbyeoli) —
 * Seonghwa's actual ANITEEZ mascot — drawn in the archive's own hand
 * rather than reproducing official artwork (this archive never rehosts
 * media, see DESIGN.md §5). A clean frontal view (not the slight angle
 * of a hanging-keyring product photo): big heart-shaped ears, a head
 * with two soft cheek bulges set off from the chin by a subtle inward
 * curve, and eyes that are white on top / pink on the bottom with a
 * small brown pupil — not a solid dark eye. The body is not
 * conventional bunny anatomy: it's a compact rounded rectangle with
 * short graphic-nub limbs — arms extending horizontally out from the
 * upper sides, legs standing straight down (not bent/hanging like a
 * sitting animal's) — closer to an icon's shape language than
 * anatomy.
 *
 * The palette is entirely 떵별이's own — pink outline, brown pupils, pink
 * mouth and eye-fill — a character-canon set scoped to this file,
 * deliberately outside the site's ivory/plum/ink tokens (see DESIGN.md
 * §3), so the character never gets pulled into looking like a generic "STARHWA
 * bunny."
 *
 * Two distinct concepts, kept visually separate: 떵별이 is a character
 * (this component), while 별빛팡팡 is STARHWA's starlight/glint visual
 * language (Glint.tsx, orbiting the character in DdeongbyeolSighting.tsx). Nothing
 * in this file borrows plum or the glint shape — the glints surround
 * it, they never determine its silhouette or palette.
 */
import { useId } from "react";

const PINK = "#f4c9d6";
const PINK_DEEP = "#e9a4b8";
const PINK_LINE = "#dd93ab";
const BROWN = "#6b4432";
const WHITE = "#fdf9f6";

const EAR_L_D = "M33 26 C27 21 15 14 10 8 C9 2 17 -2 27 0.5 C31 1.8 33 7 32 14 C31.8 18 32 22 33 26 Z";
const EAR_R_D = "M31 26 C37 21 49 14 54 8 C55 2 47 -2 37 0.5 C33 1.8 31 7 32 14 C32.2 18 32 22 31 26 Z";
const BODY_D = `M20.5 43.5 L43.5 43.5 L44.2 44.8
           L39.5 57 Q39 60.5 37 60.5 L27 60.5
           Q25 60.5 24.5 57 Z`;
const HEAD_D = `M32 16 C26 16 19 17 17 21 C17 25.5 10 30.5 9 35 C9 40 13 44 18 46.5
             C20.5 48 22 46.8 23.5 47.3 C26 47.8 29 48.1 32 48.2
             C35 48.1 38 47.8 40.5 47.3 C42 46.8 43.5 48 46 46.5
             C51 44 55 40 55 35 C54 30.5 47 25.5 47 21 C45 17 38 16 32 16 Z`;

/**
 * `dimensional` is the 2.5D finish (on by default; pass `false` for the
 * original flat rendering): same silhouette and canon palette, plus a
 * soft pearlescent sheen / underside shade laid over the ears, head and
 * body, and the three depth layers (ears, head, body) tagged so
 * DdeongbyeolSighting's single slow turn can shift them a hair against
 * each other. No new hue beyond a barely-there pearl tint.
 */
export default function Ddeongbyeol({
  className = "",
  dimensional = true,
}: {
  className?: string;
  dimensional?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const sheen = `dd-sheen-${uid}`;
  const shade = `dd-shade-${uid}`;
  const layer = (name: string) => (dimensional ? `dd-layer dd-layer--${name}` : undefined);
  // Overlay for one shape: a top-left specular sheen, then an underside
  // shade with a faint cool pearl tint. fill-only, no stroke.
  const finish = (d: string) =>
    dimensional ? (
      <>
        <path d={d} fill={`url(#${sheen})`} />
        <path d={d} fill={`url(#${shade})`} />
      </>
    ) : null;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 -6 64 73"
      className={`shrink-0 ${className}`}
      fill="none"
    >
      {dimensional && (
        <defs>
          <radialGradient id={sheen} cx="0.32" cy="0.2" r="0.65">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={shade} x1="0.3" y1="0.35" x2="0.75" y2="1">
            <stop offset="0" stopColor="#c9d3f2" stopOpacity="0" />
            <stop offset="0.6" stopColor="#c9d3f2" stopOpacity="0.14" />
            <stop offset="1" stopColor={PINK_LINE} stopOpacity="0.32" />
          </linearGradient>
        </defs>
      )}
      {/* ears — big, with big rounded tips that connect at the top just
          as the bases connect at the bottom, so the whole pair reads as
          one continuous heart. Shifted up with the head (see the head
          group below) — there's no neck, but a deliberate gap of empty
          space between the head/ears and the body, not a direct join. */}
      <g className={layer("ears")}>
      <g transform="translate(0 -3.5)">
        {/* each ear is squashed wider / shorter around its own center
            so it reads as a broad heart-lobe rather than a narrow,
            elongated one */}
        <g transform="translate(21 12) scale(1.05 0.9) translate(-21 -12)">
          <path
            d="M33 26 C27 21 15 14 10 8 C9 2 17 -2 27 0.5 C31 1.8 33 7 32 14 C31.8 18 32 22 33 26 Z"
            fill={PINK}
          />
          <path
            d="M32 26 C27 21 15 14 10 8 C9 2 17 -2 27 0.5 C31 1.8 33 7 32 14"
            stroke={PINK_LINE}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M27.8 18.5 C25.4 15.9 20.3 12.2 18.3 9.2 C16.3 5.9 20.8 3.4 25.9 5.5
               C27.6 6.2 28.4 9.1 27.8 12.6 C27.7 14.6 27.8 16.5 27.8 18.5 Z"
            fill={WHITE}
          />
          {finish(EAR_L_D)}
        </g>
        <g transform="translate(43 12) scale(1.05 0.9) translate(-43 -12)">
          <path
            d="M31 26 C37 21 49 14 54 8 C55 2 47 -2 37 0.5 C33 1.8 31 7 32 14 C32.2 18 32 22 31 26 Z"
            fill={PINK}
          />
          <path
            d="M32 26 C37 21 49 14 54 8 C55 2 47 -2 37 0.5 C33 1.8 31 7 32 14"
            stroke={PINK_LINE}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M36.2 18.5 C38.6 15.9 43.7 12.2 45.7 9.2 C47.7 5.9 43.2 3.4 38.1 5.5
               C36.4 6.2 35.6 9.1 36.2 12.6 C36.3 14.6 36.2 16.5 36.2 18.5 Z"
            fill={WHITE}
          />
          {finish(EAR_R_D)}
        </g>
      </g>
      </g>

      {/* body — rectangular, straight-edged, tapering narrower toward
          the bottom (a trapezoid with softly rounded corners, not a
          curvy organic taper); drawn before the limbs so their outline
          sits cleanly on top, one continuous line around the whole
          body+limb silhouette */}
      <g className={layer("body")}>
      <path
        d={BODY_D}
        fill={PINK}
        stroke={PINK_LINE}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      {/* limbs — short graphic nubs, not anatomical: arms extend
          outward from the wide upper sides of the tapered body, legs
          stand straight down near the slender bottom. Each limb
          is a fill-only shape (so nothing shows where it tucks under
          the body) plus a separate stroke tracing only its outward-
          facing arc — a line around the outside of the silhouette,
          never cutting across the inside of the body. */}
      <rect x="15" y="43" width="9" height="9" rx="2" fill={PINK} />
      <path d="M24 43 L17 43 Q15 43 15 45 L15 50 Q15 52 17 52 L24 52" stroke={PINK_LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="40" y="43" width="9" height="9" rx="2" fill={PINK} />
      <path d="M40 43 L47 43 Q49 43 49 45 L49 50 Q49 52 47 52 L40 52" stroke={PINK_LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="16.5" cy="47.5" rx="3.3" ry="2.6" fill={WHITE} />
      <ellipse cx="47.5" cy="47.5" rx="3.3" ry="2.6" fill={WHITE} />

      <rect x="23.2" y="53" width="7.6" height="13" rx="2" fill={PINK} />
      <path d="M23.2 55 L23.2 64 Q23.2 66 25.2 66 L28.8 66 Q30.8 66 30.8 64 L30.8 55" stroke={PINK_LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="33.2" y="53" width="7.6" height="13" rx="2" fill={PINK} />
      <path d="M40.8 55 L40.8 64 Q40.8 66 38.8 66 L35.2 66 Q33.2 66 33.2 64 L33.2 55" stroke={PINK_LINE} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="27" cy="64" rx="2.3" ry="1.8" fill={WHITE} />
      <ellipse cx="37" cy="64" rx="2.3" ry="1.8" fill={WHITE} />

      {/* belly — painted after the legs (not right after the body
          fill) specifically so it renders fully intact: the legs'
          fill-only tops (y 53–55) tuck invisibly under the body/belly
          per the limb comment above, but that only reads correctly if
          the belly is the topmost shape in that overlap — drawing it
          earlier let the leg fill cut into its bottom corners. */}
      <ellipse cx="32" cy="50.5" rx="5.2" ry="4.5" fill={WHITE} />
      {finish(BODY_D)}
      </g>

      {/* head — a rounded dome at top flaring to two soft round cheek
          bulges lower down, each separated from a flat (not bulging)
          chin by a subtle inward curve (not one continuous oval
          outline). Shifted up with the ears (see above): the head
          floats above the body with a deliberate gap — no neck. */}
      <g className={layer("head")}>
      <g transform="translate(0 -3.5)">
        <path
          d={HEAD_D}
          fill={PINK}
          stroke={PINK_LINE}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {finish(HEAD_D)}
        {/* mask — paints over just the short peak of the head's own
            outline (where it would otherwise dangle into the notch
            between the ear tips as a stray line); everywhere else the
            head's real outline stays intact and connects to the ears */}
        <path d="M32 16 L28.7 16.2" stroke={PINK} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M32 16 L35.3 16.2" stroke={PINK} strokeWidth="2.2" strokeLinecap="round" />

        {/* face — eyebrows, then a brown line along the top of each
            eye that continues outward past the eye's corner, then
            eyes: white on top, pink on the bottom, with a small brown
            pupil (not a solid dark eye, no lashes) */}
        <path d="M23.2 27.8 L25.5 28.6" stroke={BROWN} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M38.5 28.6 L40.8 27.8" stroke={BROWN} strokeWidth="1.1" strokeLinecap="round" />

        <g transform="translate(24.5 37) rotate(-14) scale(1.3)">
          <path
            d="M0 -3.2 C2.5 -2.5 3.2 0.3 2.3 2.3 C1.4 3.5 -1.4 3.5 -2.3 2.3 C-3.2 0.3 -2.5 -2.5 0 -3.2 Z"
            fill={BROWN}
          />
          <ellipse cx="0.5" cy="-2.3" rx="1.3" ry="1" transform="rotate(20 0.5 -2.3)" fill={WHITE} />
          <ellipse cx="-0.5" cy="-0.9" rx="1.1" ry="0.85" transform="rotate(20 -0.5 -0.9)" fill={WHITE} />
          <path d="M0 -2.8 Q-2 -3 -5 -3.5" stroke={BROWN} strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <ellipse cx="0" cy="2.6" rx="1.8" ry="0.85" fill={PINK_DEEP} />
          <circle cx="-0.6" cy="0.5" r="0.35" fill={WHITE} />
        </g>
        <g transform="translate(39.5 37) rotate(14) scale(1.3)">
          <path
            d="M0 -3.2 C2.5 -2.5 3.2 0.3 2.3 2.3 C1.4 3.5 -1.4 3.5 -2.3 2.3 C-3.2 0.3 -2.5 -2.5 0 -3.2 Z"
            fill={BROWN}
          />
          <ellipse cx="0.5" cy="-2.3" rx="1.3" ry="1" transform="rotate(20 0.5 -2.3)" fill={WHITE} />
          <ellipse cx="-0.5" cy="-0.9" rx="1.1" ry="0.85" transform="rotate(20 -0.5 -0.9)" fill={WHITE} />
          <path d="M0 -2.8 Q2 -3 5 -3.5" stroke={BROWN} strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <ellipse cx="0" cy="2.6" rx="1.8" ry="0.85" fill={PINK_DEEP} />
          <circle cx="0.6" cy="0.5" r="0.35" fill={WHITE} />
        </g>
        <ellipse cx="17.5" cy="40.5" rx="3.3" ry="2.3" fill={PINK_DEEP} opacity="0.85" />
        <ellipse cx="46.5" cy="40.5" rx="3.3" ry="2.3" fill={PINK_DEEP} opacity="0.85" />

        <circle cx="32" cy="40" r="0.7" fill={PINK_LINE} />

        <path
          d="M28 42 Q30 43.7 32 42.3 Q34 43.7 36 42"
          stroke={PINK_LINE}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      </g>
    </svg>
  );
}
