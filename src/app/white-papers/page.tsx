import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { rewriteWordPressUrls } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConsentPopup } from "@/components/ConsentPopup";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("white-papers");
  const ogImage = page?.seo?.opengraphImage?.sourceUrl;

  return {
    title: page?.seo?.title || page?.title || "White Papers",
    description:
      page?.seo?.metaDesc ||
      "RaDVaC vaccine white papers and protocol documents.",
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
  const [page, consent] = await Promise.all([
    getPageBySlug("white-papers"),
    getPageBySlug("use-and-consent-popup"),
  ]);

  if (!page) {
    notFound();
  }

  const content = rewriteWordPressUrls(page.content);
  const consentHtml = consent ? rewriteWordPressUrls(consent.content) : "";
  const consentTitle = consent?.title ?? "Terms of Use and Consent";

  return (
    <>
      {consent && <ConsentPopup title={consentTitle} html={consentHtml} />}

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
