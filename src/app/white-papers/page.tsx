import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsentPopup } from "@/components/ConsentPopup";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import {
  cmsUnavailableMetadata,
  notFoundMetadata,
  wpContentMetadata,
} from "@/lib/seo";
import type { WpPage } from "@/lib/wordpress/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  let page: WpPage | null = null;
  try {
    page = await getPageBySlug("white-papers");
  } catch {
    return cmsUnavailableMetadata("White Papers");
  }

  if (!page) {
    return notFoundMetadata("White Papers");
  }

  return wpContentMetadata(page, {
    path: "/white-papers",
    fallbackTitle: "White Papers",
    fallbackDescription: "Radvac vaccine white papers and protocol documents.",
  });
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
