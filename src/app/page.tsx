import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Team } from "@/components/sections/Team";
import { Projects } from "@/components/sections/Projects";
import { Donate } from "@/components/sections/Donate";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="post-hero">
        <Mission />
        <Team />
        <Projects />
        <Donate />
      </div>
    </>
  );
}
