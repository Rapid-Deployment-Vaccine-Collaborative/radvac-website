"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  buildH2O2Bottle,
  buildNasalSpray,
  buildPills,
  buildTestTube,
  type Built,
} from "./swissCheese/objects";

export type ProjectGraphicKind =
  | "tube"
  | "pills"
  | "h2o2"
  | "nasal"
  | "nasal-green";

type Built3D = Built & {
  cameraDistance: number;
  cameraY: number;
  lookY: number;
  autoSpinY: number;
};

function buildForKind(kind: ProjectGraphicKind, scene: THREE.Scene): Built3D {
  if (kind === "tube") {
    const t = buildTestTube();
    t.placeSurfaceInGroup();
    const fillY = 0.88;
    t.clipPlane.constant = fillY;
    t.surface.position.y = fillY;
    scene.add(t.group);
    return {
      ...t,
      cameraDistance: 2.4,
      cameraY: 0.6,
      lookY: 0.55,
      autoSpinY: 0.4,
    };
  }
  if (kind === "h2o2") {
    const h = buildH2O2Bottle();
    scene.add(h.group);
    return {
      ...h,
      cameraDistance: 2.2,
      cameraY: 0.5,
      lookY: 0.45,
      autoSpinY: 0.4,
    };
  }
  if (kind === "nasal" || kind === "nasal-green") {
    const liquidColor = kind === "nasal-green" ? 0xa7e8b0 : 0x9fd0f5;
    const n = buildNasalSpray(liquidColor);
    scene.add(n.group);
    return {
      ...n,
      cameraDistance: 2.7,
      cameraY: 0.7,
      lookY: 0.65,
      autoSpinY: 0.4,
    };
  }
  const p = buildPills();
  scene.add(p.group);
  return {
    ...p,
    cameraDistance: 2.7,
    cameraY: 0.35,
    lookY: 0.35,
    autoSpinY: 0,
  };
}

// ── Static SVG fallbacks (shown when WebGL is unavailable) ────────────────────

const WIRE = "#3a8ad8";
const AMBER = "#e8c83a";
const ROSE = "#e0556a";

function FallbackTube() {
  return (
    <svg width={140} height={140} viewBox="0 0 80 160" aria-hidden fill="none"
      stroke={WIRE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      style={{ display: "block" }}>
      <rect x="15" y="10" width="50" height="8" rx="3" />
      <path d="M 22 18 L 22 120 Q 22 148 40 148 Q 58 148 58 120 L 58 18" />
      <clipPath id="pcg-tube-clip">
        <path d="M 22 18 L 22 120 Q 22 148 40 148 Q 58 148 58 120 L 58 18 Z" />
      </clipPath>
      <rect x="22" y="73" width="36" height="75" fill={AMBER} fillOpacity={0.65}
        stroke="none" clipPath="url(#pcg-tube-clip)" />
      <line x1="22" y1="73" x2="58" y2="73" stroke={AMBER} strokeWidth={1.5} />
    </svg>
  );
}

function FallbackNasal({ green }: { green?: boolean }) {
  const liquid = green ? "#a7e8b0" : "#9fd0f5";
  return (
    <svg width={140} height={140} viewBox="0 0 80 140" aria-hidden fill="none"
      stroke={WIRE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      style={{ display: "block" }}>
      <rect x="22" y="48" width="36" height="78" rx="8" fill={liquid} fillOpacity={0.3} />
      <rect x="32" y="18" width="16" height="30" rx="4" />
      <path d="M 40 18 Q 40 8 55 8" strokeWidth={1.5} />
      <rect x="18" y="43" width="44" height="10" rx="3" fill={WIRE} fillOpacity={0.12} />
    </svg>
  );
}

function FallbackH2O2() {
  return (
    <svg width={140} height={140} viewBox="0 0 80 140" aria-hidden fill="none"
      stroke={WIRE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      style={{ display: "block" }}>
      {/* bottle body */}
      <path d="M 26 55 L 22 120 Q 22 135 40 135 Q 58 135 58 120 L 54 55 Z"
        fill={WIRE} fillOpacity={0.08} />
      {/* shoulder */}
      <path d="M 32 35 L 26 55 L 54 55 L 48 35 Z" fill={WIRE} fillOpacity={0.08} />
      {/* neck */}
      <rect x="32" y="18" width="16" height="17" rx="3" />
      {/* cap */}
      <rect x="28" y="12" width="24" height="8" rx="3" fill={ROSE} fillOpacity={0.3} stroke={ROSE} />
    </svg>
  );
}

function FallbackPills() {
  return (
    <svg width={140} height={140} viewBox="0 0 120 120" aria-hidden fill="none"
      stroke={WIRE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
      style={{ display: "block" }}>
      {/* three pills at angles */}
      <g transform="rotate(-30 40 55)">
        <rect x="20" y="45" width="40" height="20" rx="10" fill={ROSE} fillOpacity={0.2} />
        <line x1="40" y1="45" x2="40" y2="65" strokeWidth={1} />
      </g>
      <g transform="rotate(15 80 50)">
        <rect x="60" y="40" width="40" height="20" rx="10" fill={AMBER} fillOpacity={0.25} />
        <line x1="80" y1="40" x2="80" y2="60" strokeWidth={1} />
      </g>
      <g transform="rotate(-10 55 85)">
        <rect x="35" y="75" width="40" height="20" rx="10" fill={WIRE} fillOpacity={0.15} />
        <line x1="55" y1="75" x2="55" y2="95" strokeWidth={1} />
      </g>
    </svg>
  );
}

function Fallback({ kind }: { kind: ProjectGraphicKind }) {
  if (kind === "tube") return <FallbackTube />;
  if (kind === "nasal") return <FallbackNasal />;
  if (kind === "nasal-green") return <FallbackNasal green />;
  if (kind === "h2o2") return <FallbackH2O2 />;
  return <FallbackPills />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ProjectCardGraphic({
  kind,
}: {
  kind: ProjectGraphicKind;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [noWebGL, setNoWebGL] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;

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

    const built = buildForKind(kind, scene);
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
      if (built.autoSpinY) {
        built.group.rotation.y += built.autoSpinY * dt;
      }
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
    return <Fallback kind={kind} />;
  }

  return (
    <div
      ref={hostRef}
      aria-hidden
      style={{ width: 140, height: 140, flex: "0 0 140px" }}
    />
  );
}
