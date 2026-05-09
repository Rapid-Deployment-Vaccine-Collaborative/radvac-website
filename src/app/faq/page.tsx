import type { Metadata } from "next";
import { faqData } from "@/data/faq";
import { FaqHero } from "@/components/faq/FaqHero";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactStrip } from "@/components/faq/ContactStrip";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about RaDVaC: what we are, how the vaccines work, why we self-administer, and how to get in touch.",
};

export default function FaqPage() {
  return (
    <>
      <FaqHero />
      {faqData.map((section) => (
        <FaqSection key={section.numeral} section={section} />
      ))}
      <ContactStrip />
    </>
  );
}
