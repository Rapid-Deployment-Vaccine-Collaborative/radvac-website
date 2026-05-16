export type Project = {
  title: string;
  href: string;
  description: string;
};

export const projects: Project[] = [
  {
    title: "Nasal SARS-CoV-2 peptide vaccine",
    href: "/vaccine",
    description:
      "Our protocol for a peptide-conjugate intranasal vaccine, optimized across five revisions for breadth and durability against emerging SARS-CoV-2 variants.",
  },
  {
    title: "Modernized variolation",
    href: "/projects/influenza",
    description:
      "Protocols for collecting mucus samples, inactivating viruses, and administering variolation safely. Additional protocols for decentralized sample collection and sharing.",
  },
  {
    title: "Vaccine factories in a tube",
    href: "/projects/h5n1",
    description:
      "Protocols for using genetically-modified yeast to generate vaccine factories in a tube. Vaccines can be delivered orally, nasally, or both.",
  },
  {
    title: "AI for rapid drug repurposing and antiviral combinations design",
    href: "/ai-for-antivirals",
    description:
      "Leveraging advances in open source data and AI to repurpose existing drugs and GRAS compounds as antivirals. New techniques for combining several weak antivirals into powerful combinations.",
  },
];
