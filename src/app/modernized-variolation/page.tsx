import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import yeast from "@/components/yeast/Yeast.module.css";
import styles from "@/components/variolation/Variolation.module.css";
import { MvIcon } from "@/components/variolation/VariolationIcons";
import ProjectCardGraphic from "@/components/sections/ProjectCardGraphic";
import { AdvantagesTable } from "@/components/variolation/AdvantagesTable";
import {
  MODERN_TOOLS,
  MV_STEPS,
  NEEDS,
  ROUTES,
  SUBSTACK_PART_1,
} from "@/components/variolation/variolationData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Modernized variolation",
    description:
      "Variolation — deliberate exposure to a weakened pathogen — was the forerunner of vaccination. Radvac is researching whether modern inactivation, tropism knowledge and adjuvants can rebuild it as a countermeasure deployable in days rather than years.",
    path: "/modernized-variolation",
  }),
};

export default function ModernizedVariolationPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={yeast.aHero}>
        <div className={`${yeast.aHeroInner} ${styles.heroInner}`}>
          <div className={yeast.aHeroText}>
            <h1 className={yeast.aTitle}>Modernized variolation</h1>
            <p className={styles.heroDefinition}>
              Modernized Variolation (MV) is a form of variolation that
              involves some combination of pathogen inactivation (partial or
              complete), pathogen attenuation, and enhancement of
              immunogenicity by the use of one or more adjuvants. The optimal
              combination of these variables is informed by modern science and
              current evidence.
            </p>
          </div>
          <div className={styles.heroArt}>
            <ProjectCardGraphic kind="h2o2" size={220} />
          </div>
        </div>
      </header>

      {/* ---------- How it works ---------- */}
      <section className={yeast.block} id="how">
        <h2 className={yeast.h2}>How the procedure is structured</h2>
        <div className={yeast.flow}>
          {MV_STEPS.map((step, i) => (
            <Fragment key={step.num}>
              <div className={yeast.step}>
                <div className={yeast.stepIconWrap}>
                  <MvIcon kind={step.icon} size={56} />
                </div>
                <span className={yeast.stepNum}>{step.num}</span>
                <h3 className={yeast.stepTitle}>{step.title}</h3>
                <p className={yeast.stepBody}>{step.body}</p>
              </div>
              {i < MV_STEPS.length - 1 && (
                <div className={yeast.arrow} aria-hidden="true">
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ---------- What "modernized" adds ---------- */}
      <section className={yeast.block} id="what-is-modern">
        <h2 className={yeast.h2}>What &ldquo;modernized&rdquo; adds</h2>
        <p className={`${yeast.lede} ${yeast.ledeFull}`}>
          Four things separate MV from the practice it descends from — three
          borrowed from modern vaccine research, one from simply knowing far
          more about pathogens than anyone did in 1777.
        </p>
        <div className={styles.cards}>
          {MODERN_TOOLS.map((t) => (
            <div className={styles.card} key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Routes ---------- */}
      <section className={yeast.block} id="routes">
        <h2 className={yeast.h2}>Routes under investigation</h2>
        <div className={styles.cards}>
          {ROUTES.map((r) => (
            <div className={styles.card} key={r.title}>
              <h3>{r.title}</h3>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- MV vs vaccines ---------- */}
      <section className={yeast.block} id="vs-vaccines">
        <h2 className={yeast.h2}>Compared with conventional vaccines</h2>
        <AdvantagesTable />
      </section>

      {/* ---------- What's still needed ---------- */}
      <section className={yeast.block} id="needed">
        <h2 className={yeast.h2}>What the approach still needs</h2>
        <p className={`${yeast.lede} ${yeast.ledeFull}`}>
          MV inside a single household needs no infrastructure. A countermeasure
          that could actually blunt an outbreak needs quite a lot, and all of it
          is in formative stages.
        </p>
        <div className={styles.cards}>
          {NEEDS.map((n) => (
            <div className={styles.card} key={n.title}>
              <h3>{n.title}</h3>
              <p>{n.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Read more ---------- */}
      <section className={yeast.block} id="read">
        <h2 className={yeast.h2}>Read more</h2>
        <ul className={styles.readList}>
          <li>
            <Link href="/white-papers">
              Modernized Variolation — white paper (draft)
            </Link>
            <span className={styles.readMeta}>
              Estep, Buck and the Radvac team. The full rationale, the technology
              choices behind it, the pilot protocols, and three case studies in
              an appendix.
            </span>
          </li>
          <li>
            <a href={SUBSTACK_PART_1} target="_blank" rel="noopener noreferrer">
              Modernizing Variolation
            </a>
            <span className={styles.readMeta}>
              Preston Estep, May 2026 — a first-person account of the first use
              of the protocol.
            </span>
          </li>
          <li>
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3506259/pdf/nihms418821.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Development of a new hydrogen peroxide–based vaccine platform
            </a>
            <span className={styles.readMeta}>
              Amanna, Raué &amp; Slifka, <em>Nature Medicine</em> 2012 — the
              published basis for the inactivation chemistry MV relies on.
            </span>
          </li>
          <li>
            <a
              href="https://www.newswise.com/pdf_docs/175371944370690_Gill%20vaccine%20floss%202025%20FINAL.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              Floss-based vaccination targets the gingival sulcus
            </a>
            <span className={styles.readMeta}>
              Ingrole et al., <em>Nature Biomedical Engineering</em> — the
              evidence behind the dental floss route.
            </span>
          </li>
        </ul>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={yeast.block}>
        <div className={yeast.ctaCard}>
          <div>
            <h2>Help improve the science</h2>
            <p>
              Every element of this is in a formative stage, and the Radvac
              community has repeatedly improved on the core team&apos;s first
              drafts. Feedback, criticism and suggestions on the protocols and
              the infrastructure around them are all welcome.
            </p>
          </div>
          <div className={yeast.ctaActions}>
            <Link className={yeast.btnPrimary} href="/contact">
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
