import Image from "next/image";
import lightstick from "../../public/brand/crews-secret-lightstick.webp";
import Glint from "./Glint";

/**
 * The quiet entrance to The Crew's Secret, a separate multiplayer game that
 * lives outside this archive: a small studio render of the Cromer light stick
 * (see DESIGN.md §21) beside a mono label. The destination comes from
 * NEXT_PUBLIC_CREWS_SECRET_URL — until that is set it renders nothing in
 * production, and a dimmed, non-interactive placeholder in development so the
 * spot can be reviewed. The render is decorative: the visible label is its
 * text alternative, so `alt=""` is correct (DESIGN.md §5).
 */
export default function CrewHourglass() {
  const url = process.env.NEXT_PUBLIC_CREWS_SECRET_URL;
  const isDev = process.env.NODE_ENV !== "production";

  const content = (
    <>
      <Image
        src={lightstick}
        alt=""
        width={40}
        height={60}
        sizes="40px"
        className="crew-lightstick"
      />
      <span>The Crew&rsquo;s Secret</span>
    </>
  );

  if (!url) {
    if (!isDev) return null;
    return (
      <p className="crew-link crew-link--idle meta mt-6 text-charcoal/60">
        {content}
      </p>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="crew-link glint-hover meta relative mt-6 text-charcoal/75 hover:text-plum"
    >
      {content}
      <Glint className="left-[34px] top-1" />
      <span className="sr-only"> (a separate game, opens in a new tab)</span>
    </a>
  );
}
