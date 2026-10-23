"use client";

/** Development-only (mounted in layout.tsx behind `NODE_ENV === "development"`):
 *  asks Aurora.tsx to play the anniversary aurora right now. Touches no storage. */
export const AURORA_TEST_EVENT = "starhwa:aurora-test-anniversary";

export default function AuroraTestButton() {
  if (process.env.NODE_ENV !== "development") return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(AURORA_TEST_EVENT))}
      className="meta fixed bottom-4 left-4 z-40 border border-line bg-ivory/90 px-3 py-2 text-charcoal hover:text-plum"
    >
      Test Anniversary Aurora
    </button>
  );
}
