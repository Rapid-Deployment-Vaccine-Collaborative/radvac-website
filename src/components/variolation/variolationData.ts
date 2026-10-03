// Content for the /modernized-variolation-draft page.
//
// Condensed from the Radvac "Modernized Variolation" white paper (Estep, Buck
// and the Radvac team, v1.2) and the accompanying Substack series. This page
// deliberately summarises the *rationale* only — the operational protocols,
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
 * The four procedural steps (white paper, "Technologies and procedures")
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
    body: "A sample is taken from a known, trusted donor who is confirmed to be ill. For a respiratory virus that usually means nasal mucus, which carries the highest pathogen concentration in the first few days of symptoms.",
  },
  {
    icon: "treat",
    num: "02",
    title: "Inactivate or attenuate",
    body: "After any dilution or filtering the sample needs, the pathogen is rendered unable to replicate — or slowed so that it replicates poorly. Radvac's current focus is hydrogen peroxide, which disables pathogens while partly preserving the antigen structures the immune system needs to see.",
  },
  {
    icon: "administer",
    num: "03",
    title: "Administer",
    body: "The treated sample is self-administered by a route chosen to stimulate immunity — ideally one outside the pathogen's normal tissue range, with an adjuvant to amplify the response.",
  },
  {
    icon: "immunity",
    num: "04",
    title: "Respond",
    body: "The goal is a response resembling natural infection without the illness: mucosal antibodies at the point of entry plus systemic immunity. Whether MV reliably achieves this is the open question the research has to answer.",
  },
];

/* ------------------------------------------------------------------ *
 * What "modernized" actually adds over historical variolation
 * ------------------------------------------------------------------ */

export const MODERN_TOOLS: { title: string; body: string }[] = [
  {
    title: "Validated inactivation",
    body: "Inactivation means a pathogen can no longer replicate. Vaccine research has established physical methods (heat, UV-C near 260 nm) and chemical ones (oxidising agents, crosslinkers such as formaldehyde and β-propiolactone). Radvac tested and built UV prototypes, then concluded that 3% hydrogen peroxide — cheap, ubiquitous, and gentler on antigen structure than crosslinkers — is the better option.",
  },
  {
    title: "Attenuation and partial inactivation",
    body: "An attenuated pathogen still replicates, but slowly and badly, which can elicit a far stronger response than a fully inactivated one. Milder peroxide treatment oxidises guanosine in a viral genome to 8-OHG; ribosomes stall on it, slowing replication without halting it outright. For DNA viruses, cellular repair enzymes reverse some of that damage, so the dose-response differs.",
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

export const ROUTES: { title: string; body: string }[] = [
  {
    title: "Intranasal",
    body: "Spray, nebuliser or insufflation. Over 90% of respiratory pathogens enter through the nasal mucosa and respiratory tract, so this is the entry point Radvac blocks first.",
  },
  {
    title: "Transdermal",
    body: "A microneedle roller or array carries the inoculum past the stratum corneum into the dermis — the modern equivalent of the dermal route that made smallpox variolation survivable. Rollers with sterilisable titanium needles cost under US$20.",
  },
  {
    title: "Oral cavity",
    body: "Vaccine-loaded dental floss, which targets the gingival sulcus; an approach recently shown to drive both mucosal and systemic immunisation in animal models.",
  },
  {
    title: "Enteric capsule",
    body: "A capsule that protects its contents from stomach acid and releases them in the gut — the same delivery problem Radvac's yeast biofactory work addresses.",
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
    mv: "Can be deployed immediately at the site of an outbreak",
    vaccines: "Regulatory, R&D, production and distribution delays",
  },
  {
    category: "Match to current variants",
    mv: "Uses the pathogen actually circulating, so it is inherently matched to that variant",
    vaccines: "Typically targets past variants; may be less effective against newly emerging strains",
  },
  {
    category: "Regulatory requirements",
    mv: "Self-administration does not require regulatory approval",
    vaccines: "Requires regulatory approval, slowing availability",
  },
  {
    category: "Cost",
    mv: "Potentially very low-cost and locally deployable",
    vaccines: "Often expensive due to R&D, manufacturing and distribution",
  },
  {
    category: "Safety",
    mv: "Unvalidated; depends entirely on the inactivation step working as intended",
    vaccines: "Generally very safe, with trial data behind each platform",
  },
  {
    category: "Similarity to natural infection",
    mv: "Mimics natural infection, minus the illness; potentially broader immunity",
    vaccines: "Often induces narrower responses; depends on platform",
  },
  {
    category: "Mucosal immunity",
    mv: "Typical routes of administration should induce mucosal immunity",
    vaccines: "Licensed vaccines (e.g. mRNA) induce weak mucosal immunity",
  },
  {
    category: "Platform diversity",
    mv: "Adaptable to different pathogens and delivery methods",
    vaccines: "Limited diversity; often dominated by a few technologies",
  },
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
    body: "IgG and IgA measurements, neutralising antibody titres, and T-cell characterisation by ELISpot. Most of these require identifying the pathogen first, which means point-of-care tests or sequencing.",
  },
];
