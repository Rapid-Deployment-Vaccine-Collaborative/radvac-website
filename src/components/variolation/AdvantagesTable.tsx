// Table 1 from the Modernized Variolation white paper: where MV differs from
// conventional vaccination, in both directions.

import yeast from "../yeast/Yeast.module.css";
import styles from "./Variolation.module.css";
import { ADVANTAGES } from "./variolationData";

export function AdvantagesTable() {
  return (
    <div className={yeast.tableWrap}>
      <table className={`${yeast.table} ${styles.compareTable}`}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Modernized variolation</th>
            <th>Conventional vaccines</th>
          </tr>
        </thead>
        <tbody>
          {ADVANTAGES.map((row) => (
            <tr key={row.category}>
              <td data-label="Category">{row.category}</td>
              <td data-label="Modernized variolation" className={styles.colMv}>
                {row.mv}
              </td>
              <td data-label="Conventional vaccines">{row.vaccines}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
