import { ImageResponse } from "next/og";
import { brandMarkNode } from "@/lib/brandMark";

// Custom Route Handlers default to dynamic (on-demand) rendering in the
// App Router; this icon never changes, so it should be generated once at
// build time and served as a static asset like every other icon route.
export const dynamic = "force-static";

/**
 * A single high-resolution icon for manifest.ts. 512×512 is the standard
 * "any purpose" PWA icon size — Android/Chrome scale it down as needed
 * for the home-screen/splash-screen contexts, so one size is sufficient
 * here rather than generating a full multi-size icon set.
 */
export async function GET() {
  return new ImageResponse(brandMarkNode(238), { width: 512, height: 512 });
}
