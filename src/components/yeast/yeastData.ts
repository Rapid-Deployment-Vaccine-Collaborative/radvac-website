// Content for the /yeast-vaccines prototype pages.
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

// Adapted from "How yeast vaccines work" (yeast talk, slide 3).
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
    body: "Yeast survives stomach acid, then delivers the manufactored proteins to the gut. M cells in the gut may take up particular proteins, triggering antibody responses.",
  },
];

// Adapted from "Summary of major benefits" (yeast talk, slide 9).
export const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Easy, cheap production",
    body: "Grown in a tube from commercially available yeast — no fermenters, clean rooms, or specialist equipment.",
  },
  {
    title: "Oral or nasal delivery",
    body: "Swallowed or sprayed — no needles, no trained injector required.",
  },
  {
    title: "Can be made shelf stable",
    body: "No refrigeration needed, so it ships and stores anywhere in the world.",
  },
  {
    title: "No cold chain",
    body: "No refrigeration needed, so it ships and stores anywhere in the world.",
  },
  {
    title: "Mucosal immunity",
    body: "Raises secretory IgA at mucosal surfaces, and possibly systemic IgG antibodies.",
  },
  {
    title: "Generally Recognized As Safe",
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

// Animal model → legend colour. "Tested in" is the animal model used in the
// study, not the virus's natural host.
export type ModelKey = "mice" | "chickens" | "pigs" | "mixed";

export const MODELS: Record<ModelKey, { label: string; color: string }> = {
  mice: { label: "Mice", color: "#3aa76d" },
  chickens: { label: "Chickens", color: "#d9a23a" },
  pigs: { label: "Pigs", color: "#d2663a" },
  mixed: { label: "Mice & piglets", color: "#d2663a" },
};

export type Study = {
  virus: string;
  model: ModelKey;
  yeast: string; // species, italicised in the UI
  format: string;
  response: string;
  cite: string;
  url: string; // DOI link for the study
};

// Simplified from "Major virus studies in animal models" (oral-vaccine deck,
// slide 4 / Austriaco 2023, Table 1, with recent studies added).
// Grouped by animal model (mice → chickens → pigs), most-recent-first within
// each group. The "Mice & piglets" (mixed) PEDV study sits in the pig block.
export const STUDIES: Study[] = [
  { virus: "SARS-CoV-2", model: "mice", yeast: "P. pastoris", format: "killed · surface display", response: "IgG2a · IgA · nAb", cite: "de Macêdo 2025", url: "https://doi.org/10.3390/idr17050104" },
  { virus: "SARS-CoV-2", model: "mice", yeast: "S. cerevisiae", format: "live · surface display", response: "IgG · IgA", cite: "Zhang 2022", url: "https://doi.org/10.3389/fmicb.2022.792532" },
  { virus: "SARS-CoV-2", model: "mice", yeast: "S. cerevisiae", format: "killed · surface display", response: "IgG · IgA · IFN-γ · IL-4", cite: "Gao 2021", url: "https://doi.org/10.1186/s12934-021-01584-5" },
  { virus: "Influenza H7N9", model: "mice", yeast: "S. cerevisiae", format: "killed · surface display", response: "IgG · IFN-γ / IL-4 T cells", cite: "Lei 2020", url: "https://doi.org/10.1186/s12934-020-01316-1" },
  { virus: "Dengue", model: "mice", yeast: "S. cerevisiae", format: "live · surface display", response: "IgG · sIgA", cite: "Bal 2018a", url: "https://doi.org/10.1186/s12934-018-0994-8" },
  { virus: "Dengue", model: "mice", yeast: "S. cerevisiae", format: "live + killed · subunit", response: "IgG · sIgA · lymphocytes", cite: "Bal 2018b", url: "https://doi.org/10.1186/s12934-018-0876-0" },
  { virus: "Enterovirus 71", model: "mice", yeast: "S. cerevisiae", format: "live · surface display", response: "IgG · IgM · IgA · TNF-α", cite: "Zhang 2016", url: "https://doi.org/10.1089/vim.2015.0110" },
  { virus: "PRRSV", model: "mice", yeast: "K. lactis", format: "live · subunit", response: "IgG · IgA · lymphocytes", cite: "Zhao 2014", url: "https://doi.org/10.4142/jvs.2014.15.2.199" },
  { virus: "Fowl adenovirus", model: "chickens", yeast: "S. cerevisiae", format: "live · surface display", response: "IgG · sIgA · IFN-α/β · CD8", cite: "Cao 2022", url: "https://doi.org/10.1016/j.vetmic.2022.109490" },
  { virus: "Influenza H5N1", model: "chickens", yeast: "S. cerevisiae", format: "killed · surface display", response: "IgG · IgA · IFN-γ · IL-4", cite: "Lei 2021", url: "https://doi.org/10.1038/s41598-021-88413-2" },
  { virus: "Infectious bursal disease", model: "chickens", yeast: "P. pastoris", format: "killed · subunit", response: "IgM · IgY", cite: "Taghavian 2013", url: "https://doi.org/10.1371/journal.pone.0083210" },
  { virus: "African swine fever", model: "pigs", yeast: "S. cerevisiae", format: "live · surface display", response: "IgG · IgA", cite: "Chen 2021", url: "https://doi.org/10.1007/s12250-020-00278-3" },
  { virus: "Porcine epidemic diarrhea", model: "mixed", yeast: "P. pastoris", format: "live · subunit", response: "IgG · IgA", cite: "Wang 2016", url: "https://doi.org/10.1089/vim.2016.0067" },
  { virus: "Porcine circovirus 2", model: "pigs", yeast: "S. cerevisiae", format: "killed · surface display", response: "IgG · IgA", cite: "Patterson 2015", url: "https://doi.org/10.1016/j.vaccine.2015.10.003" },
];

export const DISCORD_URL = "https://discord.gg/5PGYCfmBUe";
