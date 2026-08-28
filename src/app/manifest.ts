import type { MetadataRoute } from "next";

/**
 * Minimal manifest — this is a content archive, not an installable app,
 * so this exists only to give "Add to Home Screen" a real icon/name/theme
 * instead of a generic screenshot. No shortcuts, no screenshots, no
 * maskable-purpose variants: nothing here beyond what that needs.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Starhwa Encyclopedia",
    short_name: "Starhwa",
    description:
      "An unofficial fan-maintained archive documenting Park Seonghwa of ATEEZ.",
    start_url: "/",
    display: "browser",
    background_color: "#f5f1e6",
    theme_color: "#5c1f30",
    icons: [
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
