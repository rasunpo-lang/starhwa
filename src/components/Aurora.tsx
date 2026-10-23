"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ATMOSPHERE_CONFIG, getGoldenAmount, getNightAmount } from "@/lib/atmosphere";
import AuroraArt from "@/components/AuroraArt";
import { AURORA_TEST_EVENT } from "@/components/AuroraTestButton";
import { getAtmospherePreviewMode, getPreviewDate } from "@/lib/atmospherePreview";
import { getAnniversaryMessage, getAnniversaryYears, isDebutAnniversary } from "@/lib/anniversary";

const CFG = ATMOSPHERE_CONFIG.aurora;
const SESSION_KEY = "starhwa:aurora:session";
const SEEN_KEY = "starhwa:aurora:lastSeen";
const ANNIVERSARY_KEY_PREFIX = "starhwa:aurora:anniversary-";

/** ATEEZ's debut anniversary, every October 24 (Asia/Seoul calendar date,
 *  src/lib/anniversary.ts). On that date only, the aurora is a guaranteed
 *  celebration: no dice roll, cooldown, or night/golden gate. The session
 *  record is keyed by year so each year plays once per session. */

/**
 * ✦ RARE AURORA (DESIGN.md §19) — an occasional, unannounced appearance of
 * the original aurora artwork (星化) in the Astral Sky. Not an animation loop and not a
 * night-time default: it renders nothing at all unless a single dice roll
 * succeeded.
 *
 * Rarity, in order:
 *  1. Eligibility (nothing is consumed if it fails): blue hour or deeper
 *     (`minNight`; softer version below `softNight`), not inside Golden Hour, and outside the per-browser
 *     cooldown (localStorage `lastSeen`, same pattern as
 *     DdeongbyeolSighting).
 *  2. One roll per browser *session* (sessionStorage), `chancePerSession`.
 *     Win or lose is recorded, so reloads and page-to-page navigation never
 *     re-roll — no refresh-until-lucky, and never twice in one session.
 *  3. A win records its start time; a reload mid-appearance resumes the
 *     same appearance (animation-delay is offset by the elapsed time)
 *     instead of replaying or vanishing.
 *
 * Nothing leaves the browser: no network request, no backend, no id.
 * Visibility is additionally gated in CSS by the live --night/--golden
 * values, so an appearance still fades with the sky if dawn arrives.
 *
 * Demo aid: `?aurora=now` forces an appearance (bypassing chance, session
 * and cooldown). It is still invisible by day — use the Night preview.
 */
export default function Aurora() {
  // null = not showing. A number = ms already elapsed in this appearance.
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [anniversary, setAnniversary] = useState(false);
  const [run, setRun] = useState(0); // dev test button: remounts to replay

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer: number | undefined;

    function show(startedAt: number, celebrate = false) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 0 || elapsed >= CFG.durationMs) return;
      window.clearTimeout(timer);
      if (celebrate) setAnniversary(true);
      setElapsedMs(elapsed);
      // Reduced motion: no fade lifecycle, so it simply stays, static, for
      // the rest of this page load (the night/golden gate still lets it
      // recede with the sky). Next load it's already expired.
      if (!reduceMotion) {
        timer = window.setTimeout(() => setElapsedMs(null), CFG.durationMs - elapsed);
      }
    }

    const anniversaryKey = `${ANNIVERSARY_KEY_PREFIX}${getAnniversaryYears()}`;

    function begin(celebrate = false) {
      const now = Date.now();
      if (celebrate) {
        // Own session record; deliberately leaves the normal cooldown
        // (SEEN_KEY) and roll record untouched.
        try {
          window.sessionStorage.setItem(anniversaryKey, String(now));
        } catch {
          // Storage unavailable — it still plays once for this page load.
        }
        show(now, true);
        return;
      }
      try {
        window.sessionStorage.setItem(SESSION_KEY, String(now));
        window.localStorage.setItem(SEEN_KEY, String(now));
      } catch {
        // Storage unavailable — it still plays once for this page load.
      }
      show(now);
    }

    const forced = new URLSearchParams(window.location.search).get("aurora") === "now";
    if (!forced && isDebutAnniversary()) {
      let recorded: string | null = null;
      try {
        recorded = window.sessionStorage.getItem(anniversaryKey);
      } catch {
        // Treated as "no record": plays once for this page load.
      }
      if (recorded === null) {
        begin(true);
      } else {
        // Reload/navigation mid-appearance resumes it; an expired one stays quiet.
        const startedAt = Number(recorded);
        if (startedAt > 0) show(startedAt, true);
      }
    } else if (forced) {
      begin();
    } else {
      let recorded: string | null = null;
      try {
        recorded = window.sessionStorage.getItem(SESSION_KEY);
      } catch {
        // Treated as "no record"; the cooldown below can't be read either,
        // so fall through to the same eligibility checks.
      }

      if (recorded !== null) {
        // Already decided this session: resume a live appearance, or stay quiet.
        const startedAt = Number(recorded);
        if (startedAt > 0) show(startedAt);
      } else {
        const now = getPreviewDate(new Date(), getAtmospherePreviewMode());
        const night = getNightAmount(now);
        const eligible = night >= CFG.minNight && getGoldenAmount(now) <= CFG.maxGolden;
        const chance = CFG.chancePerSession * (night < CFG.softNight ? CFG.twilightChanceFactor : 1);
        let offCooldown = true;
        try {
          const last = Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
          offCooldown = Date.now() - last >= CFG.cooldownMs;
        } catch {
          // Unreadable storage: allow the (still rare) session roll.
        }

        if (eligible && offCooldown) {
          if (Math.random() < chance) {
            begin();
          } else {
            try {
              window.sessionStorage.setItem(SESSION_KEY, "0");
            } catch {
              // Non-fatal — worst case another rare roll on the next load.
            }
          }
        }
      }
    }

    // Development-only preview: replays the anniversary aurora on demand,
    // writing no storage so the real cooldown/session records are untouched.
    function onTest() {
      setRun((n) => n + 1);
      show(Date.now(), true);
    }
    if (process.env.NODE_ENV === "development") window.addEventListener(AURORA_TEST_EVENT, onTest);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(AURORA_TEST_EVENT, onTest);
    };
  }, []);

  if (elapsedMs === null) return null;

  const lifeStyle = {
    "--aurora-duration": `${CFG.durationMs}ms`,
    animationDelay: `-${elapsedMs}ms`,
  } as CSSProperties;

  return (
    <>
      <div className={`atmosphere-aurora${anniversary ? " atmosphere-aurora--anniversary" : ""}`}>
        <div key={run} className="atmosphere-aurora-life" style={lifeStyle}>
          <AuroraArt />
          {anniversary && <div className="atmosphere-aurora-foil" aria-hidden="true" />}
        </div>
      </div>
      {/* Anniversary message: real, readable text, so it lives outside the
          aria-hidden sky layer (portal to <body>), shares the aurora's own
          lifecycle keyframe/duration/offset, and never takes pointer events. */}
      {anniversary &&
        createPortal(
          <p key={run} role="status" className="anniversary-message" style={lifeStyle}>
            {getAnniversaryMessage(getAnniversaryYears())}
          </p>,
          document.body,
        )}
    </>
  );
}
