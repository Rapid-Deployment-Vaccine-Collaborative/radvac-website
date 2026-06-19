"use client";

// A size-flexible variant of ProjectCardGraphic for the hero.
// Reuses the same wireframe builders so the brand's 3D test tube ("vaccine
// factories in a tube") can appear at hero scale. Falls back to a static SVG
// when WebGL is unavailable (e.g. hwaccel disabled).

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildNasalSpray,
  buildTestTube,
  type Built,
} from "@/components/sections/swissCheese/objects";

export type BFIAT3DKind = "tube" | "nasal";

type Framed = Built & {
  cameraDistance: number;
  cameraY: number;
  lookY: number;
  autoSpinY: number;
};

function build(kind: BFIAT3DKind, scene: THREE.Scene): Framed {
  if (kind === "nasal") {
    const n = buildNasalSpray(0x9fd0f5);
    scene.add(n.group);
    return { ...n, cameraDistance: 2.7, cameraY: 0.7, lookY: 0.65, autoSpinY: 0.45 };
  }
  const t = buildTestTube();
  t.placeSurfaceInGroup();
  const fillY = 0.88;
  t.clipPlane.constant = fillY;
  t.surface.position.y = fillY;
  scene.add(t.group);
  return { ...t, cameraDistance: 2.4, cameraY: 0.6, lookY: 0.55, autoSpinY: 0.45 };
}

// Static SVG test tube — shown when WebGL is unavailable.
function TubeSVG({ size }: { size: number }) {
  const WIRE = "#3a8ad8";
  const AMBER = "#e8c83a";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 160"
      aria-hidden="true"
      style={{ display: "block" }}
      fill="none"
      stroke={WIRE}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* rim */}
      <rect x="15" y="10" width="50" height="8" rx="3" stroke={WIRE} />
      {/* tube body */}
      <path d="M 22 18 L 22 120 Q 22 148 40 148 Q 58 148 58 120 L 58 18" />
      {/* liquid fill clipped to tube body (~65% full) */}
      <clipPath id="yv-tube-clip">
        <path d="M 22 18 L 22 120 Q 22 148 40 148 Q 58 148 58 120 L 58 18 Z" />
      </clipPath>
      <rect
        x="22" y="73" width="36" height="75"
        fill={AMBER} fillOpacity={0.65} stroke="none"
        clipPath="url(#yv-tube-clip)"
      />
      {/* surface line */}
      <line x1="22" y1="73" x2="58" y2="73" stroke={AMBER} strokeWidth={1.5} />
    </svg>
  );
}

// Static SVG nasal spray — shown when WebGL is unavailable.
function NasalSVG({ size }: { size: number }) {
  const WIRE = "#3a8ad8";
  const BLUE = "#9fd0f5";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 160"
      aria-hidden="true"
      style={{ display: "block" }}
      fill="none"
      stroke={WIRE}
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* bottle body */}
      <rect x="22" y="55" width="36" height="85" rx="8" fill={BLUE} fillOpacity={0.25} />
      {/* nozzle */}
      <rect x="32" y="20" width="16" height="35" rx="4" />
      <path d="M 40 20 Q 40 10 55 10" strokeWidth={1.5} />
      {/* pump cap */}
      <rect x="18" y="50" width="44" height="12" rx="3" fill={WIRE} fillOpacity={0.12} />
    </svg>
  );
}

export default function YeastBFIAT3D({
  kind = "tube",
  size = 220,
}: {
  kind?: BFIAT3DKind;
  size?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof window === "undefined") return;

    // Probe for WebGL before constructing THREE's renderer — THREE logs
    // and re-throws on failure, which surfaces as a Next.js dev-overlay
    // error on systems where WebGL is disabled (e.g. hwaccel off).
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      setNoWebGL(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      setNoWebGL(true);
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.localClippingEnabled = true;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(3, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa9c6ff, 0.35);
    fill.position.set(-5, -2, 3);
    scene.add(fill);

    const built = build(kind, scene);
    camera.position.set(0, built.cameraY, built.cameraDistance);
    camera.lookAt(0, built.lookY, 0);

    const setSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(el);

    let raf = 0;
    const start = performance.now();
    let last = start;
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      built.group.rotation.y += built.autoSpinY * dt;
      built.update(elapsed);
      try {
        renderer.render(scene, camera);
      } catch {
        cancelAnimationFrame(raf);
        setNoWebGL(true);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      built.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, [kind]);

  if (noWebGL) {
    return kind === "nasal"
      ? <NasalSVG size={size} />
      : <TubeSVG size={size} />;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{
        width: size,
        height: size,
        maxWidth: "100%",
        maxHeight: "100%",
      }}
    />
  );
}
