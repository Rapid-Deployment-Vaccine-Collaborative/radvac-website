import Link from "next/link";
import { papers } from "@/data/papers";
import styles from "./Papers.module.css";

export function Papers() {
  return (
    <section className="section" id="papers">
      <div className="sec-num">
        <strong>White Papers</strong>
      </div>
      <div>
        <p className="section-lede">
          Versioned, peer-reviewed in public. All papers released under CC BY
          4.0 and the Open COVID Pledge.
        </p>
        <div className={styles.papers}>
          {papers.map((paper) => (
            <Link key={paper.href} className={styles.paper} href={paper.href}>
              <span className={styles.t}>
                {paper.title}
                <small>{paper.subtitle}</small>
              </span>
              <span className={styles.d}>{paper.date}</span>
              <span className={`${styles.pdf} ${paper.tag ? styles.tag : ""}`}>
                {paper.tag ?? "Download PDF →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
