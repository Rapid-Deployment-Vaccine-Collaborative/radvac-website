import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { getAllPages, getAllPosts } from "@/lib/wordpress/queries";
import { team } from "@/lib/team";
import type { WpPage, WpPost } from "@/lib/wordpress/types";

export const dynamic = "force-dynamic";

// Discover top-level hardcoded Next.js routes by scanning src/app for directories
// that contain a page.tsx. This way a new static page is picked up automatically
// without anyone having to remember to edit this file. Dynamic segments ([slug],
// [...slug]), route groups ((group)), private folders (_x) and api are excluded.
// Note: src/app/**/page.tsx must be traced into this function's bundle in
// production — see outputFileTracingIncludes in next.config.ts.
function getStaticRouteSlugs(): string[] {
  const appDir = path.join(process.cwd(), "src", "app");
  try {
    return fs
      .readdirSync(appDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .filter(
        (name) =>
          !name.startsWith("[") &&
          !name.startsWith("(") &&
          !name.startsWith("_") &&
          name !== "api"
      )
      .filter((name) => fs.existsSync(path.join(appDir, name, "page.tsx")));
  } catch {
    // Filesystem unreadable — degrade gracefully
    return [];
  }
}

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

  // "" is the home route (src/app/page.tsx, not a subdirectory) so add it explicitly.
  const staticPaths = ["", ...getStaticRouteSlugs()];

  const teamSlugs = new Set(team.map((m) => m.slug));
  const hardcodedSet = new Set(staticPaths);

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((p) => ({
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
