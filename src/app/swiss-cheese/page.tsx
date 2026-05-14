import type { Metadata } from "next";
import SwissCheeseScene from "@/components/sections/SwissCheeseSceneInner";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Swiss Cheese",
};

export default function SwissCheesePage() {
  return (
    <>
      <PageHeader
        title="Swiss Cheese"
        eyebrow="Test page"
        lede="An illustration of the layered defense model RaDVaC uses against respiratory pathogens."
      />
      <section className="section" style={{ paddingTop: 32 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <SwissCheeseScene />
        </div>
        <div />
        <div>
          <p className="section-lede" style={{ marginTop: 0 }}>
            No single intervention stops a respiratory pathogen on its own.
            Each layer — masks and UV, intranasal antibody sprays, oral
            antivirals, environmental controls, and adaptive immunity from
            vaccination — has gaps, but stacked together they make a
            successful infection improbable.
          </p>
          <p>
            This is sometimes called the <em>Swiss-cheese model</em>: each
            slice has holes, but holes are unlikely to line up across every
            slice at once. RaDVaC&rsquo;s open recipes target the immune layer;
            the other layers are equally important.
          </p>
        </div>
      </section>
    </>
  );
}
