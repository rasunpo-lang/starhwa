import Image from "next/image";
import light from "../../public/brand/starhwa-mark-light.png";
import dark from "../../public/brand/starhwa-mark-dark.png";

// The locked 星化 mark — Seonghwa's own handwriting, exactly as supplied,
// processed (never redrawn or retraced) into two silver-chrome cuts:
//   - light: day/dusk — deep reflective cores, bright highlights, mint /
//     ice-blue / lilac / champagne reflections, and glints that emerge
//     from where the chrome would catch light (not placed stars)
//   - dark:  night — the same silhouette in luminous silver
// Both exports share one crop box (halos included) so they register
// exactly. Masters and the generator live in /brand-source; the pixels
// here are 780px-wide exports, so don't edit them by hand.
// The two cuts crossfade with the sky via --night-text (globals.css,
// .brand-mark__*), the same signal that flips text from ink to ivory —
// so the mark stays legible at every hour, not just day or night.
// The title text next to every usage is its text alternative, so alt=""
// is correct here (see DESIGN.md §5 alt text policy).
// EXPERIMENT (reversible): occasional "catch the light" glints, pinned to
// hand-picked points on the existing strokes (crossings, tips, the original
// corner glint). Coordinates are % of the 780x503 artwork. Each glint runs
// its own long, different-length cycle (globals.css, .brand-mark__glint) so
// they never fall into a pattern. To remove: delete GLINTS, the
// <span className="brand-mark__glints"> below, and the "Mark glint
// experiment" block in globals.css.
const GLINTS: { x: number; y: number; dur: number; delay: number; strong?: boolean }[] = [
  { x: 24.4, y: 30.2, dur: 23.3, delay: 4.1 },
  { x: 60.8, y: 48.9, dur: 31.7, delay: 11.6, strong: true },
  { x: 96.4, y: 55.3, dur: 27.1, delay: 17.9 },
  { x: 75.4, y: 15.5, dur: 37.9, delay: 8.2 },
  { x: 24.1, y: 81.9, dur: 29.3, delay: 22.4 },
  { x: 7.9, y: 14.7, dur: 41.3, delay: 14.7, strong: true },
  { x: 48.7, y: 48.7, dur: 34.1, delay: 26.3 },
];

export default function Mark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-mark relative inline-block shrink-0 ${className}`}>
      <Image
        src={light}
        alt=""
        aria-hidden="true"
        className="brand-mark__light h-full w-auto"
        sizes="120px"
        quality={90}
        priority
      />
      <Image
        src={dark}
        alt=""
        aria-hidden="true"
        className="brand-mark__dark absolute left-0 top-0 h-full w-auto"
        sizes="120px"
        quality={90}
        priority
      />
      <span className="brand-mark__glints" aria-hidden="true">
        {GLINTS.map((g, i) => (
          <span
            key={i}
            className={`brand-mark__glint${g.strong ? " brand-mark__glint--strong" : ""}`}
            style={{ left: `${g.x}%`, top: `${g.y}%`, animationDuration: `${g.dur}s`, animationDelay: `${g.delay}s` }}
          />
        ))}
      </span>
    </span>
  );
}
