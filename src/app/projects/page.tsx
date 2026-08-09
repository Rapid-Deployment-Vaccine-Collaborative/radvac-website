import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Projects } from "@/components/sections/Projects";
import SwissCheeseScene from "@/components/sections/SwissCheeseSceneInner";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Radvac's open-source projects: nasal SARS-CoV-2 peptide vaccine, modernized variolation, biofactories in a tube, FRIL lectin broad-spectrum antiviral, and AI for antivirals.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" />
      <Projects />
      <section className="section">
        <div style={{ gridColumn: "1 / -1" }}>
          <h2
            style={{
              textAlign: "left",
              marginBottom: 16,
              marginLeft: 0,
              fontSize: "2.25rem",
            }}
          >
            The swiss cheese model for effective biodefense
          </h2>
          <SwissCheeseScene />
        </div>
      </section>
    </>
  );
}
