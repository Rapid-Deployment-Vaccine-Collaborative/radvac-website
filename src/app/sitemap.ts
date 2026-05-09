import type { MetadataRoute } from "next";
import { getAllPages } from "@/lib/wordpress/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://radvac.org";

  // Static pages that always exist
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Dynamic pages from WordPress
  try {
    const pages = await getAllPages();
    const dynamicRoutes: MetadataRoute.Sitemap = pages
      .filter((page) => page.slug !== "home")
      .map((page) => ({
        url: `${siteUrl}/${page.slug}`,
        lastModified: new Date(page.modified),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    // If WordPress is unavailable, return static routes only
    return staticRoutes;
  }
}
