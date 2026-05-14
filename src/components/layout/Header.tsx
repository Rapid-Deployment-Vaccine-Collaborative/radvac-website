"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { RaDVaCLogo } from "./RaDVaCLogo";

const navItems = [
  { label: "FAQ", href: "/faq" },
  { label: "Publications", href: "/publications" },
  { label: "Updates", href: "/press-release/" },
  { label: "Network", href: "/researchers-map" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setCompact(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div
        className={`${styles.bg} ${compact ? styles.bgCompact : ""}`}
        aria-hidden="true"
      />
      <header
        className={`${styles.mast} ${compact ? styles.mastCompact : ""}`}
      >
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
