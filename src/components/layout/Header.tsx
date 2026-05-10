"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const navItems = [
  { label: "Vaccine", href: "/vaccine/" },
  { label: "White Papers", href: "/#papers" },
  { label: "Updates", href: "/press-release/" },
  { label: "FAQ", href: "/faq" },
  { label: "Researchers Map", href: "/researchers-map" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

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
        {!isHome && <Link href="/">Home</Link>}
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
        <a
          href="https://www.paypal.com/donate?token=NK5-GEEdiIIUaQCrnYrpbxNvJyOnb0ppbCBQt-y0AT7JX0QkQ1W_GpbvJZe_Lz3MjVfYUo4TdAV019C1"
          className={styles.cta}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate
        </a>
      </nav>
    </header>
  );
}
