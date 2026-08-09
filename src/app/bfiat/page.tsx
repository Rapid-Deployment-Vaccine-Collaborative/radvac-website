import { Fragment } from "react";
import type { Metadata } from "next";
import styles from "@/components/yeast/Yeast.module.css";
import { WireIcon } from "@/components/yeast/WireframeIcons";
import YeastBFIAT3D from "@/components/yeast/YeastBFIAT3D";
import { StudiesTable } from "@/components/yeast/StudiesTable";
import { NewsletterSignup } from "@/components/layout/NewsletterSignup";
import { HumanDataFigure } from "@/components/yeast/HumanDataFigure";
import {
  BENEFITS,
  FLOW_STEPS,
} from "@/components/yeast/yeastData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Biofactories in a tube",
  description:
    "Genetically-modified yeast can be used to produce and deliver proteins, some of which may help maintain the body's natural defenses. No lab, no cold chain, no needles required.",
  path: "/bfiat",
});

export default function BFIATPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={styles.aHero}>
        <div className={styles.aHeroInner}>
          <div className={styles.aHeroText}>
            <h1 className={styles.aTitle}>Biofactories in a&nbsp;tube</h1>
            <p className={styles.aLede}>
              Imagine switching on a protein factory at home by adding yeast to a tube. No lab required.
            </p>
          </div>
          <div className={styles.aHeroArt}>
            <YeastBFIAT3D kind="tube" size={260} />
          </div>
        </div>
      </header>

      {/* ---------- How it works ---------- */}
      <section className={styles.block} id="how">
        <h2 className={styles.h2}>How yeast-based biofactories work</h2>
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
      <section className={styles.block} id="proven-in-animals">
        <h2 className={styles.h2}>Proven in animals</h2>
        <p className={`${styles.lede} ${styles.ledeFull}`}>
          Across more than 20 published studies, yeast expressing antigen proteins fed orally have induced antibody responses in mice, chickens, pigs, and fish.
        </p>
        <StudiesTable />
      </section>

      {/* ---------- First Human Data ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>First human data</h2>
        <HumanDataFigure />
      </section>

      {/* ---------- Why yeast ---------- */}
      <section className={styles.block}>
        <h2 className={styles.h2}>Potential benefits</h2>
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

      {/* ---------- Read more (hidden for now) ---------- */}
      {/* <section className={styles.block}>
        <h2 className={styles.h2}>Related external articles</h2>
        <ul style={{ marginTop: "18px", paddingLeft: "1.4em", lineHeight: 1.9, fontSize: "16px", color: "var(--ink-soft)", listStyleType: "disc" }}>
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
      </section> */}

      {/* ---------- CTA ---------- */}
      <section className={styles.block}>
        <div className={styles.ctaCard}>
          <div>
            <h2>Participate in Radvac&rsquo;s research</h2>
            <p>
              Radvac is planning a study on genetically-modified yeast that manufactures shell proteins from BK & JC Polyomavirus. Submit your email to express interest in being a participant in this upcoming study and to be informed about future studies.
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
