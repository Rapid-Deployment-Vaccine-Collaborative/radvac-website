import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import yeast from "@/components/yeast/Yeast.module.css";
import styles from "@/components/fril/Fril.module.css";
import { FrilIcon } from "@/components/fril/FrilIcons";
import FrilAggregationScene from "@/components/fril/FrilAggregationScene";
import ProjectCardGraphic from "@/components/sections/ProjectCardGraphic";
import {
  ADVANTAGES,
  PIPELINE,
  STRUCTURE,
  STUDIES,
  WORKSTREAMS,
} from "@/components/fril/frilData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "FRIL: a broad-spectrum antiviral from the hyacinth bean",
    description:
      "FRIL is a carbohydrate-binding protein from hyacinth beans that grips the glycans on influenza and coronavirus surfaces and clumps virus particles together. Radvac is working on cheap purification and an intranasal prophylactic formulation.",
    path: "/fril-draft",
  }),
  // Draft: reachable by direct link, kept out of the sitemap (see sitemap.ts)
  // and out of search results until the content settles.
  robots: { index: false, follow: false },
};

export default function FrilDraftPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={yeast.aHero}>
        <div className={`${yeast.aHeroInner} ${styles.heroInner}`}>
          <div className={yeast.aHeroText}>
            <h1 className={yeast.aTitle}>A broad-spectrum antiviral from a bean</h1>
            <p className={yeast.aLede}>
              FRIL is a carbohydrate-binding protein from the hyacinth bean. It
              grips the sugar coat that enveloped viruses cannot do without, and
              sticks virus particles to each other. Radvac is working to make it
              cheap to produce and practical to deliver as a nasal spray.
            </p>
          </div>
          <div className={styles.heroArt}>
            <ProjectCardGraphic kind="nasal-green" size={230} />
          </div>
        </div>
      </header>

      {/* ---------- Mechanism, as an animated figure ---------- */}
      <section className={yeast.block} id="how">
        <h2 className={yeast.h2}>How FRIL stops a virus</h2>
        <p className={`${yeast.lede} ${yeast.ledeFull}`}>
          Influenza hemagglutinin and coronavirus spike are both heavily
          glycosylated. FRIL is a homotetramer with four carbohydrate-binding
          sites — two facing each end — so one molecule can hold two virus
          particles at once. Drag to rotate; the steps below jump through the
          sequence.
        </p>
        <FrilAggregationScene />
        <p className={styles.figNote}>
          The tetramer is the real structure:{" "}
          <a href={STRUCTURE.pdbHref} target="_blank" rel="noopener noreferrer">
            PDB {STRUCTURE.pdbId}
          </a>{" "}
          — {STRUCTURE.description}, from{" "}
          <a href={STRUCTURE.paperHref} target="_blank" rel="noopener noreferrer">
            Liu et al. 2026
          </a>{" "}
          (the earlier FRIL structure is{" "}
          <a href={STRUCTURE.priorHref} target="_blank" rel="noopener noreferrer">
            PDB {STRUCTURE.priorId}
          </a>
          ). The virions are schematic. Sizes are not to scale: a FRIL tetramer
          is about 8&nbsp;nm across against a roughly 100&nbsp;nm virion, so it
          is drawn several times larger here to stay legible.
        </p>
      </section>

      {/* ---------- Published evidence ---------- */}
      <section className={yeast.block} id="evidence">
        <h2 className={yeast.h2}>What has been published</h2>
        <p className={`${yeast.lede} ${yeast.ledeFull}`}>
          FRIL&apos;s antiviral activity is not a Radvac finding — it is an
          established result in the literature, which is why we think it is
          worth building on.
        </p>
        <div className={yeast.tableWrap}>
          <table className={`${yeast.table} ${styles.studyTable}`}>
            <thead>
              <tr>
                <th scope="col">Study</th>
                <th scope="col">Journal</th>
                <th scope="col">System</th>
                <th scope="col" className={styles.studyWhat}>
                  What was shown
                </th>
              </tr>
            </thead>
            <tbody>
              {STUDIES.map((s) => (
                <tr key={s.href}>
                  <td>
                    <a
                      className={yeast.citeLink}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.cite} {s.year}
                    </a>
                  </td>
                  <td className={yeast.muted}>{s.journal}</td>
                  <td>{s.system}</td>
                  <td className={styles.studyWhat}>{s.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={yeast.tableNote}>
            Figures are each study&apos;s own reported results. Most of this work
            is in cells, in animals, or ex vivo on patient samples; the chewing-gum
            studies are the closest to human use.
          </p>
        </div>
      </section>

      {/* ---------- Why FRIL ---------- */}
      <section className={yeast.block} id="why">
        <h2 className={yeast.h2}>Why this molecule</h2>
        <div className={yeast.benefits}>
          {ADVANTAGES.map((a) => (
            <div className={yeast.benefit} key={a.title}>
              <h3>
                <span className={yeast.check} aria-hidden="true">
                  ✓
                </span>
                {a.title}
              </h3>
              <p>{a.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- The pipeline ---------- */}
      <section className={yeast.block} id="pipeline">
        <h2 className={yeast.h2}>From bean to nasal spray</h2>
        <div className={yeast.flow}>
          {PIPELINE.map((step, i) => (
            <Fragment key={step.num}>
              <div className={yeast.step}>
                <div className={yeast.stepIconWrap}>
                  <FrilIcon kind={step.icon} size={56} />
                </div>
                <span className={yeast.stepNum}>{step.num}</span>
                <h3 className={yeast.stepTitle}>{step.title}</h3>
                <p className={yeast.stepBody}>{step.body}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className={yeast.arrow} aria-hidden="true">
                  →
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ---------- Workstreams ---------- */}
      <section className={yeast.block} id="work">
        <h2 className={yeast.h2}>What we are working on</h2>
        <div className={styles.workCards}>
          {WORKSTREAMS.map((w) => (
            <div className={styles.workCard} key={w.num}>
              <span className={styles.workNum}>{w.num}</span>
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </div>
          ))}
        </div>

        <div className={styles.noteCard}>
          <h3>Where this stands</h3>
          <p>
            FRIL is not an approved drug and nothing on this page is a medical
            recommendation. The published work above is in cells, in animals and
            ex vivo on patient samples. Radvac&apos;s own purification,
            formulation and safety work is in progress and unpublished.
          </p>
          <p>
            Radvac has separately been evaluating a FRIL chewing gum as a
            virus-debulking intervention, to establish tolerability and safety of
            extended FRIL exposure.
          </p>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={yeast.block}>
        <div className={yeast.ctaCard}>
          <div>
            <h2>Help us with this work</h2>
            <p>
              We are looking for people with experience in protein purification,
              intranasal formulation, and respiratory virus assays. Feedback and
              criticism are equally welcome.
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
