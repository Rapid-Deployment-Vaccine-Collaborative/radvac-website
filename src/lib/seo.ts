import type { Metadata } from "next";
import type { WpPage, WpPost } from "@/lib/wordpress/types";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://radvac.org";
export const SITE_NAME = "Radvac";

/** Site-wide fallback social image (square logo, declared in layout.tsx). */
export const DEFAULT_OG_IMAGE = {
  url: "/images/radvac-logo-darkblue-for-social-media-preview.png",
  width: 1200,
  height: 1200,
  alt: "Radvac — Rapid Deployment Vaccine Collaborative",
};

/**
 * Yoast emits canonicals pointing at the WP origin (the EasyWP host) or the
 * legacy apex/www domain. Rewrite those to site-relative paths so
 * `metadataBase` resolves them against the public site. Cross-domain
 * canonicals to unrelated hosts are preserved as-is.
 */
export function normalizeCanonical(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }

  const ownHosts = new Set(["radvac.org", "www.radvac.org"]);
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (wpUrl) {
    try {
      ownHosts.add(new URL(wpUrl).host);
    } catch {
      // ignore malformed env value
    }
  }
  try {
    ownHosts.add(new URL(SITE_URL).host);
  } catch {
    // ignore malformed env value
  }

  if (!ownHosts.has(parsed.host)) return url;
  const path = parsed.pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function ensureLeadingSlash(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

interface BuildMetadataOptions {
  /** Page title (run through the layout's "%s | Radvac" template). */
  title: string;
  description: string;
  /** Site-relative path, e.g. "/faq". Used for canonical + og:url. */
  path: string;
  /** Page-specific social image; enables twitter summary_large_image. */
  ogImage?: { url: string; width?: number; height?: number; alt?: string };
  ogType?: "website" | "article" | "profile";
}

/** Metadata for hardcoded (non-WordPress) pages. */
export function buildMetadata(opts: BuildMetadataOptions): Metadata {
  const path = ensureLeadingSlash(opts.path);
  const image = opts.ogImage ?? DEFAULT_OG_IMAGE;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: path,
      type: opts.ogType ?? "website",
      images: [image],
    },
    twitter: {
      card: opts.ogImage ? "summary_large_image" : "summary",
      title: opts.title,
      description: opts.description,
      images: [image.url],
    },
  };
}

interface WpContentMetadataOptions {
  /** Site-relative path of the route rendering this content. */
  path: string;
  /** Title used when Yoast doesn't supply one; defaults to node.title. */
  fallbackTitle?: string;
  fallbackDescription?: string;
  ogType?: "website" | "article";
  /** Article extras (press releases). */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
  };
}

/**
 * Metadata for WordPress-backed routes: merges Yoast SEO fields with
 * sensible fallbacks, normalizes canonicals off the WP origin host, and
 * maps Yoast robots settings. Yoast titles already include site branding,
 * so they bypass the layout title template via `absolute`.
 */
export function wpContentMetadata(
  node: WpPage | WpPost,
  opts: WpContentMetadataOptions
): Metadata {
  const seo = node.seo;
  const path = ensureLeadingSlash(opts.path);
  const fallbackTitle = opts.fallbackTitle ?? node.title;
  const description =
    seo?.metaDesc || opts.fallbackDescription || `${node.title} — Radvac`;
  const specificImage =
    seo?.opengraphImage?.sourceUrl ?? node.featuredImage?.node.sourceUrl;
  const ogImages = specificImage ? [specificImage] : [DEFAULT_OG_IMAGE];
  const twitterImages = specificImage ? [specificImage] : [DEFAULT_OG_IMAGE.url];
  const ogType = opts.ogType ?? "website";

  return {
    title: seo?.title ? { absolute: seo.title } : fallbackTitle,
    description,
    alternates: {
      canonical: seo?.canonical ? normalizeCanonical(seo.canonical) : path,
    },
    robots: seo
      ? {
          index: seo.metaRobotsNoindex !== "noindex",
          follow: seo.metaRobotsNofollow !== "nofollow",
        }
      : undefined,
    openGraph: {
      title: seo?.opengraphTitle || seo?.title || fallbackTitle,
      description: seo?.opengraphDescription || description,
      url: path,
      type: ogType,
      images: ogImages,
      ...(ogType === "article" && opts.article
        ? {
            publishedTime: opts.article.publishedTime,
            modifiedTime: opts.article.modifiedTime,
            authors: opts.article.authors,
          }
        : {}),
    },
    twitter: {
      card: specificImage ? "summary_large_image" : "summary",
      title: seo?.twitterTitle || seo?.title || fallbackTitle,
      description: seo?.twitterDescription || description,
      images: twitterImages,
    },
  };
}

/**
 * Metadata for a route rendering a CMS-unavailable error banner (HTTP 200):
 * noindex so transient outage pages never enter the index.
 */
export function cmsUnavailableMetadata(title: string): Metadata {
  return { title, robots: { index: false, follow: false } };
}

/** Metadata for not-found fallthroughs (notFound() already 404s the page). */
export function notFoundMetadata(title: string): Metadata {
  return { title, robots: { index: false } };
}
