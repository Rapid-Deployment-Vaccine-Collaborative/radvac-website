import type { Metadata } from "next";
import { faqData, type FaqSectionData } from "@/data/faq";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { rewriteWordPressUrls } from "@/lib/utils";
import { parseWpsmAccordion } from "@/lib/wordpress/parseWpsmAccordion";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("faq");
  const fallback = {
    title: "FAQ",
    description:
      "Frequently asked questions about RaDVaC: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
  };
  if (!page) return fallback;
  return {
    title: page.seo?.title || page.title || fallback.title,
    description: page.seo?.metaDesc || fallback.description,
  };
}

export default async function FaqPage() {
  const page = await getPageBySlug("faq");
  const html = page?.content ? rewriteWordPressUrls(page.content) : "";
  const items = parseWpsmAccordion(html);

  const sections: FaqSectionData[] =
    items.length > 0
      ? [{ numeral: "I", label: "Frequently Asked Questions", items }]
      : faqData;

  return (
    <>
      <PageHeader title="Frequently asked questions" />
      {sections.map((section) => (
        <FaqSection key={section.numeral} section={section} />
      ))}
      <ContactStrip />
    </>
  );
}
