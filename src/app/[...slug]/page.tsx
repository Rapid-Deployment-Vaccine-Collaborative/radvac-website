import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import type { WpPage } from "@/lib/wordpress/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  let page: WpPage | null = null;
  try {
    page = await getPageBySlug(path);
  } catch {
    return { title: "RaDVaC" };
  }

  if (!page) {
    return { title: "Page Not Found" };
  }

  const ogImage = page.seo?.opengraphImage?.sourceUrl;

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.metaDesc || `${page.title} — RaDVaC`,
    alternates: page.seo?.canonical ? { canonical: page.seo.canonical } : undefined,
    openGraph: {
      title: page.seo?.opengraphTitle || page.title,
      description: page.seo?.opengraphDescription || page.seo?.metaDesc || "",
      url: `/${path}`,
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

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join("/");
  let page: WpPage | null = null;
  let fetchFailed = false;
  try {
    page = await getPageBySlug(path);
  } catch (err) {
    console.error(`[...slug] ${path}: failed to fetch WP content`, err);
    fetchFailed = true;
  }

  if (fetchFailed) {
    return (
      <>
        <PageHeader title="RaDVaC" />
        <CmsErrorBanner />
      </>
    );
  }

  if (!page) {
    notFound();
  }

  const content = sanitizeWpHtml(page.content);

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
