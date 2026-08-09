"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const SpreadGlobeInner = dynamic(() => import("./SpreadGlobeInner"), {
  ssr: false,
});

const FALLBACK_VIDEO_SRC = "/wp-content/uploads/2026/05/science-faster.webm";
const FIRST_FRAME_TIMEOUT_MS = 3500;

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

export default function SpreadGlobe({
  captions,
}: {
  /** Server-rendered overlay (the hero taglines h1) — see HeroTaglines. */
  captions?: React.ReactNode;
}) {
  const [fallback, setFallback] = useState(false);
  const firstFrame = useRef(false);

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
      {captions}
    </div>
  );
}
