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
          {projects.map((project) => (
            <Link
              key={project.href}
              className={styles.project}
              href={project.href}
            >
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className={styles.arrow}>Read project →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
