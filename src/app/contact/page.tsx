import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/features/ContactForm";
import { ContactNewsletterSignup } from "@/components/features/ContactNewsletterSignup";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import type { WpPage } from "@/lib/wordpress/types";

function stripCf7(html: string): string {
  return html
    .replace(
      /<h1[^>]*class="wp-block-heading"[^>]*>\s*<strong>\s*Contact us via form:[\s\S]*?<\/h1>/i,
      ""
    )
    .replace(/<div[^>]*\bwpcf7\b[^>]*>[\s\S]*?<\/form>\s*<\/div>/gi, "");
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let page: WpPage | null = null;
  try {
    page = await getPageBySlug("contact");
  } catch {
    // CMS unreachable; fall through to defaults
  }

  if (!page) {
    return { title: "Contact" };
  }

  const ogImage = page.seo?.opengraphImage?.sourceUrl;

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.metaDesc || `${page.title} — Radvac`,
    alternates: page.seo?.canonical ? { canonical: page.seo.canonical } : undefined,
    openGraph: {
      title: page.seo?.opengraphTitle || page.title,
      description: page.seo?.opengraphDescription || page.seo?.metaDesc || "",
      url: "/contact",
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.seo?.twitterTitle || page.seo?.title || page.title,
      description:
        page.seo?.twitterDescription || page.seo?.metaDesc || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ContactPage() {
  let page: WpPage | null = null;
  let fetchError: string | undefined;
  try {
    page = await getPageBySlug("contact");
  } catch (err) {
    console.error("contact: failed to fetch WP content", err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  if (!fetchError && !page) {
    notFound();
  }

  return (
    <>
      <PageHeader title={page?.title ?? "Contact"} />

      <section className="pt-16 px-6">
        <div className="max-w-[800px] mx-auto">
          {fetchError ? (
            <CmsErrorBanner
              error={fetchError}
              endpoint={process.env.WP_GRAPHQL_URL}
            />
          ) : (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeWpHtml(stripCf7(page!.content)),
              }}
            />
          )}

          <h2 className="mt-12 mb-6 text-2xl font-bold text-primary-dark">
            Subscribe for occasional updates
          </h2>
          <ContactNewsletterSignup />

          <h2 className="mt-12 mb-6 text-2xl font-bold text-primary-dark">
            Contact us via form
          </h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
