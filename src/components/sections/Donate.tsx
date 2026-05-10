import Link from "next/link";
import styles from "./Donate.module.css";

export function Donate() {
  return (
    <section className={styles.donate} id="donate">
      <div>
        <p className={styles.pull}>
          Radvac is building the open infrastructure required to respond to biological threats in hours or days, not months or years.
        </p>
      </div>
      <Link className={`btn primary ${styles.cta}`} href="/support">
        Support
        <small>501(c)(3) tax-deductible</small>
      </Link>
    </section>
  );
}
