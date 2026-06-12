import { Fragment } from "react";
import type { Metadata } from "next";
import styles from "@/components/yeast/Yeast.module.css";
import { WireIcon } from "@/components/yeast/WireframeIcons";
import YeastVaccine3D from "@/components/yeast/YeastVaccine3D";
import { StudiesTable } from "@/components/yeast/StudiesTable";
import { NewsletterSignup } from "@/components/layout/NewsletterSignup";
import { HumanDataFigure } from "@/components/yeast/HumanDataFigure";
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
        <HumanDataFigure />
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

      {/* ---------- Read more ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>Read more</h2>
        <ul style={{ marginTop: "18px", paddingLeft: "1.4em", lineHeight: 1.9, fontSize: "16px", color: "var(--ink-soft)", listStyleType: "disc" }}>
          <li>
            <a href="https://zenodo.org/records/17968622" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              <strong>"Vaccine Beer: A Personal Healthcare Report"</strong>
            </a>{" "}— Christopher Buck and Andrew Buck
          </li>
          <li>
            <a href="https://zenodo.org/records/17969224" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              <strong>"An Edible Polyomavirus Vaccine"</strong>
            </a>{" "}— Buck et al.
          </li>
          <li>
            <a href="https://moreisdifferent.blog/p/yeast-based-vaccines-are-a-big-deal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              <strong>"Why yeast-based vaccines could be huge for biosecurity"</strong>
            </a>{" "}— Dan Elton
          </li>
          <li>
            <a href="https://cbuck.substack.com/p/vac-beer-is-a-lawful-consumer-product?utm_campaign=post-expanded-share&utm_medium=web&triedRedirect=true" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              <strong>"Vac-Yeast Is a Food"</strong>
            </a>{" "}— Chris Buck
          </li>
        </ul>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={styles.block}>
        <div className={styles.ctaCard}>
          <div>
            <h2>Be part of the first human trials</h2>
            <p>
              Radvac is running a Phase I trial on the BK & JC Polyomavirus yeast vaccine developed in Chris Buck's lab at NIH. Sign up to express interest in the trial and be informed about future trials.
            </p>
          </div>
          <div className={styles.ctaActions}>
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
