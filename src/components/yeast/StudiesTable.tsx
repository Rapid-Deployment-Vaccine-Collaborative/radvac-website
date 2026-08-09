// Simplified "Major virus studies in animal models" table

import styles from "./Yeast.module.css";
import { Tipped } from "./Tipped";
import { MODELS, STUDIES, type ModelKey } from "./yeastData";

function ModelLabel({ model }: { model: ModelKey }) {
  return <span className={styles.model}>{MODELS[model].label}</span>;
}

export function StudiesTable({ tone = "light" }: { tone?: "light" | "warm" }) {
  return (
    <div
      className={`${styles.tableWrap} ${tone === "warm" ? styles.tableWarm : ""}`}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Pathogen</th>
            <th>Tested in</th>
            <th>
              Yeast
              <br />
              species
            </th>
            <th>Preparation</th>
            <th>Antigen</th>
            <th>
              Antigen
              <br />
              location
            </th>
            <th>
              Immune
              <br />
              response / effects measured
            </th>
            <th className={styles.citeCol}>Study</th>
          </tr>
        </thead>
        <tbody>
          {STUDIES.map((s, i) => (
            <tr key={`${s.pathogen}-${s.cite}-${i}`}>
              <td data-label="Pathogen" className={styles.virusCell}>
                {s.pathogen}
              </td>
              <td data-label="Tested in">
                <ModelLabel model={s.model} />
              </td>
              <td data-label="Yeast species">
                <em>{s.yeast}</em>
              </td>
              <td data-label="Preparation" className={styles.muted}>
                {s.prep}
              </td>
              <td data-label="Antigen">
                <Tipped
                  className={`${styles.tipped} ${styles.antigen}`}
                  detail={s.antigen.full}
                  label={s.antigen.abbr}
                />
              </td>
              <td data-label="Antigen location" className={styles.muted}>
                {s.location}
              </td>
              <td data-label="Immune response / effects measured">
                <Tipped
                  className={`${styles.tipped} ${styles.response}`}
                  detail={s.response.detail}
                  label={s.response.short}
                />
              </td>
              <td data-label="Study" className={`${styles.muted} ${styles.citeCol}`}>
                <a
                  className={styles.citeLink}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.cite}
                </a>
                {s.preprint && (
                  <span className={styles.preprintMark}>(preprint)</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
