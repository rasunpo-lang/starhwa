/**
 * Applies only to this segment — the homepage (src/app/page.tsx), the
 * one route on the site that's genuinely request-rendered
 * (force-dynamic, for the date-dependent "On This Day" panel). Every
 * other route (archive, chronology, entries, etc.) is statically
 * generated and resolves instantly, so it never mounts a loading
 * boundary here or anywhere else — this file intentionally doesn't
 * exist at the root layout level in a way that could leak into sibling
 * static routes.
 *
 * A quiet skeleton, not a spinner — matches the "subtle, no gratuitous
 * motion" rule in DESIGN.md. animate-pulse already respects the site's
 * global prefers-reduced-motion override in globals.css.
 */
export default function Loading() {
  return (
    <div className="border-b border-line">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-28">
        <div className="animate-pulse">
          <div className="h-3 w-56 bg-ivory-dim" />
          <div className="mt-5 h-16 w-full max-w-md bg-ivory-dim" />
          <div className="mt-3 h-16 w-full max-w-sm bg-ivory-dim" />
          <div className="mt-6 h-10 w-48 bg-ivory-dim" />
        </div>
        <div className="animate-pulse border border-line bg-ivory-dim/60 p-6 sm:p-8">
          <div className="h-3 w-24 bg-ivory-dim" />
          <div className="mt-3 h-8 w-32 bg-ivory-dim" />
          <div className="mt-6 h-24 w-full bg-ivory-dim" />
        </div>
      </div>
    </div>
  );
}
