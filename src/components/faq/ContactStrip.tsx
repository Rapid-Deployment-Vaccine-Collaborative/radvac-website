import Link from "next/link";
import styles from "./ContactStrip.module.css";

export function ContactStrip() {
  return (
    <section className={styles.contactStrip}>
      <div>
        <h2 className={styles.h2}>
          Open science requires open conversation. Please reach out if you have questions or comments.
        </h2>
      </div>
      <Link className={styles.btn} href="/contact">
        Contact RaDVaC →
      </Link>
    </section>
  );
}
