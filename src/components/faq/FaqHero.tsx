import styles from "./FaqHero.module.css";

export function FaqHero() {
  return (
    <section className={styles.pagehead}>
      <h1 className={styles.h1}>
        Frequently asked <span className={styles.accent}>questions</span>.
      </h1>
    </section>
  );
}
