import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "AI for Antivirals",
  description:
    "Leveraging AI and open-source data to repurpose existing drugs and design powerful antiviral combinations.",
};

export default function AiForAntiviralsPage() {
  return (
    <>
      <PageHeader title="AI for Antivirals" />

      <section className="py-16 px-6">
        <div className="max-w-[800px] mx-auto prose prose-lg">
          <p>
            We are leveraging advances in open-source data and AI to repurpose
            existing drugs and GRAS compounds as antivirals, and to combine
            several weak antivirals into powerful combinations.
          </p>
          <p>
            <em>More details coming soon.</em>
          </p>
        </div>
      </section>
    </>
  );
}
