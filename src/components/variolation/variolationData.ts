// Content for the /modernized-variolation page.
//
// Condensed from the Radvac "Modernized Variolation" white paper (Estep, Buck
// and the Radvac team, v1.2) and the accompanying Substack series. This page
// deliberately summarizes the *rationale* only — the operational protocols,
// their risks and their open questions stay in the white paper, which carries
// the full context and caveats. Don't inline step-by-step procedure detail
// here.
//
// NOTE: hard-coded alongside the /bfiat page content on purpose — src/data/
// holds legacy content slated for the WordPress migration. Move to WP once the
// page settles.

import type { MvIconKind } from "./VariolationIcons";

export const WHITE_PAPER_TITLE = "Modernized Variolation";
export const SUBSTACK_PART_1 =
  "https://prestonestep.substack.com/p/modernizing-variolation";

/* ------------------------------------------------------------------ *
 * The five procedural steps (white paper, "Technologies and procedures")
 * ------------------------------------------------------------------ */

export type MvStep = {
  icon: MvIconKind;
  num: string;
  title: string;
  body: string;
};

export const MV_STEPS: MvStep[] = [
  {
    icon: "collect",
    num: "01",
    title: "Collect",
    body: "A sample is taken from a donor who is confirmed to be ill. For a respiratory virus that usually means nasal mucus, which carries a high pathogen concentration in the first few days of symptoms.",
  },
  {
    icon: "treat",
    num: "02",
    title: "Inactivate or attenuate",
    body: "The pathogen is rendered unable to replicate — or slowed so that it replicates poorly. Radvac's current focus is hydrogen peroxide, which disables pathogens while partly preserving the antigen structures the immune system needs to see.",
  },
  {
    icon: "administer",
    num: "03",
    title: "Administer",
    body: "The treated sample is self-administered by a route chosen to stimulate immunity. Adjuvants like neomycin are used to amplify the immune response.",
  },
  {
    icon: "monitor",
    num: "04",
    title: "Monitor",
    body: "Outcomes and any side effects are recorded for several weeks.",
  },
  {
    icon: "immunity",
    num: "05",
    title: "Measure response",
    body: "The goal is to stimulate an immune response resembling natural infection without the illness: mucosal antibodies at the point of entry plus systemic immunity. This can be verified by sequencing the pathogen's genome and then blood testing for appropriate antibodies.",
  },
];

/* ------------------------------------------------------------------ *
 * What "modernized" actually adds over historical variolation
 * ------------------------------------------------------------------ */

export const MODERN_TOOLS: { title: string; body: string }[] = [
  {
    title: "Validated inactivation",
    body: "Inactivation means a pathogen can no longer replicate. Vaccine research has established physical methods (heat, UV-C near 260 nm) and chemical ones (oxidizing agents, crosslinkers such as formaldehyde and β-propiolactone). Radvac tested and built UV prototypes, then concluded that 3% hydrogen peroxide — cheap, ubiquitous, and gentler on antigen structure than crosslinkers — is the better option.",
  },
  {
    title: "Attenuation and partial inactivation",
    body: "An attenuated pathogen still replicates, but slowly and badly, which can elicit a far stronger response than a fully inactivated one. Milder peroxide treatment oxidizes guanosine in a viral genome to 8-OHG; ribosomes stall on it, slowing replication without halting it outright. For DNA viruses, cellular repair enzymes reverse some of that damage, so the dose-response differs.",
  },
  {
    title: "Extratropic attenuation",
    body: "Pathogens evolve to attack through specific routes and cell-surface receptors. Put one outside its normal tropism and it is usually weakened and more easily cleared. This is why rubbing smallpox into the skin was survivable when inhaling it was not — and Radvac's term for using that effect deliberately, guided by what is now known about each pathogen's tropism.",
  },
  {
    title: "Adjuvants",
    body: "A fully inactivated pathogen is often poorly immunogenic at mucosal surfaces, where most of a dose never gets past the mucociliary barrier. Infected mucus already carries interferons, pro-inflammatory cytokines, chemokines and alarmins. Neomycin — in ordinary double and triple antibiotic ointments — has separately been shown to induce interferon-stimulated genes and TLR pathways.",
  },
];

export const MV_DEFINITION =
  "Modernized Variolation (MV) is a form of variolation that involves some combination of pathogen inactivation (partial or complete), pathogen attenuation, and enhancement of inoculation immunogenicity by the use of one or more adjuvants. The ultimate combination of each of these options is informed by modern science and current evidence.";

/* ------------------------------------------------------------------ *
 * Routes of administration under investigation
 * ------------------------------------------------------------------ */

export type Route = {
  title: string;
  body: string;
  /**
   * Optional citation. `text` must appear verbatim in `body`; the page renders
   * that phrase as an external link to `href`.
   */
  link?: { text: string; href: string };
};

export const ROUTES: Route[] = [
  {
    title: "Intranasal",
    body: "Via spray, nebulizer, or insufflation. Over 90% of respiratory pathogens enter through the nasal mucosa and respiratory tract, so this is the route that Radvac  self-experimenters are studying first. ",
  },
  {
    title: "Transdermal",
    body: "A microneedle roller or array carries the inoculum past the stratum corneum into the dermis. This is the modern equivalent of the dermal route that became standard for smallpox variolation. Rollers with sterilizable titanium needles can be purchased for under $20.",
  },
  {
    title: "Oral cavity",
    body: "Dental floss with an H₂O₂-inactivated sample, which targets the gingival sulcus. A similar approach was recently shown to drive both mucosal and systemic immunization in animal models.",
    link: {
      text: "recently shown",
      href: "https://pubmed.ncbi.nlm.nih.gov/40696115/",
    },
  },
  {
    title: "Enteric capsule",
    body: "A capsule that protects its contents from stomach acid and releases them in the gut. Yeast is a potential adjuvant, in line with other Radvac work.",
    link: { text: "in line with other Radvac work", href: "/bfiat" },
  },
];

/* ------------------------------------------------------------------ *
 * Table 1 — MV vs conventional vaccines
 * ------------------------------------------------------------------ */

export type Advantage = {
  category: string;
  mv: string;
  vaccines: string;
};

export const ADVANTAGES: Advantage[] = [
  {
    category: "Speed of deployment",
    mv: "Can be deployed immediately at the site of an outbreak.",
    vaccines: "Take years to be developed, manufactured, tested, approved by regulatory bodies, and widely deployed.",
  },
  {
    category: "Match to current variants",
    mv: "Uses the pathogen actually circulating, so it is inherently matched to that variant",
    vaccines: "Typically target older variants that existed at the start of the vaccine development process",
  },
  {
    category: "Regulatory requirements",
    mv: "Self-administration does not require regulatory approval",
    vaccines: "Require regulatory approval, an expensive, multi-year process",
  },
  {
    category: "Cost",
    mv: "Potentially very low-cost and locally deployable",
    vaccines: "Often expensive due to R&D, manufacturing and distribution",
  },
  {
    category: "Safety",
    mv: "Can be made very safe using accessible inactivation technology.",
    vaccines: "Generally very safe",
  },
  {
    category: "Similarity to natural infection",
    mv: "Mimics natural infection, minus the illness; broader immunity",
    vaccines: "Often induces narrower responses; depends on platform",
  },
  {
    category: "Mucosal immunity",
    mv: "Typical routes of administration should induce mucosal immunity",
    vaccines: "Licensed vaccines (e.g. mRNA) induce weak mucosal immunity",
  },
  {
    category: "Public acceptance/hesitancy",
    mv: "May be more acceptable to individuals skeptical of conventional vaccines",
    vaccines: "Hesitancy exists due to distrust, past public health missteps, misinformation, and perceived risks."},
];

/* ------------------------------------------------------------------ *
 * Infrastructure the approach still needs
 * ------------------------------------------------------------------ */

export const NEEDS: { title: string; body: string }[] = [
  {
    title: "Outbreak sentinel system",
    body: "A fault-tolerant app or site that tells people when an outbreak is under way nearby, or is likely soon based on historical transmission patterns. Useful lead time matters: like vaccination, MV needs roughly a week to produce adaptive immunity.",
  },
  {
    title: "A sample-sharing network",
    body: "Collection points, drop-off and storage locations, distribution protocols, and informed-consent documents. Places where sick people concentrate — clinics, schools, daycare — are the obvious index-case sources.",
  },
  {
    title: "A solution to the trust problem",
    body: "Anyone motivated to release a biological weapon is also motivated to poison an open sharing network: tainted samples, or simply samples from healthy people, which quietly defeat the whole approach. Today the only real answer is to accept samples solely from people you know and trust, which badly limits the network's reach.",
  },
  {
    title: "Adverse event reporting",
    body: "A structured tool capturing donor and recipient context, illness type, symptoms, duration and outcomes — so that side effects and failures are visible rather than anecdotal.",
  },
  {
    title: "Correlates of protection",
    body: "IgG and IgA measurements, neutralizing antibody titres, and T-cell characterization by ELISpot. Most of these require identifying the pathogen first, which means point-of-care tests or sequencing.",
  },
];
