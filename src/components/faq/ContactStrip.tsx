import Link from "next/link";
import styles from "./ContactStrip.module.css";

export function ContactStrip() {
  return (
    <section className={styles.contactStrip}>
      <div>
        <div className={styles.eye}>§ Still have questions?</div>
        <h2 className={styles.h2}>
          &ldquo;Open science requires open conversation. Reach out — we read
          everything.&rdquo;
        </h2>
      </div>
      <Link className={styles.btn} href="/contact">
        Contact RaDVaC →
      </Link>
    </section>
  );
}
