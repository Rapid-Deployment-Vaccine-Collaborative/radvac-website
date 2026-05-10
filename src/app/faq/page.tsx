import type { Metadata } from "next";
import type { FaqSectionData } from "@/data/faq";
import { getFaqPageContent } from "@/lib/wordpress/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about RaDVaC: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default async function FaqPage() {
  const wpSections = await getFaqPageContent();

  let counter = 0;
  const sections: FaqSectionData[] = wpSections.map((section, sectionIndex) => ({
    numeral: ROMAN[sectionIndex] ?? String(sectionIndex + 1),
    label: section.label,
    items: (section.items ?? []).map((item) => {
      counter += 1;
      return {
        id: `q${counter}`,
        num: String(counter).padStart(2, "0"),
        question: item.question,
        answer: item.answer,
        open: item.defaultOpen ?? false,
      };
    }),
  }));

  return (
    <>
      <PageHeader title="Frequently asked questions" />
      {sections.length === 0 ? (
        <section className="section">
          <div />
          <div>
            <p className="section-lede">
              FAQ content is being prepared. Check back soon.
            </p>
          </div>
        </section>
      ) : (
        sections.map((section) => (
          <FaqSection key={section.numeral} section={section} />
        ))
      )}
      <ContactStrip />
    </>
  );
}
