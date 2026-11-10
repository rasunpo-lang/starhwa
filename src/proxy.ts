import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Gate for the private maintenance page (src/app/maintenance). HTTP Basic
 * Auth against MAINTENANCE_PASSWORD — any username is accepted, only the
 * password is checked. Unset password → 404 (fails closed, as if the route
 * didn't exist). Nothing else on the site runs through this file.
 */

async function digest(value: string): Promise<Uint8Array> {
  const bytes = new TextEncoder().encode(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
}

async function passwordMatches(given: string, expected: string) {
  // Compare fixed-length digests so timing doesn't depend on the input.
  const [a, b] = await Promise.all([digest(given), digest(expected)]);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function proxy(request: NextRequest) {
  const expected = process.env.MAINTENANCE_PASSWORD;
  if (!expected) return new NextResponse(null, { status: 404 });

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const given = decoded.slice(decoded.indexOf(":") + 1);
      if (await passwordMatches(given, expected)) {
        const response = NextResponse.next();
        response.headers.set("Cache-Control", "private, no-store");
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
        return response;
      }
    } catch {
      // malformed header — fall through to the challenge
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="STARHWA maintenance", charset="UTF-8"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export const config = {
  matcher: ["/maintenance", "/maintenance/:path*"],
};
