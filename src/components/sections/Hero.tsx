"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Hero.module.css";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

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

  if (failed) return null;

  return (
    <section className={styles.hero}>
      <figure className={styles.figure} aria-label="RaDVaC overview video">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        >
          <source
            src="/wp-content/uploads/2026/05/science-faster.webm"
            type="video/webm"
            onError={() => setFailed(true)}
          />
        </video>
      </figure>
    </section>
  );
}
