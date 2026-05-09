import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span>© 2026 RaDVaC · 501(c)(3) · Cambridge, MA</span>
      <span>CC BY 4.0 · Open COVID Pledge</span>
      <span>Contact · Subscribe · Twitter · YouTube</span>
    </footer>
  );
}
