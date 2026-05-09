import Link from "next/link";
import styles from "./Donate.module.css";

export function Donate() {
  return (
    <section className={styles.donate} id="donate">
      <div>
        <p className={styles.pull}>
          &ldquo;The next pandemic will not wait for clinical trials. RaDVaC is
          building the open infrastructure to respond in&nbsp;weeks.&rdquo;
        </p>
        <p className={styles.attr}>— RaDVaC Collaborative, 2024</p>
      </div>
      <Link className={`btn primary ${styles.cta}`} href="/donate">
        Donate
        <small>501(c)(3) tax-deductible</small>
      </Link>
    </section>
  );
}
