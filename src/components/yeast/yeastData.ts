// Content for the /bfiat prototype pages.
//
// NOTE: This is hard-coded draft content for two prototype pages and is kept
// here (not in src/data/) on purpose — src/data/ holds legacy content slated
// for the WordPress migration. Once a design is chosen this should move to WP.

import type { WireIconKind } from "./WireframeIcons";

export type FlowStep = {
  icon: WireIconKind;
  num: string;
  title: string;
  body: string;
};

export const FLOW_STEPS: FlowStep[] = [
  {
    icon: "capsid",
    num: "01",
    title: "Identify a protein",
    body: "Choose gene(s) for the proteins you want to produce.",
  },
  {
    icon: "plasmid",
    num: "02",
    title: "Insert plasmids",
    body: "Clone those genes into plasmids alongside a custom, maltose-triggered promoter, then insert them into the yeast.",
  },
  {
    icon: "culture",
    num: "03",
    title: "Culture the yeast",
    body: "Grow the engineered yeast.",
  },
  {
    icon: "factory",
    num: "04",
    title: "Switch on production",
    body: "Maltose activates the promoter and the yeast fill with protein (or display proteins on their surface).",
  },
  {
    icon: "drink",
    num: "05",
    title: "Consume it",
    body: "Yeast survives stomach acid, then delivers the manufactored proteins to the gut. M cells in the gut may take up particular proteins, potentially helping maintain the body's natural defenses.",
  },
];

// Adapted from "Summary of major benefits" (yeast talk, slide 9).
export const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Easy, cheap to make",
    body: "Grown in a tube from commercially available yeast — no fermenters, clean rooms, or specialist equipment.",
  },
  {
    title: "Oral or nasal delivery (no needles/injections)",
    body: "Swallowed or sprayed — no needles, no trained injector required.",
  },
  {
    title: "Can be dried and be made shelf stable",
    body: "No refrigeration needed, so it ships and stores anywhere in the world.",
  },
  {
    title: "Refrigeration not required during shipment",
    body: "No refrigeration needed, so it ships and stores anywhere in the world.",
  },
  {
    title: "Can potentially boost the immune system's mucosal defenses",
    body: "Raises secretory IgA at mucosal surfaces, and possibly systemic IgG antibodies.",
  },
  {
    title: "Generally recognized as safe",
    body: "GMO yeast is GRAS and already sold for human consumption in the US — many products use it legally today.",
  },
];

// Big-number stats, adapted from the "Yeast as an oral vaccine platform" deck.
export const STATS: { value: string; label: string }[] = [
  { value: "34", label: "Published studies, 2013–2023" },
  { value: "25+", label: "Pathogens across 4 microbe classes" },
  { value: "3", label: "Yeast species used as carriers" },
  { value: "IgG·sIgA", label: "Systemic + mucosal antibody responses" },
];

// "Tested in" is the animal model used in the study, not the pathogen's natural
// host.
export type ModelKey = "mice" | "chickens" | "pigs" | "mixed";

export const MODELS: Record<ModelKey, { label: string }> = {
  mice: { label: "Mice" },
  chickens: { label: "Chickens" },
  pigs: { label: "Pigs" },
  mixed: { label: "Mice & piglets" },
};

// How the yeast was prepared before it was fed to the animals.
export type Prep = "live" | "killed" | "live + killed";

// Where the antigen sits relative to the yeast cell: anchored on the cell wall,
// held inside the cell, or actively secreted out of it.
export type AntigenLocation = "surface" | "internal" | "secreted";

export type Study = {
  pathogen: string;
  model: ModelKey;
  yeast: string; // species, italicised in the UI
  prep: Prep;
  antigen: { abbr: string; full: string }; // abbr shown, full name on hover
  location: AntigenLocation;
  // Only readouts the ORAL arm produced. `detail` (shown on hover) names the
  // sample type and any caveat — a result that needed an injected booster, or
  // a readout the paper measured but found non-significant.
  response: { short: string; detail: string };
  cite: string;
  url: string; // DOI link for the study
  preprint?: boolean; // adds a "(preprint)" tag after the citation link
};

// Simplified from "Major virus studies in animal models" (oral-vaccine deck,
// slide 4 / Austriaco 2023, Table 1, with recent studies added). Broadened
// beyond viruses — the F4⁺ ETEC and Salmonella Pullorum rows are bacterial and the
// Eimeria tenella row is a protozoan parasite.
// Grouped by animal model (mice → chickens → pigs), most-recent-first within
// each group. The "Mice & piglets" (mixed) PEDV study sits in the pig block.
export const STUDIES: Study[] = [
  { pathogen: "SARS-CoV-2", model: "mice", yeast: "P. pastoris", prep: "killed", antigen: { abbr: "FliC–RBD–foldon", full: "Spike receptor-binding domain fused to the T4 fibritin foldon trimerization domain and a truncated Salmonella typhimurium flagellin (FliC) peptide as a built-in adjuvant, anchored to the cell wall by SED1" }, location: "surface", response: { short: "serum IgG · fecal IgA", detail: "RBD-specific serum IgG and fecal IgA both raised. The p<0.0001 is the ANOVA across groups for IgG only; the fecal IgA results are reported as differences in OD without a p-value. The trimerized, flagellin-bearing construct was strongest, while the plain RBD construct gave only modest IgA and did worse than the non-recombinant yeast control at the same density. Sera and fecal extracts were pooled across the five mice per group, so the triplicates measure assay rather than biological variation. No neutralization assay, cytokines or virus challenge." }, cite: "Saveii 2026", url: "https://doi.org/10.1038/s41598-026-50942-z" },
  { pathogen: "Influenza H1N1", model: "mice", yeast: "S. cerevisiae", prep: "killed", antigen: { abbr: "mini-HA", full: "A headless, stabilized trimeric stem-only fragment of the influenza hemagglutinin, built from A/California/04/2009 (H1N1) with the variable head domain replaced by a linker and a GCN4 trimerization motif added" }, location: "surface", response: { short: "serum IgG · fecal sIgA · Th1-biased", detail: "Three oral doses of heat-killed yeast raised HA-specific serum IgG and fecal secretory IgA, both p<0.001, with IgG2a exceeding IgG1 and antigen-specific splenocyte proliferation. No infection challenge was performed, so protection is unknown, and neither neutralizing nor haemagglutination-inhibition titers were measured. The cellular readout is spleen mRNA by qPCR rather than cytokine protein, and mucosal IgA was measured only in feces. Published as an unedited accepted manuscript, so values may change at copyediting." }, cite: "Zhang 2026", url: "https://doi.org/10.1186/s13568-026-02101-w" },
  { pathogen: "BK polyomavirus", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "VP1", full: "Major capsid protein VP1, which self-assembles into virus-like particles" }, location: "internal", response: { short: "serum nAb", detail: "BKV-neutralizing serum antibodies, uniformly robust and boosted at week 8. Lysates of the same yeast fed orally induced nothing detectable." }, cite: "Soleymani 2025", url: "https://zenodo.org/records/17969224", preprint: true },
  { pathogen: "SARS-CoV-2", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "RBD–CpE", full: "Spike receptor-binding domain fused to the Clostridium perfringens enterotoxin gut-targeting fragment" }, location: "secreted", response: { short: "IgG · fecal IgA · IFN-γ", detail: "Serum IgG and fecal IgA both significantly raised (p<0.005). Splenocytes secreted IFN-γ but not IL-4, i.e. a Th1-biased response." }, cite: "Ramos 2025", url: "https://www.biorxiv.org/content/10.64898/2025.12.08.692901v1", preprint: true },
  { pathogen: "SARS-CoV-2", model: "mice", yeast: "P. pastoris", prep: "killed", antigen: { abbr: "S+N epitopes", full: "Synthetic multi-epitope antigen combining Spike and Nucleocapsid epitopes" }, location: "surface", response: { short: "IgG2a · IgG2b · fecal IgA", detail: "Serum IgG2a and IgG2b plus fecal IgA significantly raised. Serum IgA was not significant, and the surrogate neutralization assay did not reach significance. Only four mice per group." }, cite: "de Macêdo 2025", url: "https://doi.org/10.3390/idr17050104" },
  { pathogen: "F4⁺ E. coli (ETEC)", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "FaeG", full: "FaeG, the subunit of the F4 fimbria that enterotoxigenic E. coli uses to bind intestinal cells and colonize the gut" }, location: "surface", response: { short: "IgG · fecal sIgA · IL-2/IL-4/IFN-γ · survival", detail: "Serum IgG and fecal sIgA raised (p<0.05), intestinal IL-2, IL-4 and IFN-γ raised (p<0.01), and improved survival after challenge with a lethal dose of F4⁺ ETEC." }, cite: "Hu 2025", url: "https://doi.org/10.1128/aem.01817-24" },
  { pathogen: "African swine fever", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "8-antigen panel", full: "Eight truncated antigenic regions from African swine fever virus strain HLJ — KP177R, E183L, E199L, CP204L, E248R, EP402R, B602L and B646L — each displayed on its own recombinant yeast strain and fed together as an eight-strain mixture" }, location: "surface", response: { short: "IgG · fecal sIgA · CD4/CD8 · IFN-γ / IL-4", detail: "Three oral doses raised antigen-specific serum IgG and fecal secretory IgA against all eight antigens by day 28–42 (p<0.05), expanded splenic CD4⁺ and CD8⁺ T cells, and gave IFN-γ and IL-4 secreting splenocytes. Tested in mice rather than pigs — the authors note that no mouse ASFV challenge model exists, so there is no protection or viral-load data, and no neutralization assay was done. At 14 days, serum IgG to EP402R and fecal IgA to CP204L and EP402R were not significant. The yeast vehicle alone also raised T-cell numbers, so part of the cellular response is non-specific. Whether the cells were live or killed is never stated, and all titers appear only in figures." }, cite: "Gao 2024", url: "https://doi.org/10.3389/fimmu.2024.1373656" },
  { pathogen: "Infectious bursal disease", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "VP2", full: "Capsid protein VP2 of infectious bursal disease virus, anchored to the cell wall via Aga2p" }, location: "surface", response: { short: "IgG · fecal sIgA · IFN-α/γ", detail: "VP2-specific serum IgG and fecal sIgA both significantly raised. IFN-α and IFN-γ were measured as gene expression by qPCR rather than as protein. Despite the title, no virus challenge was performed." }, cite: "Li 2023", url: "https://doi.org/10.3390/vaccines11121849" },
  { pathogen: "SARS-CoV-2", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "RBD–FP", full: "Spike receptor-binding domain plus fusion peptide" }, location: "surface", response: { short: "serum IgG · IgA", detail: "Spike-specific serum IgG and IgA by ELISA. No mucosal sample, no neutralization assay and no cytokines were measured in this study." }, cite: "Zhang 2022", url: "https://doi.org/10.3389/fmicb.2022.792532" },
  { pathogen: "SARS-CoV-2", model: "mice", yeast: "S. cerevisiae", prep: "killed", antigen: { abbr: "RBD", full: "Full-length receptor-binding domain of the Spike protein" }, location: "surface", response: { short: "IgG · sIgA · IFN-γ · IL-4 · nAb", detail: "Serum IgG, fecal secretory IgA, T-cell proliferation, IFN-γ and IL-4 (IFN-γ dominant, so Th1-biased), and neutralization of pseudovirus. No live-virus challenge." }, cite: "Gao 2021", url: "https://doi.org/10.1186/s12934-021-01584-5" },
  { pathogen: "Influenza H7N9", model: "mice", yeast: "S. cerevisiae", prep: "killed", antigen: { abbr: "HA", full: "Hemagglutinin of A/Anhui/1/2013 (H7N9)" }, location: "surface", response: { short: "IgG · HI · IFN-γ / IL-4", detail: "Serum IgG and haemagglutination-inhibition titers, plus IFN-γ and IL-4 secreting splenocytes (Th1-skewed), and complete protection against lethal H7N9 challenge. No IgA was measured." }, cite: "Lei 2020", url: "https://doi.org/10.1186/s12934-020-01316-1" },
  { pathogen: "Dengue", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "Co1–scEDIII", full: "Synthetic consensus envelope domain III fused to the M-cell targeting ligand Co1" }, location: "surface", response: { short: "IgG", detail: "Serum IgG significant from feeding, plus antibody-forming cells in spleen and Peyer's patches. Fecal sIgA was not significant until after an intraperitoneal booster." }, cite: "Bal 2018a", url: "https://doi.org/10.1186/s12934-018-0994-8" },
  { pathogen: "Dengue", model: "mice", yeast: "S. cerevisiae", prep: "live + killed", antigen: { abbr: "LTB–scEDIII", full: "Synthetic consensus envelope domain III fused to the E. coli heat-labile toxin B subunit" }, location: "internal", response: { short: "IgG · sIgA · nAb · proliferation", detail: "Serum IgG and fecal sIgA from both whole cells and cell-free extract. Both neutralized DENV-1, but only the extract neutralized DENV-2 and drove lymphocyte proliferation." }, cite: "Bal 2018b", url: "https://doi.org/10.1186/s12934-018-0876-0" },
  { pathogen: "Enterovirus 71", model: "mice", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "VP1", full: "Major immunogenic capsid protein VP1 of enterovirus 71" }, location: "surface", response: { short: "IgG · IgM · IgA · nAb · IFN-γ / TNF-α", detail: "Serum IgG and IgM; IgA in saliva, vaginal fluid and intestinal and lung lavage; neutralizing titer of 2⁶; IFN-γ and TNF-α from splenocytes. Pups of fed dams survived lethal challenge 60% of the time." }, cite: "Zhang 2016", url: "https://doi.org/10.1089/vim.2015.0110" },
  { pathogen: "PRRSV", model: "mice", yeast: "K. lactis", prep: "killed", antigen: { abbr: "GP5", full: "Major envelope glycoprotein GP5 of highly pathogenic PRRSV" }, location: "internal", response: { short: "sIgA · IFN-γ⁺ T cells", detail: "Secretory IgA in intestinal and vaginal washes, and IFN-γ-producing CD4 and CD8 T cells. Serum IgG was weak, and lymphocyte proliferation appeared only via the subcutaneous route." }, cite: "Zhao 2014", url: "https://doi.org/10.4142/jvs.2014.15.2.199" },
  { pathogen: "Coccidiosis (E. tenella)", model: "chickens", yeast: "S. cerevisiae", prep: "live + killed", antigen: { abbr: "EtRON2", full: "Eimeria tenella rhoptry neck protein 2, which pairs with AMA1 to form the moving junction the parasite uses to invade host cells; only its predicted extracellular domain was displayed" }, location: "surface", response: { short: "ACI 172 · ↓oocyst shedding · Th1/Th17", detail: "Six oral doses of live surface-display yeast before an E. tenella challenge gave the highest anticoccidial index in the study — 172, against 119 for empty-vector yeast and 96 unvaccinated, the only arm the authors rate as strong protection — plus the lowest oocyst score of any arm, 103% relative weight gain and a small reduction in cecal lesions. Serum IFN-γ, IL-6 and IL-17 rose. But this best-protected group showed no significant rise in antigen-specific serum IgY or cecal sIgA; those appeared only in the killed-EtRON2 and live-EtROP17 arms, so the protection here is not antibody-explained. The 54% shedding reduction is quoted only in the abstract, and oocyst counts came from group-pooled feces with technical rather than per-bird replicates. Survival was 100% in every group including controls, and empty-vector yeast alone improved weight gain, so part of the benefit is a non-specific carrier effect." }, cite: "Han 2026", url: "https://doi.org/10.1016/j.psj.2026.107401" },
  { pathogen: "Salmonella Pullorum", model: "chickens", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "FimH–OmpC", full: "A single fusion protein joining FimH, the type 1 fimbrial adhesin, to OmpC, outer membrane protein C, both from Salmonella Pullorum, linked by a flexible (GGGGS)₃ peptide" }, location: "surface", response: { short: "IgG · IgA · jejunal sIgA · cytokines · 37.5% survival", detail: "Two oral doses raised serum total IgG and IgA, FimH- and OmpC-specific serum antibody, jejunal secretory IgA, and serum IL-2, IL-4, IL-1β and IFN-γ, while IL-10 fell; blood CD4⁺ and CD8⁺ ratios rose 2.1-fold, with a weaker splenic response. On challenge, 3 of 8 vaccinated chicks survived against 0 of 8 in both the PBS and empty-vector-yeast controls, and 6 of 8 under enrofloxacin — but no statistical test for survival is reported, and the challenge was injected intramuscularly rather than given by mouth, which bypasses the gut barrier the secretory IgA is meant to defend. Bacterial load fell 7.2–22.4% in cecum, lung, liver and muscle but not spleen, and was measured only in the birds that died." }, cite: "He 2026", url: "https://doi.org/10.1080/01652176.2026.2614711" },
  { pathogen: "Fowl adenovirus", model: "chickens", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "Fiber-2", full: "Fiber-2 protein of fowl adenovirus serotype 4" }, location: "surface", response: { short: "antibody · protection", detail: "Humoral response reported without naming an isotype. Protection against FAdV-4 challenge, reduced liver viral load and less heart, liver and spleen damage. Mucosal immunity appeared only when combined with an inactivated vaccine. Full text is subscription-only." }, cite: "Cao 2022", url: "https://doi.org/10.1016/j.vetmic.2022.109490" },
  { pathogen: "Influenza H5N1", model: "chickens", yeast: "S. cerevisiae", prep: "killed", antigen: { abbr: "HA", full: "Hemagglutinin of highly pathogenic avian influenza H5N1" }, location: "surface", response: { short: "IgG · IgA · HI · IFN-γ / IL-4", detail: "Serum IgG, secretory IgA in small-intestine washes, HI titers of 64, and IFN-γ and IL-4 secreting splenocytes, with protection against both homologous and heterologous H5N1 challenge." }, cite: "Lei 2021", url: "https://doi.org/10.1038/s41598-021-88413-2" },
  { pathogen: "Infectious bursal disease", model: "chickens", yeast: "P. pastoris", prep: "killed", antigen: { abbr: "VP2", full: "Capsid protein VP2, which self-assembles into 23 nm subviral particles" }, location: "internal", response: { short: "protection only", detail: "Survival rose to 60–100% against 40% in controls, but the fed birds barely seroconverted before challenge. The IgM and IgY responses came from the injected group, not the oral one." }, cite: "Taghavian 2013", url: "https://doi.org/10.1371/journal.pone.0083210" },
  { pathogen: "African swine fever", model: "pigs", yeast: "S. cerevisiae", prep: "live", antigen: { abbr: "p30/p54–Fc", full: "ASFV p30 and p54 proteins fused to porcine IgG1 and IgA1 Fc fragments" }, location: "surface", response: { short: "serum IgG · serum IgA", detail: "p30- and p54-specific IgG and IgA, both measured in serum only. No mucosal sample, no neutralization assay and no virus challenge were done." }, cite: "Chen 2021", url: "https://doi.org/10.1007/s12250-020-00278-3" },
  { pathogen: "Porcine epidemic diarrhea", model: "mixed", yeast: "P. pastoris", prep: "live", antigen: { abbr: "S1", full: "Full-length S1 subunit of the spike protein of PEDV strain CV777" }, location: "internal", response: { short: "serum IgG · mucosal IgA", detail: "In mice, serum IgG and intestinal and fecal IgA were significantly raised from 14 days. In piglets, fecal IgA was detectable at 7 days and rose to 28. No neutralization assay, virus challenge or cytokines." }, cite: "Wang 2016", url: "https://doi.org/10.1089/vim.2016.0067" },
  { pathogen: "Porcine circovirus 2", model: "pigs", yeast: "S. cerevisiae", prep: "killed", antigen: { abbr: "Cap", full: "PCV2b capsid protein (Cap)" }, location: "surface", response: { short: "fecal sIgA · IFN-α/γ · ↓viraemia", detail: "Fecal secretory IgA (total, not PCV2-specific) and serum IFN-α and IFN-γ rose, and viraemia fell. Serum anti-Cap antibody was explicitly unchanged by oral vaccination." }, cite: "Patterson 2015", url: "https://doi.org/10.1016/j.vaccine.2015.10.003" },
];
