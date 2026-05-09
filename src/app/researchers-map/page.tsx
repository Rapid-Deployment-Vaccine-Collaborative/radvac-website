import type { Metadata } from "next";
import ResearchersMap from "@/components/sections/ResearchersMap";
import ResearcherSignupForm from "@/components/sections/ResearcherSignupForm";

export const metadata: Metadata = {
  title: "Researchers Map",
};

export default function ResearchersPage() {
  return (
    <section className="section">
      <div className="sec-num">
        <strong>Researchers Map</strong>
      </div>
      <div>
        <p className="section-lede">
          Use the map below to find others near you who are interested in
          collaborating on vaccine-related work. Click on a pin to see more
          information about each entry, including contact information.
        </p>
        <p>
          By filling out the form below, you can add your own information to
          the map so others can find you. Updates take a couple of days to
          appear. RaDVaC hosts this map but does not know all listed
          researchers personally.
        </p>
        <p>
          <em>All information is displayed publicly</em>, so you may use a
          non-personal identifier and a non-personal email address.
        </p>

        <h3 style={{ marginTop: 32 }}>Browse the map</h3>
        <ResearchersMap />

        <h3 style={{ marginTop: 32 }}>Add yourself to the map</h3>
        <ResearcherSignupForm />
      </div>
    </section>
  );
}
