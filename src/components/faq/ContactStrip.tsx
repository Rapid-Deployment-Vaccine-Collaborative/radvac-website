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
        <p className={styles.p}>
          If your question isn&apos;t answered here, get in touch. Tell us how
          you&apos;d like to help, what skills you bring, and where
          you&apos;re based.
        </p>
      </div>
      <Link className={styles.btn} href="/contact">
        Contact RaDVaC →
      </Link>
    </section>
  );
}
