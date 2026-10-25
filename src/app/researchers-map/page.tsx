import type { Metadata } from "next";
import ResearchersGlobe from "@/components/sections/ResearchersGlobe";
import ResearcherSignupForm from "@/components/sections/ResearcherSignupForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildMetadata } from "@/lib/seo";
import { researchers as baselineResearchers, type Researcher } from "@/data/researchers";
import { getApprovedResearchers } from "@/lib/wordpress/researchers";

export const metadata: Metadata = buildMetadata({
  title: "Researchers Map",
  description:
    "An interactive world map of researchers interested in collaborating on vaccine-related work. Find collaborators near you or add yourself to the map.",
  path: "/researchers-map",
});

export default async function ResearchersPage() {
  const wpApproved = await getApprovedResearchers();

  // Merge WordPress approved researchers with baseline researchers.
  // WordPress approved entries take precedence if there are duplicates by id or email.
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const merged: Researcher[] = [];

  for (const r of wpApproved) {
    if (r.id) seenIds.add(r.id);
    if (r.email) seenEmails.add(r.email.toLowerCase());
    merged.push(r);
  }

  for (const r of baselineResearchers) {
    if (seenIds.has(r.id)) continue;
    if (r.email && seenEmails.has(r.email.toLowerCase())) continue;
    merged.push(r);
  }

  return (
    <>
      <PageHeader title="Researchers Map" />
      <section className="section" style={{ paddingTop: 32 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <ResearchersGlobe initialResearchers={merged} />
        </div>
        <div />
        <div>
          <p className="section-lede" style={{ marginTop: 0 }}>
            Spin the globe and zoom in to find others near you who are
            interested in collaborating on vaccine-related work. Click on a pin
            to see more information about each entry, including contact
            information.
          </p>
          <p>
            By filling out the form below, you can add your own information to
            the map so others can find you. Updates take a couple of days to
            appear. Radvac hosts this map but does not know all listed
            researchers personally.
          </p>
          <p>
            <em>All information is displayed publicly</em>, so you may use a
            non-personal identifier and a non-personal email address.
          </p>

          <h2 style={{ marginTop: 32 }}>Add yourself to the map</h2>
          <ResearcherSignupForm />
        </div>
      </section>
    </>
  );
}
