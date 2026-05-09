/**
 * Rewrite WordPress internal URLs to Next.js paths.
 * - radvac.org upload URLs → local WordPress instance (for dev) or production uploads
 * - Internal page links → relative paths
 */
export function rewriteWordPressUrls(html: string): string {
  if (!html) return html;

  const wpUrl = process.env.NEXT_PUBLIC_WP_URL || "http://localhost:8890";

  let result = html.replace(
    /https?:\/\/radvac\.org\/wp-content\/uploads\//g,
    `${wpUrl}/wp-content/uploads/`
  );

  result = result.replace(/https?:\/\/radvac\.org\//g, "/");

  return result;
}
