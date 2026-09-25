import type { MetadataRoute } from "next";
import { getAllEntriesSorted } from "@/data/entries";

const SITE_URL = "https://starhwa.com";

/**
 * Every indexable page, and nothing else — no /_not-found, no /icon.svg
 * (an asset route, not a page), no error routes. Entry `lastModified`
 * uses the entry's own `date` field (the documented event date) since
 * that's the only date this data model tracks; there's no separate
 * content-last-edited timestamp to draw from.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries = getAllEntriesSorted();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/chronology`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/tours`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/stories`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/official`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const entryRoutes: MetadataRoute.Sitemap = entries.map((entry) => ({
    url: `${SITE_URL}/archive/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...entryRoutes];
}
