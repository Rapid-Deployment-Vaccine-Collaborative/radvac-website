import Link from "next/link";
import { projects } from "@/data/projects";
import styles from "./Projects.module.css";

export function Projects() {
  return (
    <section className="section" id="projects">
      <div className="sec-num">
        <strong>Projects</strong>
      </div>
      <div>
        <div className={styles.projects}>
          {projects.map((project) => {
            const hasPage =
              project.href === "/vaccine" ||
              project.href === "/ai-for-antivirals";
            const content = (
              <>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {hasPage && <div className={styles.arrow}>Read more →</div>}
              </>
            );
            return hasPage ? (
              <Link
                key={project.href}
                className={styles.project}
                href={project.href}
              >
                {content}
              </Link>
            ) : (
              <div key={project.href} className={styles.project}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
