import type { FaqSectionData } from "@/data/faq";
import { FaqAccordion } from "./FaqAccordion";
import styles from "./FaqSection.module.css";

export function FaqSection({ section }: { section: FaqSectionData }) {
  return (
    <section className={styles.faqSection}>
      <div>
        {section.items.map((item) => (
          <FaqAccordion key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
