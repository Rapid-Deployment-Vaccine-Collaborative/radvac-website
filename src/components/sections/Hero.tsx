import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section className={styles.hero}>
      <figure className={styles.figure} aria-label="RaDVaC overview video">
        <video autoPlay muted loop playsInline>
          <source src="/videos/hero-bg.webm" type="video/webm" />
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
        </video>
      </figure>
    </section>
  );
}
