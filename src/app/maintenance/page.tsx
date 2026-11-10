import type { Metadata } from "next";
import { RenewalCountdown } from "@/components/RenewalCountdown";
import { getRenewals, RENEWAL_TIME_ZONE, formatExpiry, startOfDayMs } from "@/lib/renewals";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

// Gated by src/proxy.ts; never cache or prerender a copy of the dates.
export const dynamic = "force-dynamic";

export default function MaintenancePage() {
  const items = getRenewals().map((r) => ({
    label: r.label,
    service: r.service,
    expiryText: formatExpiry(r.date),
    expiresAt: startOfDayMs(r.date),
  }));

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="eyebrow text-plum">Maintenance</p>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">Renewals</h1>
      <p className="meta mt-3 text-charcoal/70">
        Counted to the start of the day · {RENEWAL_TIME_ZONE.replace("_", " ")}
      </p>

      {items.length === 0 ? (
        <p className="meta mt-10 text-charcoal/70">No renewal dates are configured.</p>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {items.map((item, i) => (
            <RenewalCountdown key={item.label} {...item} emphasis={i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
