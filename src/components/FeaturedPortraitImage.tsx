"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getNightAmount } from "@/lib/atmosphere";
import { getAtmospherePreviewMode, getPreviewDate, subscribeAtmospherePreviewMode } from "@/lib/atmospherePreview";

type PortraitVariant = { url: string; credit?: string };

/**
 * Featured Era's existing image slot (page.tsx) — this replaces only the
 * plain <Image>/<figcaption> pair page.tsx renders when the era's photo
 * happens to be one specific pair of curated entries, made to react to
 * the same real day/night state Atmosphere.tsx already computes for the
 * sky. Every class name, the aspect box, and the credit line are passed
 * in from page.tsx unchanged — this component owns none of that styling
 * itself, only which of the two images (and which one's own credit) is
 * currently active. Reuses getNightAmount()/the existing preview-mode
 * plumbing verbatim (no new astronomy), so the site's existing Live/Day/
 * Sunrise/Night preview toggle drives this too, for free.
 *
 * A hard swap, never a crossfade: exactly one <Image> is ever mounted,
 * chosen the instant --night's own continuous 0–1 value crosses 0.5 —
 * the same midpoint DESIGN.md §9's --sky-transition already treats as
 * the center of the dawn/dusk ramp. Starts on the day image (a date-
 * independent default) so server and client render identically on first
 * paint, then corrects itself client-side in the mount effect — the same
 * defensive pattern Atmosphere.tsx's own `isBirthday` state already uses
 * to avoid a hydration mismatch.
 */
export default function FeaturedPortraitImage({
  day,
  night,
  imageClassName,
  containerClassName,
  sizes,
}: {
  day: PortraitVariant;
  night: PortraitVariant;
  imageClassName: string;
  containerClassName: string;
  sizes: string;
}) {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    function apply() {
      const now = getPreviewDate(new Date(), getAtmospherePreviewMode());
      setIsNight(getNightAmount(now) >= 0.5);
    }
    apply();
    const interval = window.setInterval(apply, 30_000);
    const unsubscribePreview = subscribeAtmospherePreviewMode(apply);
    return () => {
      window.clearInterval(interval);
      unsubscribePreview();
    };
  }, []);

  const active = isNight ? night : day;

  return (
    <>
      <div className={containerClassName}>
        <Image key={active.url} src={active.url} alt="" fill sizes={sizes} className={imageClassName} />
      </div>
      {active.credit && <figcaption className="meta mt-3 text-charcoal/60">{active.credit}</figcaption>}
    </>
  );
}
