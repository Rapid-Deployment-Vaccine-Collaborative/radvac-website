"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./Yeast.module.css";

export function HumanDataFigure() {
  const [failed, setFailed] = useState(false);

  return (
    <figure className={styles.figure}>
      {failed ? (
        <div className={styles.figureImgPlaceholder} aria-label="Chart loading — image not yet available" />
      ) : (
        <Image
          src="/images/bkv-human-data.png"
          alt="Chart showing BK Polyomavirus (BKV) serum antibody levels before and after drinking yeast expressing BKV-IV VLPs"
          width={680}
          height={472}
          className={styles.figureImg}
          onError={() => setFailed(true)}
        />
      )}
      <figcaption className={styles.figcaption}>
        BK-Polyomavirus (BKV) serum antibody levels before and after drinking
        yeast expressing BKV-IV VLPs.{" "}
        <a
          href="https://zenodo.org/records/17969224"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.citeLink}
        >
          Soleymani et al., 2025
        </a>
      </figcaption>
    </figure>
  );
}
