import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsentPopup } from "@/components/ConsentPopup";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import type { WpPage } from "@/lib/wordpress/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let page: WpPage | null = null;
  try {
    page = await getPageBySlug("white-papers");
  } catch {
    // CMS unreachable; fall through to defaults
  }
  const ogImage = page?.seo?.opengraphImage?.sourceUrl;

  return {
    title: page?.seo?.title || page?.title || "White Papers",
    description:
      page?.seo?.metaDesc ||
      "Radvac vaccine white papers and protocol documents.",
    alternates: page?.seo?.canonical
      ? { canonical: page.seo.canonical }
      : undefined,
    openGraph: {
      title: page?.seo?.opengraphTitle || page?.title || "White Papers",
      description:
        page?.seo?.opengraphDescription || page?.seo?.metaDesc || "",
      url: "/white-papers",
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function WhitePapersPage() {
  let page: WpPage | null = null;
  let consent: WpPage | null = null;
  let fetchError: string | undefined;
  try {
    [page, consent] = await Promise.all([
      getPageBySlug("white-papers"),
      getPageBySlug("use-and-consent-popup"),
    ]);
  } catch (err) {
    console.error("white-papers: failed to fetch WP content", err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  if (fetchError) {
    return (
      <>
        <PageHeader title="White Papers" />
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
  const consentHtml = consent ? sanitizeWpHtml(consent.content) : "";
  const consentTitle = consent?.title ?? "Terms of Use and Consent";

  return (
    <>
      {consent && <ConsentPopup title={consentTitle} html={consentHtml} />}

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
