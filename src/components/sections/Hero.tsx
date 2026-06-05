import SpreadGlobe from "./SpreadGlobe";
import styles from "./Hero.module.css";

const FALLBACK_VIDEO_SRC = "/wp-content/uploads/2026/05/science-faster.webm";

export function Hero() {
  return (
    <section className={styles.hero}>
      <figure
        className={styles.figure}
        aria-label="Animated globe showing a pathogen spreading worldwide, then countermeasures deploying"
      >
        <SpreadGlobe />
        <noscript>
          <video
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
            }}
          >
            <source src={FALLBACK_VIDEO_SRC} type="video/webm" />
          </video>
        </noscript>
      </figure>
    </section>
  );
}
