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
    return { title: "Radvac" };
  }

  if (!page) {
    return { title: "Page Not Found" };
  }

  const ogImage = page.seo?.opengraphImage?.sourceUrl;

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.metaDesc || `${page.title} — Radvac`,
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
  let fetchError: string | undefined;
  try {
    page = await getPageBySlug(path);
  } catch (err) {
    console.error(`[...slug] ${path}: failed to fetch WP content`, err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  if (fetchError) {
    return (
      <>
        <PageHeader title="Radvac" />
        <CmsErrorBanner
          error={fetchError}
          endpoint={process.env.WP_GRAPHQL_URL}
        />
      </>
    );
  }

  if (!page) {
    notFound();
  }

  const content = sanitizeWpHtml(page.content);

  // Slugs that should render inside the rounded white card used by press releases.
  const WHITE_CARD_SLUGS = new Set(["vaccine", "publications"]);
  const useWhiteCard = WHITE_CARD_SLUGS.has(path);

  if (useWhiteCard) {
    return (
      <>
        <PageHeader title={page.title} />

        <section className="pt-16 px-6 md:px-14">
          <div className="bg-white rounded-2xl shadow-sm py-12 px-6 sm:px-12 md:px-20">
            <div className="max-w-[760px] mx-auto">
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title={page.title} />

      <section className="pt-16 px-6">
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
