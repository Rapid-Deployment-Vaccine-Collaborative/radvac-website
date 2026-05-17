import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ContactForm } from "@/components/features/ContactForm";

// Strip the CF7 plugin's form markup (and its preceding heading) out of WP
// content. The React ContactForm below replaces it. Once the CF7 shortcode is
// removed from the WP page, this becomes a no-op and can be deleted.
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
  const page = await getPageBySlug("contact");

  if (!page) {
    return { title: "Contact" };
  }

  const ogImage = page.seo?.opengraphImage?.sourceUrl;

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.metaDesc || `${page.title} — RaDVaC`,
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
  const page = await getPageBySlug("contact");

  if (!page) {
    notFound();
  }

  const content = sanitizeWpHtml(stripCf7(page.content));

  return (
    <>
      <PageHeader title={page.title} />

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <h2 className="mt-12 mb-6 text-2xl font-bold text-primary-dark">
            Contact us via form
          </h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
