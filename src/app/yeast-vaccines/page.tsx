import { Fragment } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import styles from "@/components/yeast/Yeast.module.css";
import { WireIcon } from "@/components/yeast/WireframeIcons";
import YeastVaccine3D from "@/components/yeast/YeastVaccine3D";
import { StudiesTable } from "@/components/yeast/StudiesTable";
import { NewsletterSignup } from "@/components/layout/NewsletterSignup";
import {
  BENEFITS,
  DISCORD_URL,
  FLOW_STEPS,
} from "@/components/yeast/yeastData";

export const metadata: Metadata = {
  title: "Yeast Vaccines",
  description:
    "Genetically-modified yeast turn a tube on your counter into a vaccine factory. Drink it, and the yeast releases intact viral shells in your gut — triggering mucosal immunity. Join the yeast vaccine revolution.",
};

export default function YeastVaccinesPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={styles.aHero}>
        <div className={styles.aHeroInner}>
          <div>
            <h1 className={styles.aTitle}>Join the Yeast&nbsp;Vaccine Revolution</h1>
            <p className={styles.aLede}>
              Genetically-modified yeast can turn a tube on your counter
              into a vaccine factory. No lab, no cold chain, no needles required. 
            </p>
          </div>
          <div className={styles.aHeroArt}>
            <YeastVaccine3D kind="tube" size={260} />
          </div>
        </div>
      </header>

      {/* ---------- How it works ---------- */}
      <section className={styles.block} id="how">
        <h2 className={styles.h2}>How yeast vaccines work</h2>
        <div className={styles.flow}>
          {FLOW_STEPS.map((step, i) => (
            <Fragment key={step.num}>
              <div className={styles.step}>
                <div className={styles.stepIconWrap}>
                  <WireIcon kind={step.icon} size={56} />
                </div>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div className={styles.arrow} aria-hidden="true">
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ---------- Proven in animals ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>Proven in animals</h2>
        <p className={`${styles.lede} ${styles.ledeFull}`}>
          Across more than 30 published studies, oral yeast vaccines have
          raised both systemic (IgG) and mucosal (secretory IgA) antibody
          responses against viruses in mice, chickens, and pigs.
        </p>
        <StudiesTable />
      </section>

      {/* ---------- First Human Data ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>First Human Data</h2>
        <figure className={styles.figure}>
          <Image
            src="/images/bkv-human-data.png"
            alt="Chart showing BKV-neutralizing serum antibody responses before and after drinking yeast expressing BKV-IV VLPs"
            width={800}
            height={500}
            className={styles.figureImg}
          />
          <figcaption className={styles.figcaption}>
            BKV-neutralizing serum antibody responses before and after drinking
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
      </section>

      {/* ---------- Why yeast ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>Benefits</h2>
        <div className={styles.benefits}>
          {BENEFITS.map((b) => (
            <div className={styles.benefit} key={b.title}>
              <h3>
                <span className={styles.check} aria-hidden="true">
                  ✓
                </span>
                {b.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.block}>
        <div className={styles.ctaCard}>
          <div>
            <h2>Be part of the first human trials</h2>
            <p>
              Radvac is running a Phase I trial on the BK & JC Polyomavirus yeast vaccine. Sign up to express interest in the trial and be informed about future trials.
            </p>
            <a
              className={styles.btnPrimary}
              href="https://docs.google.com/forms/d/e/1FAIpQLSek_cJ835TiuuZWwGzjiV7TckLF_6pXj4aMmN5Bt8GR9DTggg/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
            >
              Express interest
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
