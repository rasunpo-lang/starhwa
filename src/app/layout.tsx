import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Atmosphere from "@/components/Atmosphere";
import DdeongbyeolSighting from "@/components/DdeongbyeolSighting";
import { getAllEntriesSorted } from "@/data/entries";
import { buildSearchIndex } from "@/lib/searchIndex";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE_NAME = "The Starhwa Encyclopedia";
const SITE_DESCRIPTION =
  "An unofficial fan-maintained archive documenting Park Seonghwa of ATEEZ, from the 2018 debut onward. Chronology, categorized entries, and links to official sources.";

export const metadata: Metadata = {
  metadataBase: new URL("https://starhwa.com"),
  title: {
    default: `${SITE_NAME} — An Unofficial Archive`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — An Unofficial Archive`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — An Unofficial Archive`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#5c1f30",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const searchIndex = buildSearchIndex(getAllEntriesSorted());

  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}
      // The Moonlit Archive's pre-paint script (below) sets --night/
      // --night-text on this element before React hydrates, which is
      // expected — but React's hydration check still flags the resulting
      // attribute mismatch as an error. Scoped to just this element, not
      // a blanket suppression; same pattern any theme-flash-prevention
      // script needs.
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript";c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"971463b36c9fabaeb462f895d8cf79aa"})});`,
          }}
        />
        {/* ✦ The Moonlit Archive — sets --night/--night-text/--moon-illum/
            --moon-dir before first paint so a page load starts at the
            correct atmosphere and lunar phase instead of popping in
            after mount. Mirrors the math in src/lib/atmosphere.ts
            (getNightAmount/getNightTextAmount/getMoonPhase) — duplicated
            here in plain JS because an inline pre-hydration script can't
            import a module. Keep these in sync if that file changes.
            Uses next/script's beforeInteractive strategy (not a raw
            <script> tag) — that's Next's own supported mechanism for
            pre-hydration inline scripts, and unlike a raw tag it doesn't
            trigger a hydration-mismatch warning for mutating <html>
            ahead of React's hydration pass. */}
        <Script id="atmosphere-preset" strategy="beforeInteractive" suppressHydrationWarning>
          {`(function(){var d=new Date();var h=d.getHours()+d.getMinutes()/60;var c=[[0,1],[5,1],[7,0],[17,0],[19.5,1],[24,1]];var n=1;for(var i=0;i<c.length-1;i++){var h0=c[i][0],a0=c[i][1],h1=c[i+1][0],a1=c[i+1][1];if(h>=h0&&h<=h1){var t=h1===h0?0:(h-h0)/(h1-h0);n=a0+(a1-a0)*t;break;}}var nt=Math.min(1,Math.max(0,(n-0.48)/0.14));var KNM=Date.UTC(2000,0,6,18,14,0);var SYN=29.530588853;var age=(d.getTime()-KNM)/86400000;var cp=(((age%SYN)+SYN)%SYN)/SYN;var th=cp*2*Math.PI;var illum=(1-Math.cos(th))/2;var waxing=cp<0.5;var s=document.documentElement.style;s.setProperty("--night",String(n));s.setProperty("--night-text",String(nt));s.setProperty("--moon-illum",String(illum));s.setProperty("--moon-dir",waxing?"-1":"1");})();`}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col bg-ivory text-ink font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-5 focus:top-5 focus:z-50 focus:border focus:border-ink focus:bg-ivory focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:uppercase focus:text-hairline"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <Header searchIndex={searchIndex} />
        </Suspense>
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <Atmosphere />
        <DdeongbyeolSighting />
      </body>
    </html>
  );
}
