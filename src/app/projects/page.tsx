import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Projects } from "@/components/sections/Projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "RaDVaC's open-source projects: nasal SARS-CoV-2 peptide vaccine, modernized variolation, vaccine factories in a tube, and AI for antivirals.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" />
      <Projects />
    </>
  );
}
