import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { Projects } from "@/components/sections/Projects";
import { Donate } from "@/components/sections/Donate";

export const metadata: Metadata = {
  description:
    "Radvac is a 501(c)(3) nonprofit developing rapid, open-source medical countermeasures and self-administered nasal vaccines.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="post-hero">
        <Mission />
        <Projects />
        <Team />
        <Donate />
      </div>
    </>
  );
}
