import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { Projects } from "@/components/sections/Projects";
import { Papers } from "@/components/sections/Papers";
import { Donate } from "@/components/sections/Donate";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Mission />
      <Projects />
      <Papers />
      <Donate />
    </>
  );
}
