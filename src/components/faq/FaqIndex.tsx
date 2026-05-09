import { faqData } from "@/data/faq";
import styles from "./FaqIndex.module.css";

export function FaqIndex() {
  const items = faqData.flatMap((s) => s.items);
  return (
    <div className={styles.tocWrap}>
      <div className={styles.tocLabel}>§ Index — jump to question</div>
      <nav className={styles.toc} aria-label="FAQ index">
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            <span className={styles.num}>{item.num}</span>
            <span>{item.question}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
