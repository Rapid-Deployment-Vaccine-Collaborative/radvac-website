"use client";

import dynamic from "next/dynamic";

const ResearchersGlobeInner = dynamic(() => import("./ResearchersGlobeInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "70vh",
        minHeight: 520,
        display: "grid",
        placeItems: "center",
        color: "var(--ink-soft)",
        background: "#04101f",
        borderRadius: 6,
        border: "1px solid var(--rule)",
      }}
    >
      Loading globe…
    </div>
  ),
});

export default function ResearchersGlobe() {
  return <ResearchersGlobeInner />;
}
