import { ImageResponse } from "next/og";
import { brandMarkNode } from "@/lib/brandMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon — reuses the exact plum/ivory "星化" mark already
 * established in icon.svg (see src/app/icon.svg), just rendered as a PNG
 * since iOS doesn't accept SVG for home-screen icons.
 */
export default function Icon() {
  return new ImageResponse(brandMarkNode(84), { ...size });
}
