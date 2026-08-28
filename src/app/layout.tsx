import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Fraunces, Archivo, IBM_Plex_Mono } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
    <html lang="en" className={`${fraunces.variable} ${archivo.variable} ${plexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `function loadScript(a){var b=document.getElementsByTagName("head")[0],c=document.createElement("script");c.type="text/javascript";c.src="https://tracker.metricool.com/resources/be.js",c.onreadystatechange=a,c.onload=a,b.appendChild(c)}loadScript(function(){beTracker.t({hash:"971463b36c9fabaeb462f895d8cf79aa"})});`,
          }}
        />
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
        <DdeongbyeolSighting />
      </body>
    </html>
  );
}
