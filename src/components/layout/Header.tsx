"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";
import { RaDVaCLogo } from "./RaDVaCLogo";

const navItems = [
  { label: "FAQ", href: "/faq" },
  { label: "Projects", href: "/projects" },
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
    const C1 = [168, 196, 231]; // #a8c4e7
    const C2 = [244, 248, 253]; // #f4f8fd
    const sample = (p: number) => {
      const t = Math.max(0, Math.min(1, p));
      const r = Math.round(C1[0] + (C2[0] - C1[0]) * t);
      const g = Math.round(C1[1] + (C2[1] - C1[1]) * t);
      const b = Math.round(C1[2] + (C2[2] - C1[2]) * t);
      return `rgb(${r},${g},${b})`;
    };

    let compactNow = false;
    const onScroll = () => {
      const y = window.scrollY;
      if (!compactNow && y > 40) compactNow = true;
      else if (compactNow && y < 10) compactNow = false;
      setCompact(compactNow);

      const isMobile = window.matchMedia("(max-width: 980px)").matches;
      if (isMobile) {
        const headerH = compactNow ? 78 : 180;
        const bodyH = document.body.offsetHeight || 1;
        const root = document.documentElement;
        root.style.setProperty("--hdr-grad-top", sample(y / bodyH));
        root.style.setProperty("--hdr-grad-bot", sample((y + headerH) / bodyH));
      }
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
