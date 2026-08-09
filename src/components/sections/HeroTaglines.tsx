import styles from "./Hero.module.css";
import { TypedCaption } from "./TypedCaption";

const TOP_TAGLINE = "Pathogens move fast.";
const BOTTOM_TAGLINE = "Science can move faster.";
const TOP_START_MS = 500;
const BOTTOM_START_MS = 3500;
const TYPE_INTERVAL_MS = 45;

/**
 * The homepage h1: both hero taglines, server-rendered so they exist in the
 * initial HTML, overlaid on the globe and typed in as progressive enhancement.
 */
export function HeroTaglines() {
  return (
    <h1 className={styles.taglines}>
      <TypedCaption
        className={`${styles.caption} ${styles.captionTop}`}
        text={TOP_TAGLINE}
        startMs={TOP_START_MS}
        intervalMs={TYPE_INTERVAL_MS}
      />{" "}
      <TypedCaption
        className={`${styles.caption} ${styles.captionBottom}`}
        text={BOTTOM_TAGLINE}
        startMs={BOTTOM_START_MS}
        intervalMs={TYPE_INTERVAL_MS}
      />
    </h1>
  );
}
