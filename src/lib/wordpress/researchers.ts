import type { Researcher } from "@/data/researchers";

/**
 * Fetches approved (published) researchers from the WordPress radvac/v1/researchers endpoint.
 * Cached with Next.js ISR (1 hour) and revalidated on-demand when an admin publishes or edits a signup.
 * Falls back safely to empty array if WP is offline or unreachable.
 */
export async function getApprovedResearchers(): Promise<Researcher[]> {
  const wpGraphqlUrl = process.env.WP_GRAPHQL_URL;
  if (!wpGraphqlUrl) {
    return [];
  }
  const wpBase = wpGraphqlUrl.replace(/\/graphql\/?$/, "");
  try {
    const res = await fetch(`${wpBase}/wp-json/radvac/v1/researchers`, {
      next: {
        revalidate: 3600,
        tags: ["researchers-map"],
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      // If plugin is not yet updated on WP, endpoint returns 404 gracefully
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data;
  } catch (err) {
    console.warn("[researchers] Failed to fetch approved researchers from WordPress:", err);
    return [];
  }
}
