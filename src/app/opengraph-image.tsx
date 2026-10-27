import { ImageResponse } from "next/og";

export const alt =
  "The Starhwa Encyclopedia — Park Seonghwa · ATEEZ · 2018—";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Sitewide fallback social-preview image. Used for any page that doesn't
 * set its own openGraph.images (i.e. every entry without a curated
 * `image`, which is the vast majority — see content/README.md "Image
 * selection"). Deliberately typographic/brand-mark only, matching the
 * archive's own no-image fallback philosophy rather than fabricating a
 * photo-style image with no real source.
 *
 * Plain text in flex divs only — no inline <svg><text> (Satori, the
 * renderer behind ImageResponse, doesn't support SVG text nodes; this is
 * why the mark below is a plain div, not the ellipse-ring <svg> version
 * used in the site header). CJK renders fine through Satori's default
 * font resolution (confirmed via apple-icon.tsx), so the mark reuses the
 * real "星化" glyph from icon.svg rather than a text-free substitute.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f1e6",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            backgroundColor: "#5c1f30",
            fontSize: 28,
            color: "#f5f1e6",
          }}
        >
          星化
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#5c1f30",
          }}
        >
          Park Seonghwa · ATEEZ · 2018—
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 66,
            fontWeight: 700,
            color: "#15130f",
            textAlign: "center",
          }}
        >
          The Starhwa Encyclopedia
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 24,
            color: "#3a352c",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          An unofficial fan-maintained archive of Park Seonghwa of ATEEZ
        </div>
      </div>
    ),
    { ...size }
  );
}
