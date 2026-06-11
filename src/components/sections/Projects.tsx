import Link from "next/link";
import { projects } from "@/data/projects";
import styles from "./Projects.module.css";
import ProjectCardGraphic, {
  type ProjectGraphicKind,
} from "./ProjectCardGraphic";

const GRAPHIC_BY_HREF: Record<string, ProjectGraphicKind> = {
  "/vaccine": "nasal",
  "/projects/influenza": "h2o2",
  "/projects/h5n1": "tube",
  "/projects/fril-lectin": "nasal-green",
  "/ai-for-antivirals": "pills",
};

export function Projects({ withLabel = false }: { withLabel?: boolean } = {}) {
  return (
    <section className="section" id="projects">
      {withLabel && (
        <div className="sec-num">
          <strong>Projects</strong>
        </div>
      )}
      <div style={withLabel ? undefined : { gridColumn: "1 / -1" }}>
        <div className={styles.projects}>
          {projects.map((project) => {
            const hasPage =
              project.href === "/vaccine" ||
              project.href === "/ai-for-antivirals";
            const graphicKind = GRAPHIC_BY_HREF[project.href];
            const textColumn = (
              <div className={styles.text}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {hasPage && <div className={styles.arrow}>Read more →</div>}
              </div>
            );
            const inner = graphicKind ? (
              <>
                {textColumn}
                <ProjectCardGraphic kind={graphicKind} />
              </>
            ) : (
              textColumn
            );
            const cardClass = graphicKind
              ? `${styles.project} ${styles.projectWithGraphic}`
              : styles.project;
            return hasPage ? (
              <Link
                key={project.href}
                className={cardClass}
                href={project.href}
              >
                {inner}
              </Link>
            ) : (
              <div key={project.href} className={cardClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
