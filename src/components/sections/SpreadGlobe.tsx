"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "./SpreadGlobe.module.css";

const SpreadGlobeInner = dynamic(() => import("./SpreadGlobeInner"), {
  ssr: false,
});

const FALLBACK_VIDEO_SRC = "/wp-content/uploads/2026/05/science-faster.webm";
const FIRST_FRAME_TIMEOUT_MS = 3500;

const TOP_LEFT = "Pathogens move fast.";
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

function VideoFallback() {
  return (
    <video
      autoPlay
      muted
      playsInline
      loop
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        background: "#000",
      }}
    >
      <source src={FALLBACK_VIDEO_SRC} type="video/webm" />
    </video>
  );
}

// True only when the browser exposes the APIs SpreadGlobeInner needs. Universal
// in modern browsers; this catches archaic ones / non-browser environments.
function globeIsSupported() {
  if (typeof window === "undefined") return false;
  if (typeof window.requestAnimationFrame !== "function") return false;
  if (typeof window.IntersectionObserver !== "function") return false;
  try {
    return !!document.createElement("canvas").getContext("2d");
  } catch {
    return false;
  }
}

export default function SpreadGlobe() {
  const [fallback, setFallback] = useState(false);
  const firstFrame = useRef(false);
  const top = useTypedText(TOP_LEFT, TOP_START_MS, TYPE_INTERVAL_MS);
  const bottom = useTypedText(BOTTOM_RIGHT, BOTTOM_START_MS, TYPE_INTERVAL_MS);

  useEffect(() => {
    if (!globeIsSupported()) {
      setFallback(true);
      return;
    }
    // If SpreadGlobeInner hasn't painted a frame by this deadline, assume the
    // canvas is wedged (broken hwaccel, blocked chunk, OOM, etc.) and swap.
    const t = setTimeout(() => {
      if (!firstFrame.current) setFallback(true);
    }, FIRST_FRAME_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  if (fallback) {
    return <VideoFallback />;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <SpreadGlobeInner
        onFirstFrame={() => {
          firstFrame.current = true;
        }}
        onTopoError={() => setFallback(true)}
      />
      <div className={`${styles.caption} ${styles.top}`}>{top}</div>
      <div className={`${styles.caption} ${styles.bottom}`}>{bottom}</div>
    </div>
  );
}
