export type Project = {
  title: string;
  href: string;
  description: string;
};

export const projects: Project[] = [
  {
    title: "Nasal SARS-CoV-2 vaccine",
    href: "/projects/sars-cov-2",
    description:
      "Peptide-conjugate intranasal vaccine, optimized across five revisions for breadth and durability against emerging variants.",
  },
  {
    title: "Universal flu peptide pool",
    href: "/projects/influenza",
    description:
      "Conserved-epitope nasal formulation aimed at cross-strain protection. Currently in design and pre-bench peptide selection.",
  },
  {
    title: "H5N1 rapid-response prototype",
    href: "/projects/h5n1",
    description:
      "Bench-to-dose pipeline targeting current circulating H5N1 strains, with self-administration protocol mirrored on the SARS-CoV-2 design.",
  },
  {
    title: "Adjuvant + delivery methods library",
    href: "/projects/methods",
    description:
      "Reusable formulations, chitosan-based delivery, and self-administration protocols shared across all RaDVaC programs.",
  },
];
