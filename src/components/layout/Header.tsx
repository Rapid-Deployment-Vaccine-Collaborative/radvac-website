import Link from "next/link";
import styles from "./Header.module.css";

const navItems = [
  { label: "Mission", href: "/#mission" },
  { label: "Projects", href: "/#projects" },
  { label: "Vaccine", href: "/vaccine/" },
  { label: "White Papers", href: "/#papers" },
  { label: "Updates", href: "/press-release/" },
  { label: "FAQ", href: "/faq" },
  { label: "Researchers Map", href: "/researchers-map" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className={styles.mast}>
      <div>
        <h1 className={styles.logo}>
          <Link href="/" aria-label="RaDVaC home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/radvac-logo.png" alt="RaDVaC" />
          </Link>
        </h1>
      </div>
      <nav className={styles.primary} aria-label="primary">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <Link href="/#donate" className={styles.cta}>
          Donate
        </Link>
      </nav>
    </header>
  );
}
