import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { rewriteWordPressUrls } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";

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

  const content = rewriteWordPressUrls(page.content);

  return (
    <>
      <PageHeader title={page.title} />

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto">
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </section>
    </>
  );
}
