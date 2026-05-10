"use client";

import { useState, useEffect } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
        <button
          type="button"
          className={styles.hamburger}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`${styles.bar} ${open ? styles.bar1Open : ""}`} />
          <span className={`${styles.bar} ${open ? styles.bar2Open : ""}`} />
          <span className={`${styles.bar} ${open ? styles.bar3Open : ""}`} />
        </button>
        <nav
          id="primary-nav"
          className={`${styles.primary} ${open ? styles.primaryOpen : ""}`}
          aria-label="primary"
        >
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
