export type Project = {
  title: string;
  href: string;
  description: string;
  previous?: boolean;
};

export const projects: Project[] = [
  {
    title: "Biofactories in a tube",
    href: "/projects/h5n1",
    description:
      "Genetically-modified yeast can be used to produce and deliver proteins, some of which may help maintain the body's natural defenses.",
  },
  {
    title: "Modernized variolation",
    href: "/projects/influenza",
    description:
      "Protocols for collecting mucus samples, inactivating viruses, and administering variolation safely. Additional protocols for decentralized sample collection and sharing.",
  },
  {
    title: "FRIL lectin broad-spectrum antiviral",
    href: "/projects/fril-lectin",
    description:
      "Radvac is pioneering a way to cheaply manufacture FRIL lectin from the lablab bean. FRIL is a potent broad-spectrum antiviral that can be delivered as a nasal spray or in a chewing gum formulation.",
  },
  {
    title: "Nasal SARS-CoV-2 peptide vaccine",
    href: "/vaccine",
    description:
      "Our protocol for a peptide-conjugate intranasal vaccine, optimized across five revisions for breadth and durability against emerging SARS-CoV-2 variants.",
    previous: true,
  },
  {
    title: "AI for rapid drug repurposing and antiviral combinations design",
    href: "/ai-for-antivirals",
    description:
      "Leveraging advances in open source data and AI to repurpose existing drugs and GRAS compounds as antivirals. New techniques for combining several weak antivirals into powerful combinations.",
    previous: true,
  },
];
