export type Paper = {
  title: string;
  subtitle: string;
  href: string;
  date: string;
  tag?: string;
};

export const papers: Paper[] = [
  {
    title: "SARS-CoV-2 nasal vaccine — current revision",
    subtitle: "Adds expanded peptide pool 12 and Omicron BA.5 epitopes.",
    href: "/papers/v5.1.0",
    date: "15 Jan 2022",
    tag: "Active",
  },
  {
    title: "Methods, materials, and self-administration protocol",
    subtitle: "Chitosan-based delivery vehicle and updated cold-chain notes.",
    href: "/papers/v5.0.0",
    date: "04 Jan 2022",
  },
  {
    title: "Adjuvant optimization and dosing schedule",
    subtitle: "Dosing interval revised 28d → 21d, with booster cadence guidance.",
    href: "/papers/v3.0.1",
    date: "22 Aug 2020",
  },
  {
    title: "Initial peptide-conjugate vaccine design",
    subtitle: "28-peptide library and carrier conjugation methods.",
    href: "/papers/v2.3.5",
    date: "05 Aug 2020",
    tag: "Foundational",
  },
  {
    title: "Original publication, prior to first generation",
    subtitle: "Original methods, safety review, and rationale.",
    href: "/papers/v2.2.4",
    date: "15 Jul 2020",
  },
];
