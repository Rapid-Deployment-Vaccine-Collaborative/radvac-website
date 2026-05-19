import type { MetadataRoute } from "next";
import { getAllPages, getAllPosts } from "@/lib/wordpress/queries";
import { team } from "@/lib/team";
import type { WpPage, WpPost } from "@/lib/wordpress/types";

export const dynamic = "force-dynamic";

const HARDCODED_STATIC_PATHS = [
  "",
  "faq",
  "projects",
  "white-papers",
  "press-release",
  "researchers-map",
  "contact",
  "ai-for-antivirals",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://radvac.org";

  let pages: WpPage[] = [];
  let posts: WpPost[] = [];

  try {
    pages = await getAllPages();
  } catch {
    // CMS unreachable — degrade gracefully
  }
  try {
    posts = await getAllPosts(200);
  } catch {
    // CMS unreachable — degrade gracefully
  }

  const allModifiedMs = [...pages, ...posts]
    .map((c) => new Date(c.modified).getTime())
    .filter((n) => Number.isFinite(n));
  const latestModified =
    allModifiedMs.length > 0 ? new Date(Math.max(...allModifiedMs)) : new Date(0);

  const teamSlugs = new Set(team.map((m) => m.slug));
  const hardcodedSet = new Set(HARDCODED_STATIC_PATHS);

  const staticRoutes: MetadataRoute.Sitemap = HARDCODED_STATIC_PATHS.map((p) => ({
    url: p ? `${siteUrl}/${p}` : siteUrl,
    lastModified: latestModified,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.8,
  }));

  const teamRoutes: MetadataRoute.Sitemap = team.map((m) => ({
    url: `${siteUrl}/team/${m.slug}`,
    lastModified: latestModified,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const wpPageRoutes: MetadataRoute.Sitemap = pages
    .filter(
      (p) =>
        p.slug !== "home" &&
        !hardcodedSet.has(p.slug) &&
        !teamSlugs.has(p.slug)
    )
    .map((p) => ({
      url: `${siteUrl}/${p.slug}`,
      lastModified: new Date(p.modified),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${siteUrl}/press-release/${p.slug}`,
    lastModified: new Date(p.modified),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...teamRoutes, ...wpPageRoutes, ...postRoutes];
}
