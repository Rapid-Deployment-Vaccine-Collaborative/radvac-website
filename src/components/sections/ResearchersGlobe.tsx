"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState, type ReactNode } from "react";

const GlobeInner = dynamic(() => import("./ResearchersGlobeInner"), {
  ssr: false,
  loading: () => <Placeholder>Loading globe…</Placeholder>,
});

const MapInner = dynamic(() => import("./ResearchersMapInner"), {
  ssr: false,
  loading: () => <Placeholder>Loading map…</Placeholder>,
});

function Placeholder({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </div>
  );
}

function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext(
        "experimental-webgl",
      ) as WebGLRenderingContext | null);
    return !!gl;
  } catch {
    return false;
  }
}

type BoundaryProps = { children: ReactNode; fallback: ReactNode };
class GlobeErrorBoundary extends React.Component<
  BoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("3D globe failed; falling back to 2D map:", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default function ResearchersGlobe() {
  // "loading" is the SSR / pre-detection state. Once we mount client-side we
  // probe for WebGL and pick a renderer. WebGL fails silently when hardware
  // acceleration is disabled in the browser — we fall back to the 2D map.
  const [mode, setMode] = useState<"loading" | "globe" | "map">("loading");

  useEffect(() => {
    setMode(hasWebGL() ? "globe" : "map");
  }, []);

  if (mode === "loading") {
    return <Placeholder>Loading…</Placeholder>;
  }
  if (mode === "map") {
    return <MapInner />;
  }
  return (
    <GlobeErrorBoundary fallback={<MapInner />}>
      <GlobeInner />
    </GlobeErrorBoundary>
  );
}
