/**
 * 별빛팡팡 ("starlight popping") — the site's signature micro-interaction.
 * This is the exact 4-point glint from the brand mark's corner (see
 * `Mark.tsx`, `icon.svg`), extracted so it can recur in motion elsewhere
 * without inventing a second decorative shape. Always paired with a
 * trigger class from `globals.css` (`.glint-hover` for a hover/focus pop,
 * `.glint-burst` for a one-shot entrance) — this component only renders
 * the glyph; the parent controls when/whether it's visible.
 */
export default function Glint({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`glint ${className}`}
      style={style}
      fill="none"
    >
      <path
        d="M10 1 L11.8 8.2 L19 10 L11.8 11.8 L10 19 L8.2 11.8 L1 10 L8.2 8.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}
