import styles from "./Donate.module.css";

export function Donate() {
  return (
    <section className={styles.donate} id="donate">
      <div>
        <p className={styles.pull}>
          The next pandemic will not wait for clinical trials. RaDVaC is
          building the open infrastructure to respond in&nbsp;weeks.
        </p>
      </div>
      <a
        className={`btn primary ${styles.cta}`}
        href="https://www.paypal.com/donate?token=NK5-GEEdiIIUaQCrnYrpbxNvJyOnb0ppbCBQt-y0AT7JX0QkQ1W_GpbvJZe_Lz3MjVfYUo4TdAV019C1"
        target="_blank"
        rel="noopener noreferrer"
      >
        Donate
        <small>501(c)(3) tax-deductible</small>
      </a>
    </section>
  );
}
