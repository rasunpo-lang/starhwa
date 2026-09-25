import Mark from "./Mark";

/**
 * The locked STARHWA lockup: [星化] | STARHWA over "The Encyclopedia".
 * One component so the header, mobile drawer, and footer can't drift
 * apart. The handwritten mark leads (it's the taller, more substantial
 * element); STARHWA is set light and widely tracked so it supports the
 * mark rather than out-shouting it. `size` only changes scale — the
 * proportions between mark, divider, wordmark, and descriptor are fixed.
 * The visible text ("STARHWA / The Encyclopedia") is the link's
 * accessible name; the mark itself is decorative (alt="").
 */
const SIZES = {
  // mark height, divider height, wordmark px, tracking em, descriptor px, gap (divider margin)
  header: {
    mark: "h-11 sm:h-14",
    divider: "h-8 sm:h-[42px]",
    gap: "mx-3 sm:mx-5",
    word: "text-[12px] tracking-[0.46em] sm:text-[14px] sm:tracking-[0.5em]",
    desc: "text-[7.5px] sm:text-[8.5px]",
  },
  footer: {
    mark: "h-14 sm:h-16",
    divider: "h-10 sm:h-12",
    gap: "mx-4 sm:mx-5",
    word: "text-[14px] tracking-[0.5em] sm:text-[16px]",
    desc: "text-[8.5px] sm:text-[9.5px]",
  },
} as const;

export default function BrandLockup({ size = "header" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <span className="flex items-center">
      <Mark className={s.mark} />
      <span aria-hidden="true" className={`${s.divider} ${s.gap} w-px shrink-0 bg-charcoal/30`} />
      <span className="flex flex-col gap-2 leading-none">
        <span className={`font-sans font-normal uppercase leading-none ${s.word}`}>Starhwa</span>
        <span
          className={`font-mono uppercase leading-none tracking-[0.2em] text-charcoal/70 ${s.desc}`}
        >
          The Encyclopedia
        </span>
      </span>
    </span>
  );
}
