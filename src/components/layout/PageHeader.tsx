import styles from "./PageHeader.module.css";

type Props = {
  title: string;
  eyebrow?: string;
  lede?: string;
};

export function PageHeader({ title, eyebrow, lede }: Props) {
  return (
    <section className={styles.banner} aria-labelledby="page-title">
      <div className={styles.inner}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 id="page-title" className={styles.title}>
          {title}
        </h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>
    </section>
  );
}
