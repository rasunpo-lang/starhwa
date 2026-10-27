import { Source } from "./types";

/**
 * Parses a specific X (Twitter) post URL — x.com/<handle>/status/<id>.
 * Profile, search, and non-status links never match, so only sources that
 * already point at one specific post are eligible for embedding.
 */
export function getXPost(url: string): { handle: string; id: string; url: string } | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www|mobile)\./, "");
    if (host !== "x.com" && host !== "twitter.com") return null;
    const m = parsed.pathname.match(/^\/([\w]+)\/status\/(\d+)\/?$/);
    return m ? { handle: m[1], id: m[2], url: `https://x.com/${m[1]}/status/${m[2]}` } : null;
  } catch {
    return null;
  }
}

/**
 * Posts X's own oEmbed endpoint refuses (deleted, protected, or otherwise
 * not embeddable) — checked against publish.twitter.com/oembed. They simply
 * stay as ordinary source links.
 */
const NOT_EMBEDDABLE = new Set<string>(["1437340524944494596"]);

/** First source that is a public, embeddable X post, or null. */
export function findEmbeddableXPost(
  sources: Source[]
): { source: Source; post: { handle: string; id: string; url: string } } | null {
  for (const source of sources) {
    const post = getXPost(source.url);
    if (post && !NOT_EMBEDDABLE.has(post.id)) return { source, post };
  }
  return null;
}
