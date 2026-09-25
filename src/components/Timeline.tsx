import Link from "next/link";
import { eras } from "@/data/eras";

const SPAN_START = new Date("2018-10-24").getTime();

function positionOf(dateStr: string, spanEnd: number) {
  const t = new Date(dateStr).getTime();
  return ((t - SPAN_START) / (spanEnd - SPAN_START)) * 100;
}

export default function Timeline({ now }: { now: number }) {
  const spanEnd = now;

  return (
    <div className="w-full">
      <div aria-hidden="true">
        <div className="eyebrow flex items-baseline justify-between text-charcoal/85">
          <span>2018</span>
          <span>Present</span>
        </div>

        <div className="relative mt-3 h-px w-full bg-line">
          {eras.map((era) => {
            const left = positionOf(era.startDate, spanEnd);
            return (
              <span
                key={era.id}
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-plum bg-ivory"
                style={{ left: `${left}%` }}
              />
            );
          })}
          <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border border-plum bg-ivory" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        {eras.map((era) => (
          <Link
            key={era.id}
            href={`/chronology#${era.id}`}
            className="group block border-t border-line pt-3 transition-colors hover:border-plum"
          >
            <p className="meta text-charcoal/75">{era.years}</p>
            <p className="mt-1 font-display text-base leading-snug text-ink group-hover:text-plum sm:text-lg">
              {era.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
