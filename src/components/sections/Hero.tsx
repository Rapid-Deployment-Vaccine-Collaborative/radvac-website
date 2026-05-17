"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    const tryPlay = () => {
      const p = v.play();
      if (p && typeof p.catch === "function") {
        p.catch(() => {
          // Some browsers require a user gesture; retry on first interaction.
          const resume = () => {
            v.play().catch(() => {});
            window.removeEventListener("touchstart", resume);
            window.removeEventListener("click", resume);
          };
          window.addEventListener("touchstart", resume, { once: true });
          window.addEventListener("click", resume, { once: true });
        });
      }
    };
    tryPlay();
  }, []);

  return (
    <section className={styles.hero}>
      <figure className={styles.figure} aria-label="RaDVaC overview video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="/wp-content/uploads/2026/05/biosecurity-faster.webm" type="video/webm" />
        </video>
      </figure>
    </section>
  );
}
