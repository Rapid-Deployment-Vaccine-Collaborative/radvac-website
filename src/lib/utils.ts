import sanitizeHtml from "sanitize-html";

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
    /https?:\/\/radvac\.org\/wp-content\/uploads\//g,
    "/wp-content/uploads/"
  );
  result = result.replace(
    /https?:\/\/radvac\.org\/(?!wp-content\/uploads\/)/g,
    "/"
  );

  return result;
}

// Permissive allowlist for WP-authored content. Keeps layout/inline tags,
// media, tables, forms, and trusted iframes; strips scripts and inline
// event handlers. `xmp` is explicitly disallowed to mitigate
// GHSA-rpr9-rxv7-x643 (sanitize-html ≤2.17.3 / unpatched at 2.17.4).
const WP_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "figure",
    "figcaption",
    "video",
    "audio",
    "source",
    "track",
    "picture",
    "iframe",
    "form",
    "input",
    "button",
    "label",
    "select",
    "option",
    "textarea",
    "section",
    "article",
    "header",
    "footer",
    "aside",
    "nav",
    "details",
    "summary",
    "svg",
    "path",
    "g",
    "circle",
    "rect",
  ]),
  disallowedTagsMode: "discard",
  // Belt-and-braces: even if the parser ever lets <xmp> through, drop it.
  nonTextTags: ["style", "script", "textarea", "option", "noscript", "xmp"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class", "id", "style", "lang", "dir", "title", "role", "aria-*", "data-*"],
    a: ["href", "name", "target", "rel", "class", "id", "style", "title"],
    img: [
      "src", "srcset", "sizes", "alt", "width", "height",
      "class", "id", "style", "loading", "decoding",
    ],
    video: [
      "src", "controls", "autoplay", "loop", "muted", "playsinline",
      "poster", "preload", "width", "height", "class", "id", "style",
    ],
    audio: ["src", "controls", "autoplay", "loop", "muted", "preload"],
    source: ["src", "srcset", "type", "media", "sizes"],
    track: ["src", "kind", "srclang", "label", "default"],
    iframe: [
      "src", "width", "height", "frameborder", "allow", "allowfullscreen",
      "title", "style", "class", "id", "loading", "referrerpolicy",
    ],
    form: ["action", "method", "class", "id", "enctype", "target"],
    input: [
      "type", "name", "value", "placeholder", "required", "checked",
      "min", "max", "step", "pattern", "class", "id",
    ],
    button: ["type", "class", "id", "name", "value"],
    label: ["for", "class"],
    select: ["name", "class", "id", "required"],
    option: ["value", "selected"],
    textarea: ["name", "rows", "cols", "placeholder", "required", "class", "id"],
    svg: ["xmlns", "viewBox", "width", "height", "fill", "stroke", "class"],
    path: ["d", "fill", "stroke", "stroke-width"],
    g: ["fill", "stroke", "transform"],
    circle: ["cx", "cy", "r", "fill", "stroke"],
    rect: ["x", "y", "width", "height", "fill", "stroke", "rx", "ry"],
    th: ["scope", "colspan", "rowspan", "class"],
    td: ["colspan", "rowspan", "class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowedIframeHostnames: [
    "www.youtube.com",
    "youtube.com",
    "youtube-nocookie.com",
    "www.youtube-nocookie.com",
    "player.vimeo.com",
    "www.google.com",
    "docs.google.com",
    "radvac.us17.list-manage.com",
  ],
  // sanitize-html strips event handlers (on*) by default; this keeps that
  // behavior explicit by not listing any in allowedAttributes.
};

/**
 * Sanitize WordPress-sourced HTML and rewrite WP URLs to apex-relative paths.
 * Use this for any string that originated in WP (post content, block HTML,
 * captions, menu HTML, etc.) before passing to dangerouslySetInnerHTML.
 */
export function sanitizeWpHtml(html: string | null | undefined): string {
  if (!html) return "";
  return rewriteWordPressUrls(sanitizeHtml(html, WP_SANITIZE_OPTIONS));
}
