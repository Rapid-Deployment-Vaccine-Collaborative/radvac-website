import type { Metadata } from "next";
import type { FaqSectionData } from "@/data/faq";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { parseWpsmAccordion } from "@/lib/wordpress/parseWpsmAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const fallback = {
    title: "FAQ",
    description:
      "Frequently asked questions about RaDVaC: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
  };
  try {
    const page = await getPageBySlug("faq");
    if (!page) return fallback;
    return {
      title: page.seo?.title || page.title || fallback.title,
      description: page.seo?.metaDesc || fallback.description,
    };
  } catch {
    return fallback;
  }
}

export default async function FaqPage() {
  let sections: FaqSectionData[] = [];
  let fetchFailed = false;
  try {
    const page = await getPageBySlug("faq");
    const html = page?.content ? sanitizeWpHtml(page.content) : "";
    const items = parseWpsmAccordion(html);
    if (items.length > 0) {
      sections = [{ numeral: "I", label: "Frequently Asked Questions", items }];
    }
  } catch (err) {
    console.error("FAQ: failed to fetch WP content", err);
    fetchFailed = true;
  }

  return (
    <>
      <PageHeader title="Frequently asked questions" />
      {fetchFailed || sections.length === 0 ? (
        <CmsErrorBanner />
      ) : (
        sections.map((section) => (
          <FaqSection key={section.numeral} section={section} />
        ))
      )}
      <ContactStrip />
    </>
  );
}
