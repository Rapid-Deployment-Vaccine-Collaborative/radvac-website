import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import yeast from "@/components/yeast/Yeast.module.css";
import styles from "@/components/variolation/Variolation.module.css";
import { MvIcon } from "@/components/variolation/VariolationIcons";
import ProjectCardGraphic from "@/components/sections/ProjectCardGraphic";
import { AdvantagesTable } from "@/components/variolation/AdvantagesTable";
import {
  MV_STEPS,
  ROUTES,
  SUBSTACK_PART_1,
} from "@/components/variolation/variolationData";
import type { Route } from "@/components/variolation/variolationData";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "Modernized variolation",
    description:
      "Variolation — deliberate exposure to a weakened pathogen — was the forerunner of vaccination. Radvac is researching whether modern inactivation, tropism knowledge and adjuvants can rebuild it as a countermeasure deployable in days rather than years.",
    path: "/modernized-variolation",
  }),
};

/**
 * Route blurb, with the citation phrase turned into an external link when the
 * entry carries one. Falls back to plain text if `link.text` is not found in
 * the body, so a reworded blurb degrades rather than breaking.
 */
function RouteBody({ route }: { route: Route }) {
  const at = route.link ? route.body.indexOf(route.link.text) : -1;
  if (!route.link || at === -1) return <p>{route.body}</p>;
  const { href, text } = route.link;
  const internal = href.startsWith("/");
  return (
    <p>
      {route.body.slice(0, at)}
      {internal ? (
        <Link href={href}>{text}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      )}
      {route.body.slice(at + text.length)}
    </p>
  );
}

export default function ModernizedVariolationPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <header className={yeast.aHero}>
        <div className={`${yeast.aHeroInner} ${styles.heroInner}`}>
          <div className={yeast.aHeroText}>
            <h1 className={yeast.aTitle}>Modernized variolation</h1>
            <p className={yeast.aLede}>
              Radvac is working to bring back and modernize variolation by
              applying advances from the sciences of virology and immunology.
            </p>
          </div>
          <div className={styles.heroArt}>
            <ProjectCardGraphic kind="h2o2" size={220} />
          </div>
        </div>
      </header>

      {/* ---------- MV vs vaccines ---------- */}
      <section className={yeast.block} id="vs-vaccines">
        <h2 className={yeast.h2}>Modernized variolation vs conventional vaccines</h2>
        <AdvantagesTable />
      </section>

      {/* ---------- How it works ---------- */}
      <section className={yeast.block} id="how">
        <h2 className={yeast.h2}>How modernized variolation self-experiments are structured</h2>
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

      {/*
      <section className={yeast.block} id="what-is-modern">
        <h2 className={yeast.h2}>What &ldquo;modernized&rdquo; adds</h2>

        <div className={styles.cards}>
          {MODERN_TOOLS.map((t) => (
            <div className={styles.card} key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* ---------- Routes ---------- */}
      <section className={yeast.block} id="routes">
        <h2 className={yeast.h2}>Routes under investigation</h2>
        <div className={styles.cards}>
          {ROUTES.map((r) => (
            <div className={styles.card} key={r.title}>
              <h3>{r.title}</h3>
              <RouteBody route={r} />
            </div>
          ))}
        </div>
      </section>

      {/*
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
      */}

      {/* ---------- Illustration ---------- */}
      <section className={yeast.block} id="illustration">
        <h2 className={yeast.h2}>Illustration</h2>
        <figure className={styles.diagramFigure}>
          <Image
            src="/images/modernized-variolation-procedure-diagram.webp"
            alt="Six-panel diagram of an intranasal modernized variolation procedure: nasal mucus is collected from an ill donor into a tube, hydrogen peroxide is added, the tube is mixed, the treated inoculum is drawn up, then administered into the nose of a recipient, with a cutaway showing it reaching the nasal mucosa."
            width={1600}
            height={763}
            className={styles.diagramImg}
            sizes="(max-width: 820px) 96vw, 900px"
            /* Pre-sized 1600px WebP (~100KB), so runtime optimization buys
               nothing — and `next dev`'s optimizer currently crashes the
               server on this machine for any /_next/image request. */
            unoptimized
          />
        </figure>
      </section>

      {/* ---------- White paper ---------- */}
      <section className={yeast.block} id="white-paper">
        <h2 className={yeast.h2}>Read the white paper</h2>
        <ul className={styles.readList}>
          <li>
            <a
              className={styles.readCardLink}
              href="https://radvac.org/white-papers"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.readTitle}>Modernized Variolation</span>
              <span className={styles.readMeta}>
                Preston W. Estep, Chris Buck, and the Radvac Team.
              </span>
            </a>
          </li>
        </ul>
      </section>

      {/* ---------- Read more ---------- */}
      <section className={yeast.block} id="read">
        <h2 className={yeast.h2}>Further reading</h2>
        <ul className={styles.readList}>
          <li>
            <a
              className={styles.readCardLink}
              href={SUBSTACK_PART_1}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.readTitle}>Modernizing Variolation</span>
              <span className={styles.readMeta}>
                by Preston Estep
              </span>
            </a>
          </li>
          <li>
            <a
              className={styles.readCardLink}
              href="https://substack.com/home/post/p-218366368"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.readTitle}>
                Modernizing Variolation, Part 2
              </span>
              <span className={styles.readMeta}>
                by Preston Estep
              </span>
            </a>
          </li>
        </ul>
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
