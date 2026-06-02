"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SpreadGlobeInner = dynamic(() => import("./SpreadGlobeInner"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        color: "var(--ink-soft)",
      }}
    >
      Loading…
    </div>
  ),
});

const TOP_LEFT = "Pathogens move fast …";
const BOTTOM_RIGHT = "Science can move faster.";
const TOP_START_MS = 500;
const BOTTOM_START_MS = 3500;
const TYPE_INTERVAL_MS = 45;

function useTypedText(target: string, startMs: number, intervalMs: number) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        let i = 0;
        const step = () => {
          if (cancelled) return;
          i++;
          setCount(i);
          if (i < target.length) timers.push(setTimeout(step, intervalMs));
        };
        timers.push(setTimeout(step, intervalMs));
      }, startMs),
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [target, startMs, intervalMs]);
  return target.slice(0, count);
}

const captionBase: React.CSSProperties = {
  position: "absolute",
  fontSize: "clamp(14px, 1.8vw, 22px)",
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: "var(--ink, #1a1a1a)",
  pointerEvents: "none",
  maxWidth: "45%",
  lineHeight: 1.2,
};

export default function SpreadGlobe() {
  const top = useTypedText(TOP_LEFT, TOP_START_MS, TYPE_INTERVAL_MS);
  const bottom = useTypedText(BOTTOM_RIGHT, BOTTOM_START_MS, TYPE_INTERVAL_MS);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <SpreadGlobeInner />
      <div style={{ ...captionBase, top: "6%", left: "5%" }}>{top}</div>
      <div
        style={{
          ...captionBase,
          bottom: "6%",
          right: "5%",
          textAlign: "right",
        }}
      >
        {bottom}
      </div>
    </div>
  );
}
