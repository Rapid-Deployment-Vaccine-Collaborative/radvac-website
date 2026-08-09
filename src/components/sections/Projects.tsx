import Link from "next/link";
import { projects, type Project } from "@/data/projects";
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

// Project cards whose card link should point somewhere other than the
// project's own href, with the arrow label to use.
const LINK_OVERRIDE: Record<string, { href: string; label: string }> = {
  "/projects/h5n1": { href: "/bfiat", label: "Read more →" },
  "/projects/influenza": {
    href: "https://prestonestep.substack.com/p/modernizing-variolation",
    label: "Learn more →",
  },
};

function ProjectCard({ project }: { project: Project }) {
  const override = LINK_OVERRIDE[project.href];
  const linkTo = override?.href ?? project.href;
  const hasPage =
    project.href === "/vaccine" ||
    project.href === "/ai-for-antivirals" ||
    override !== undefined;
  const isExternal = linkTo.startsWith("http");
  const graphicKind = GRAPHIC_BY_HREF[project.href];
  const textColumn = (
    <div className={styles.text}>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      {hasPage && (
        <div className={styles.arrow}>{override?.label ?? "Read more →"}</div>
      )}
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
  if (!hasPage) {
    return <div className={cardClass}>{inner}</div>;
  }
  return isExternal ? (
    <a
      className={cardClass}
      href={linkTo}
      target="_blank"
      rel="noopener noreferrer"
    >
      {inner}
    </a>
  ) : (
    <Link className={cardClass} href={linkTo}>
      {inner}
    </Link>
  );
}

export function Projects() {
  const current = projects.filter((p) => !p.previous);
  const previous = projects.filter((p) => p.previous);
  return (
    <section className="section" id="projects">
      <h2 className="sec-num">
        <strong>Current projects</strong>
      </h2>
      <div>
        <div className={styles.projects}>
          {current.map((project) => (
            <ProjectCard key={project.href} project={project} />
          ))}
        </div>
      </div>
      {previous.length > 0 && (
        <>
          <h2 className="sec-num">
            <strong>Previous projects</strong>
          </h2>
          <div>
            <div className={styles.projects}>
              {previous.map((project) => (
                <ProjectCard key={project.href} project={project} />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
