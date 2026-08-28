import { Source } from "./types";

/**
 * Extracts a YouTube video ID from a URL, or null if the URL isn't a
 * specific-video YouTube link (e.g. a bare channel URL, a non-YouTube
 * source, or an unrecognized format).
 *
 * Deliberately narrow: only youtube.com/watch?v=ID and youtu.be/ID are
 * recognized. A channel homepage (youtube.com/@handle) never matches, so
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
      return null;
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
  for (const source of sources) {
    const videoId = getYouTubeVideoId(source.url);
    if (videoId) return { source, videoId };
  }
  return null;
}
