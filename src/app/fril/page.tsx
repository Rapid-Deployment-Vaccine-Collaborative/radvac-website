import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import yeast from "@/components/yeast/Yeast.module.css";
import styles from "@/components/fril/Fril.module.css";
import { FrilIcon } from "@/components/fril/FrilIcons";
import FrilAggregationScene from "@/components/fril/FrilAggregationScene";
import ProjectCardGraphic from "@/components/sections/ProjectCardGraphic";
import {
  PIPELINE,
  STUDIES,
} from "@/components/fril/frilData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FRIL: a broad-spectrum antiviral from the hyacinth bean",
  description:
    "FRIL is a carbohydrate-binding protein from hyacinth beans that grips the glycans on influenza and coronavirus surfaces and clumps virus particles together. Radvac is working on cheap purification and an intranasal prophylactic formulation.",
  path: "/fril",
});

/**
 * Body text with its citation phrase turned into an external link. Falls back
 * to plain text when `link.text` is not found verbatim, so reworded copy
 * degrades rather than breaking. Mirrors RouteBody on /modernized-variolation.
 */
function LinkedBody({
  body,
  link,
}: {
  body: string;
  link?: { text: string; href: string };
}) {
  const at = link ? body.indexOf(link.text) : -1;
  if (!link || at === -1) return <>{body}</>;
  return (
    <>
      {body.slice(0, at)}
      <a href={link.href} target="_blank" rel="noopener noreferrer">
        {link.text}
      </a>
      {body.slice(at + link.text.length)}
    </>
  );
}

export default function FrilPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={yeast.aHero}>
        <div className={`${yeast.aHeroInner} ${styles.heroInner}`}>
          <div className={yeast.aHeroText}>
            <h1 className={yeast.aTitle}>A broad-spectrum antiviral from a bean</h1>
          </div>
          <div className={styles.heroArt}>
            <ProjectCardGraphic kind="nasal-green" size={230} />
          </div>
        </div>
      </header>

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
                <p className={`${yeast.stepBody} ${styles.stepBody}`}>
                  <LinkedBody body={step.body} link={step.link} />
                </p>
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
      </section>

      {/* ---------- Published evidence ---------- */}
      <section className={yeast.block} id="evidence">
        <h2 className={yeast.h2}>What has been published</h2>
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
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className={yeast.block}>
        <div className={yeast.ctaCard}>
          <div>
            <h2>Help us with this work</h2>
            <p>
              Feedback, criticism, suggestions, and personal reports are all
              welcome.
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
