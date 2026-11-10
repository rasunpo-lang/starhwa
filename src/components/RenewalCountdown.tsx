"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  service: string;
  expiryText: string;
  expiresAt: number;
  /** Heavier top rule on the nearer deadline; the only visual difference. */
  emphasis?: boolean;
};

const MINUTE = 60_000;

function split(ms: number) {
  const total = Math.floor(Math.abs(ms) / MINUTE);
  return {
    days: Math.floor(total / 1440),
    hours: Math.floor((total % 1440) / 60),
    minutes: total % 60,
  };
}

export function RenewalCountdown({
  label,
  service,
  expiryText,
  expiresAt,
  emphasis,
}: Props) {
  // null until mounted, so server and client markup match.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const remaining = now === null ? null : expiresAt - now;
  const expired = remaining !== null && remaining <= 0;
  const t = remaining === null ? null : split(remaining);

  const cells: [string, number | null][] = [
    ["Days", t?.days ?? null],
    ["Hours", t?.hours ?? null],
    ["Minutes", t?.minutes ?? null],
  ];

  return (
    <section
      className={`pt-5 ${
        emphasis ? "border-t-2 border-plum/50" : "border-t border-line"
      }`}
    >
      <p className="eyebrow text-plum">{label}</p>
      <h2 className="mt-2 font-display text-2xl">{service}</h2>
      <p className="meta mt-2 text-charcoal/70">
        {expired ? "Expired" : "Expires"} · {expiryText}
      </p>

      <dl className="mt-6 grid grid-cols-3 gap-4" aria-live="off">
        {cells.map(([name, value]) => (
          <div key={name}>
            <dd className="font-display text-4xl tabular-nums">
              {value === null ? "–" : value}
            </dd>
            <dt className="meta mt-1 text-charcoal/70">
              {expired ? `${name} ago` : name}
            </dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
