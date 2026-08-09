/**
 * Rewrite WordPress-emitted URLs in rendered HTML to apex-relative paths.
 * The Vercel `rewrites` rule in next.config.ts transparently proxies
 * /wp-content/uploads/* back to the EasyWP host, so visitors only ever see
 * the apex domain.
 */
export function rewriteWordPressUrls(html: string): string {
  if (!html) return html;

  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!wpUrl) return html;

  let wpHost: string;
  try {
    wpHost = new URL(wpUrl).host;
  } catch {
    return html;
  }
  const escaped = wpHost.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let result = html;
  result = result.replace(
    new RegExp(`https?://${escaped}/wp-content/uploads/`, "g"),
    "/wp-content/uploads/"
  );
  result = result.replace(
    new RegExp(`https?://${escaped}/(?!wp-content/uploads/)`, "g"),
    "/"
  );

  // Backward-compat: legacy content may still hardcode the bare apex.
  result = result.replace(
    /https?:\/\/(?:www\.)?radvac\.org\/wp-content\/uploads\//g,
    "/wp-content/uploads/"
  );
  result = result.replace(
    /https?:\/\/(?:www\.)?radvac\.org\/(?!wp-content\/uploads\/)/g,
    "/"
  );

  return result;
}

/**
 * WP body content sometimes carries its own <h1>s, but every page's h1 is the
 * route-level PageHeader — demote embedded h1s to h2 so each page has exactly
 * one h1.
 */
function demoteWpH1s(html: string): string {
  return html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}

/**
 * Process WordPress-sourced HTML before rendering via dangerouslySetInnerHTML.
 * Currently this rewrites WP-host URLs to apex-relative paths and demotes
 * embedded <h1>s — no HTML sanitization is applied. Trust boundary: anyone
 * with WP admin access can inject arbitrary HTML/JS into the public site.
 * Keep admin accounts locked down (strong passwords + 2FA).
 */
export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return "";
  return demoteWpH1s(rewriteWordPressUrls(html));
}
