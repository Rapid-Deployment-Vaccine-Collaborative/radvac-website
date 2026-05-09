"use client";

import dynamic from "next/dynamic";

const ResearchersMapInner = dynamic(() => import("./ResearchersMapInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "60vh",
        minHeight: 480,
        display: "grid",
        placeItems: "center",
        color: "var(--ink-soft)",
      }}
    >
      Loading map…
    </div>
  ),
});

export default function ResearchersMap() {
  return <ResearchersMapInner />;
}
