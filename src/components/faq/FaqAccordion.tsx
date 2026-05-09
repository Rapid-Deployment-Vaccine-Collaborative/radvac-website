import type { FaqItem } from "@/data/faq";
import styles from "./FaqAccordion.module.css";

export function FaqAccordion({ item }: { item: FaqItem }) {
  return (
    <details className={styles.qa} id={item.id} open={item.open}>
      <summary className={styles.summary}>
        <span className={styles.q}>{item.question}</span>
        <span className={styles.toggle}>+</span>
      </summary>
      <div
        className={styles.a}
        dangerouslySetInnerHTML={{ __html: item.answer }}
      />
    </details>
  );
}
