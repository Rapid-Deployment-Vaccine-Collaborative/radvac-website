import Link from "next/link";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div>
        <h2 className={styles.lede}>
          Rapid, open-source<br />
          <span className={styles.accent}>medical countermeasures</span>
          <br />
          for biosecurity.
        </h2>
        <p className={styles.deck}>
          We design, produce, and self-administer proof-of-principle vaccines in{" "}
          <em>weeks, not years</em> — then publish every protocol, sequence, and
          reagent under permissive open licenses. A 501(c)(3) collaborative of
          independent researchers building the infrastructure to respond to
          outbreaks before institutions can.
        </p>
        <div className={styles.ctas}>
          <Link className="btn primary" href="#papers">
            Read the white papers <span>→</span>
          </Link>
          <Link className="btn ghost" href="/faq">
            Read the FAQ
          </Link>
        </div>
      </div>

      <figure className={styles.figure} aria-label="RaDVaC overview video">
        <video autoPlay muted loop playsInline>
          <source src="/videos/hero-bg.webm" type="video/webm" />
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </figure>
    </section>
  );
}
