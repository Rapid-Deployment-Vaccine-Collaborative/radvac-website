"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { RaDVaCLogo } from "./RaDVaCLogo";

const navItems = [
  { label: "FAQ", href: "/faq" },
  { label: "Publications", href: "/#papers" },
  { label: "Updates", href: "/press-release/" },
  { label: "SARS-CoV-2 Vaccine", href: "/vaccine/" },
  { label: "Network", href: "/researchers-map" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <div className={styles.bg} aria-hidden="true" />
      <header className={styles.mast}>
      <div>
        <h1 className={styles.logo}>
          <Link href="/" aria-label="RaDVaC home">
            <RaDVaCLogo />
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
        <Link href="/support" className={styles.cta}>
          Support
        </Link>
      </nav>
      </header>
    </>
  );
}
