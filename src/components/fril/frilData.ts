// Content for the /fril-draft page.
//
// Figures and claims are drawn from the published literature cited in STUDIES
// below — each row's numbers come from that paper's own abstract or results.
// Radvac's own work (PIPELINE, WORKSTREAMS) is at a pre-publication stage and
// is deliberately described as intent, not result.
//
// NOTE: hard-coded alongside the /bfiat and /modernized-variolation page
// content on purpose — src/data/ holds legacy content slated for the
// WordPress migration. Move to WP once the page settles.

import type { FrilIconKind } from "./FrilIcons";

/* ------------------------------------------------------------------ *
 * The project pipeline, as a five-step flow
 * ------------------------------------------------------------------ */

export type FrilStep = {
  icon: FrilIconKind;
  num: string;
  title: string;
  body: string;
  /**
   * Optional citation. `text` must appear verbatim in `body`; the page turns
   * that phrase into a link and falls back to plain text if it doesn't match,
   * so a reworded blurb degrades rather than breaking.
   */
  link?: { text: string; href: string };
};

export const PIPELINE: FrilStep[] = [
  {
    icon: "bean",
    num: "01",
    title: "Start from a food crop",
    body: "Hyacinth beans (Lablab purpureus) are unusually rich in FRIL — around 2.5% of seed weight — and are already widely cultivated across Africa and Asia. The input is a bean, not a bioreactor.",
  },
  {
    icon: "purify",
    num: "02",
    title: "Capture on mannose beads",
    body: "FRIL is mannose/glucose-specific, so it can be pulled straight out of a crude bean extract on a mannose-affinity resin and released with free sugar — a route published as far back as Colucci et al. 1999. Radvac is adapting it to inexpensive equipment and locally available inputs.",
    link: { text: "Colucci et al. 1999", href: "https://doi.org/10.1073/pnas.96.2.646" },
  },
  {
    icon: "formulate",
    num: "03",
    title: "Formulate for the nose",
    body: "An intranasal, time-release spray puts FRIL where respiratory viruses land. Work covers dose-ranging, excipients, spray-device compatibility, a sterility strategy and shelf life.",
  },
  {
    icon: "assay",
    num: "04",
    title: "Measure potency and safety",
    body: "Yield, purity, lot-to-lot consistency and activity against representative respiratory viruses or pseudoviruses, plus nasal epithelial tolerability and inflammatory-marker testing.",
  },
  {
    icon: "study",
    num: "05",
    title: "Observe in people",
    body: "If preclinical and formulation milestones are met: a structured, consented observational self-administration study within the Radvac community, reporting tolerability, adherence and local irritation.",
  },
];

/* ------------------------------------------------------------------ *
 * Why this molecule, as opposed to another antiviral
 * ------------------------------------------------------------------ */

export type Advantage = { title: string; body: string };

export const ADVANTAGES: Advantage[] = [
  {
    title: "Broad by construction",
    body: "FRIL binds a feature shared by many enveloped viruses — the complex-type N-glycans on their surface proteins — rather than a sequence unique to one strain. One formulation can cover diverse, novel or engineered pathogens.",
  },
  {
    title: "Hard to mutate around",
    body: "The glycan shield is added by the host cell and helps the virus evade antibodies. Shedding it to escape a lectin costs the virus fitness, which raises the barrier to resistance compared with drugs targeting viral enzymes.",
  },
  {
    title: "Stable at room temperature",
    body: "FRIL has been reported active after more than two years in bean powder and in chewing gum stored at ambient temperature. No cold chain is a precondition for stockpiling and for distributed deployment.",
  },
  {
    title: "A food, not a synthesis",
    body: "FRIL is an extract of an edible bean. That shapes both the regulatory position and the manufacturing one: local purification and stockpiling are plausible in low- and middle-income countries.",
  },
  {
    title: "Prophylaxis, not treatment",
    body: "The aim is to cut viral burden at the point of entry — nose and mouth — before an infection establishes, which is a different and easier problem than treating an established one.",
  },
  {
    title: "Favourable safety signals so far",
    body: "Published animal and cell studies report low toxicity. That is a starting point, not a conclusion: a focused safety package for intranasal use is part of the work, not an assumption behind it.",
  },
];

/* ------------------------------------------------------------------ *
 * Published evidence
 * ------------------------------------------------------------------ */

export type Study = {
  cite: string;
  year: string;
  journal: string;
  href: string;
  system: string;
  what: string;
};

export const STUDIES: Study[] = [
  {
    cite: "Liu et al.",
    year: "2020",
    journal: "Cell Reports",
    href: "https://doi.org/10.1016/j.celrep.2020.108016",
    system: "Influenza (11 strains), SARS-CoV-2",
    what: "FRIL neutralized 11 human and avian influenza strains at low nanomolar concentrations and neutralized SARS-CoV-2 in cell culture. Intranasal FRIL protected mice against a lethal H1N1 challenge. Electron microscopy and light scattering showed FRIL aggregating virions.",
  },
  {
    cite: "Daniell et al.",
    year: "2022",
    journal: "Biomaterials",
    href: "https://doi.org/10.1016/j.biomaterials.2022.121671",
    system: "SARS-CoV-2 (Delta, Omicron, OC43), H1N1, H3N2",
    what: "FRIL delivered in a chewing gum reduced virus in clinical nasopharyngeal samples; 50% plaque reduction at 50–100 ng of purified FRIL. Electron micrographs showed densely packed clumps of influenza particles and FRIL.",
  },
  {
    cite: "Daniell et al.",
    year: "2025",
    journal: "Molecular Therapy",
    href: "https://doi.org/10.1016/j.ymthe.2024.12.008",
    system: "HSV-1, HSV-2, H1N1, H3N2",
    what: "Bean gum extracts trapped 75–94% of HSV-1/HSV-2 through self-aggregation. FRIL remained stable 683 days in bean powder and 790 days in gum, and functional at 794 days, stored at ambient temperature.",
  },
  {
    cite: "Daniell et al.",
    year: "2026",
    journal: "Scientific Reports",
    href: "https://doi.org/10.1038/s41598-026-39062-w",
    system: "Oral HPV (patient samples)",
    what: "In an ex vivo study of head-and-neck cancer patients, bean-lectin gum aggregated 93% of HPV in saliva and 80% in oral-rinse samples.",
  },
  {
    cite: "Liu et al.",
    year: "2026",
    journal: "Nature Communications",
    href: "https://doi.org/10.1038/s41467-026-70188-7",
    system: "Structure",
    what: "Structure-guided engineering identified loop B residues as the determinant of FRIL's preference for complex-type over high-mannose N-glycans — the trait that separates it from lectins like concanavalin A. This is the work the structure on this page comes from.",
  },
];

/* ------------------------------------------------------------------ *
 * What Radvac is actually doing
 * ------------------------------------------------------------------ */

export type Workstream = {
  num: string;
  title: string;
  body: string;
  /** Optional citation; same verbatim-match contract as FrilStep.link. */
  link?: { text: string; href: string };
};

export const WORKSTREAMS: Workstream[] = [
  {
    num: "01",
    title: "Scalable purification",
    body: "The chemistry is settled: mannose-affinity capture, eluted with 200 mM methyl-α-D-mannoside and polished by ion exchange, is published (Liu et al. 2026). The bottleneck is cost and equipment. We are adapting that route to inexpensive, widely available inputs and validating yield, purity, lot-to-lot consistency, antiviral activity and stability under realistic storage conditions.",
    link: {
      text: "Liu et al. 2026",
      href: "https://doi.org/10.1038/s41467-026-70188-7",
    },
  },
  {
    num: "02",
    title: "Intranasal formulation",
    body: "A time-release intranasal preparation built for low-cost deployment: dose-ranging, excipient selection, spray-device compatibility, sterility strategy, stability testing, and in vitro activity against representative respiratory viruses.",
  },
  {
    num: "03",
    title: "Safety package",
    body: "Literature review, nasal epithelial-cell tolerability assays, inflammatory-marker testing, repeat-dose animal tolerability where appropriate, and review by the broader scientific and clinical community.",
  },
  {
    num: "04",
    title: "Observational study",
    body: "A consented self-administration study within the Radvac community. Primary endpoints: tolerability, adherence, local irritation, smell and taste effects, adverse events. Exploratory: respiratory-infection frequency, severity and duration against local pathogen surveillance.",
  },
];

/* ------------------------------------------------------------------ *
 * Structure provenance for the animated figure
 * ------------------------------------------------------------------ */

export const STRUCTURE = {
  pdbId: "9VBW",
  pdbHref: "https://www.rcsb.org/structure/9VBW",
  description:
    "FRIL from Lablab purpureus bound to a Lewis X tetrasaccharide, 2.49 Å X-ray structure",
  paperHref: "https://doi.org/10.1038/s41467-026-70188-7",
  priorId: "1QMO",
  priorHref: "https://www.rcsb.org/structure/1QMO",
};
