// Simplified "Major virus studies in animal models" table, shared by both
// yeast-vaccine prototypes. Adapted from the oral-vaccine deck (slide 4) /
// Austriaco 2023, Table 1.

import styles from "./Yeast.module.css";
import { MODELS, STUDIES, type ModelKey } from "./yeastData";

function ModelDot({ model }: { model: ModelKey }) {
  const m = MODELS[model];
  return (
    <span className={styles.model}>
      <span
        className={styles.dot}
        style={{ background: m.color }}
        aria-hidden="true"
      />
      {m.label}
    </span>
  );
}

export function StudiesTable({ tone = "light" }: { tone?: "light" | "warm" }) {
  return (
    <div
      className={`${styles.tableWrap} ${tone === "warm" ? styles.tableWarm : ""}`}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Virus</th>
            <th>Tested in</th>
            <th>Yeast species</th>
            <th>Format</th>
            <th>Immune response</th>
            <th className={styles.citeCol}>Study</th>
          </tr>
        </thead>
        <tbody>
          {STUDIES.map((s, i) => (
            <tr key={`${s.virus}-${s.cite}-${i}`}>
              <td data-label="Virus" className={styles.virusCell}>
                {s.virus}
              </td>
              <td data-label="Tested in">
                <ModelDot model={s.model} />
              </td>
              <td data-label="Yeast species">
                <em>{s.yeast}</em>
              </td>
              <td data-label="Format" className={styles.muted}>
                {s.format}
              </td>
              <td data-label="Immune response" className={styles.response}>
                {s.response}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
