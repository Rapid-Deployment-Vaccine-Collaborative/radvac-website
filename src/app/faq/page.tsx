import type { Metadata } from "next";
import { faqData } from "@/data/faq";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about RaDVaC: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
};

// TODO: Switch back to WP-driven content once WPGraphQL for ACF is set up.
// Use `getFaqPageContent()` from `@/lib/wordpress/queries` and the mapping
// logic from the previous version of this file.
export default function FaqPage() {
  return (
    <>
      <PageHeader title="Frequently asked questions" />
      {faqData.map((section) => (
        <FaqSection key={section.numeral} section={section} />
      ))}
      <ContactStrip />
    </>
  );
}
