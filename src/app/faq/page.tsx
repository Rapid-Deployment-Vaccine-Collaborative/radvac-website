import type { Metadata } from "next";
import type { FaqSectionData } from "@/data/faq";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import {
  buildMetadata,
  cmsUnavailableMetadata,
  wpContentMetadata,
} from "@/lib/seo";
import { parseWpsmAccordion } from "@/lib/wordpress/parseWpsmAccordion";
import { JsonLd } from "@/components/JsonLd";

/** Plain-text extraction for JSON-LD payloads (not a sanitizer). */
function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FAQ_FALLBACK = {
  title: "FAQ",
  description:
    "Frequently asked questions about Radvac: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
  path: "/faq",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug("faq");
    if (!page) return buildMetadata(FAQ_FALLBACK);
    return wpContentMetadata(page, {
      path: "/faq",
      fallbackTitle: FAQ_FALLBACK.title,
      fallbackDescription: FAQ_FALLBACK.description,
    });
  } catch {
    return cmsUnavailableMetadata(FAQ_FALLBACK.title);
  }
}

export default async function FaqPage() {
  let sections: FaqSectionData[] = [];
  let fetchError: string | undefined;
  try {
    const page = await getPageBySlug("faq");
    // Parse the raw WP content: parseWpsmAccordion's panel boundaries are
    // HTML comments (`<!-- Inner panel Start -->`) that sanitize-html would
    // strip. Sanitize the extracted answer bodies afterward.
    const rawItems = page?.content ? parseWpsmAccordion(page.content) : [];
    const items = rawItems.map((it) => ({
      ...it,
      answer: sanitizeWpHtml(it.answer),
    }));
    if (items.length > 0) {
      sections = [{ numeral: "I", label: "Frequently Asked Questions", items }];
    }
  } catch (err) {
    console.error("FAQ: failed to fetch WP content", err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  const faqJsonLd =
    sections.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: sections.flatMap((section) =>
            section.items.map((item) => ({
              "@type": "Question",
              name: stripTags(item.question),
              acceptedAnswer: {
                "@type": "Answer",
                text: stripTags(item.answer),
              },
            }))
          ),
        }
      : null;

  return (
    <>
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <PageHeader title="Frequently asked questions" />
      {fetchError || sections.length === 0 ? (
        <CmsErrorBanner
          error={fetchError}
          endpoint={process.env.WP_GRAPHQL_URL}
        />
      ) : (
        sections.map((section) => (
          <FaqSection key={section.numeral} section={section} />
        ))
      )}
      <ContactStrip />
    </>
  );
}
