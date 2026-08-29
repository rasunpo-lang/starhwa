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
        {/* ✦ The Moonlit Archive — sets --night/--night-text/--golden/
            --moon-illum/--moon-dir before first paint so a page load
            starts at the correct atmosphere, golden-hour warmth, and
            lunar phase instead of popping in after mount. Mirrors the
            math in src/lib/atmosphere.ts (getSunTimes/getNightAmount/
            getNightTextAmount/getGoldenAmount/getMoonPhase) — duplicated
            here in plain JS because an inline pre-hydration script can't
            import a module. Keep these in sync if that file changes.
            Uses next/script's beforeInteractive strategy (not a raw
            <script> tag) — that's Next's own supported mechanism for
            pre-hydration inline scripts, and unlike a raw tag it doesn't
            trigger a hydration-mismatch warning for mutating <html>
            ahead of React's hydration pass. */}
        <Script id="atmosphere-preset" strategy="beforeInteractive" suppressHydrationWarning>
          {`(function(){var d=new Date();var h=d.getHours()+d.getMinutes()/60;var TZLAT={"America/Los_Angeles":34,"America/Denver":39.7,"America/Chicago":41.9,"America/New_York":40.7,"America/Toronto":43.7,"America/Vancouver":49.3,"America/Mexico_City":19.4,"America/Sao_Paulo":-23.5,"America/Argentina/Buenos_Aires":-34.6,"Europe/London":51.5,"Europe/Dublin":53.3,"Europe/Paris":48.9,"Europe/Berlin":52.5,"Europe/Madrid":40.4,"Europe/Rome":41.9,"Europe/Amsterdam":52.4,"Europe/Moscow":55.8,"Europe/Istanbul":41,"Asia/Seoul":37.6,"Asia/Tokyo":35.7,"Asia/Shanghai":31.2,"Asia/Hong_Kong":22.3,"Asia/Taipei":25,"Asia/Singapore":1.35,"Asia/Manila":14.6,"Asia/Bangkok":13.8,"Asia/Jakarta":-6.2,"Asia/Kolkata":28.6,"Asia/Dubai":25.3,"Australia/Sydney":-33.9,"Australia/Melbourne":-37.8,"Australia/Perth":-31.9,"Pacific/Auckland":-36.8,"Africa/Cairo":30,"Africa/Johannesburg":-26.2,"Africa/Lagos":6.5};var lat=35;try{var tz=Intl.DateTimeFormat().resolvedOptions().timeZone;if(tz&&TZLAT.hasOwnProperty(tz))lat=TZLAT[tz];}catch(e){}var latR=lat*Math.PI/180;var yStart=new Date(d.getFullYear(),0,0);var doy=Math.floor((d.getTime()-yStart.getTime())/86400000);var declR=(23.44*Math.PI/180)*Math.sin((2*Math.PI/365)*(doy-81));var cosH=Math.min(1,Math.max(-1,-Math.tan(latR)*Math.tan(declR)));var haHrs=Math.acos(cosH)*180/Math.PI/15;var sunrise=12-haHrs;var sunset=12+haHrs;var dawnStart=Math.max(0.01,sunrise-0.75);var dawnEnd=Math.min(23.99,sunrise+1.25);var duskStart=Math.max(dawnEnd+0.01,sunset-1.5);var duskEnd=Math.min(23.99,sunset+1);var c=[[0,1],[dawnStart,1],[dawnEnd,0],[duskStart,0],[duskEnd,1],[24,1]];var n=1;for(var i=0;i<c.length-1;i++){var h0=c[i][0],a0=c[i][1],h1=c[i+1][0],a1=c[i+1][1];if(h>=h0&&h<=h1){var t=h1===h0?0:(h-h0)/(h1-h0);n=a0+(a1-a0)*t;break;}}var nt=Math.min(1,Math.max(0,(n-0.48)/0.14));function bump(hh,ctr,hw){return Math.max(0,1-Math.abs(hh-ctr)/hw);}var golden=Math.max(bump(h,sunset-0.4,1),bump(h,sunrise+0.3,1));var KNM=Date.UTC(2000,0,6,18,14,0);var SYN=29.530588853;var age=(d.getTime()-KNM)/86400000;var cp=(((age%SYN)+SYN)%SYN)/SYN;var th=cp*2*Math.PI;var illum=(1-Math.cos(th))/2;var waxing=cp<0.5;var s=document.documentElement.style;s.setProperty("--night",String(n));s.setProperty("--night-text",String(nt));s.setProperty("--golden",String(golden));s.setProperty("--moon-illum",String(illum));s.setProperty("--moon-dir",waxing?"-1":"1");})();`}
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
