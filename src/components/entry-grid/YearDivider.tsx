export default function YearDivider({ year, count }: { year: number; count: number }) {
  return (
    <div className="col-span-full flex items-baseline gap-5 pt-4 first:pt-0">
      <h2 className="font-display text-4xl leading-none text-ink sm:text-5xl">{year}</h2>
      <span aria-hidden="true" className="text-[10px] text-plum/50">
        ✦
      </span>
      <div className="h-px flex-1 bg-line" aria-hidden="true" />
      <span className="meta whitespace-nowrap text-charcoal/75">
        {count} {count === 1 ? "entry" : "entries"}
      </span>
    </div>
  );
}
