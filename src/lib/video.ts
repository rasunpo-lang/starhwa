import { Source } from "./types";

/**
 * Extracts a YouTube video ID from a URL, or null if the URL isn't a
 * specific-video YouTube link (e.g. a bare channel URL, a non-YouTube
 * source, or an unrecognized format).
 *
 * Deliberately narrow: only youtube.com/watch?v=ID, youtube.com/shorts/ID
 * and youtu.be/ID are recognized (a Short's ID plays in the same
 * /embed/ player as any other video). A channel homepage (youtube.com/@handle) never matches, so
 * only sources that already point at one specific official upload are
 * ever eligible for embedding.
 */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const short = parsed.pathname.match(/^\/shorts\/([\w-]+)\/?$/);
      return short ? short[1] : null;
    }

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1);
      return id || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Finds the first source in an entry's sources array that points at a
 * specific, embeddable official video. Entries author no separate "embed"
 * field — embeddability is derived purely from whether a source URL is a
 * YouTube watch link, so every entry (existing or future) is covered
 * automatically as long as its cited source is a real video, not a channel
 * homepage or non-video page.
 */
export function findEmbeddableVideo(
  sources: Source[]
): { source: Source; videoId: string } | null {
  // A regular watch link always wins over a Short, so adding Shorts support
  // never swaps an entry's existing full-video embed for a Short.
  let short: { source: Source; videoId: string } | null = null;
  for (const source of sources) {
    const videoId = getYouTubeVideoId(source.url);
    if (!videoId) continue;
    if (!source.url.includes("/shorts/")) return { source, videoId };
    short ??= { source, videoId };
  }
  return short;
}
