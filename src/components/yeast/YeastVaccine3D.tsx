"use client";

// A size-flexible variant of ProjectCardGraphic for the yeast-vaccine hero.
// Reuses the same wireframe builders so the brand's 3D test tube ("vaccine
// factories in a tube") can appear at hero scale.

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildNasalSpray,
  buildTestTube,
  type Built,
} from "@/components/sections/swissCheese/objects";

export type Vaccine3DKind = "tube" | "nasal";

type Framed = Built & {
  cameraDistance: number;
  cameraY: number;
  lookY: number;
  autoSpinY: number;
};

function build(kind: Vaccine3DKind, scene: THREE.Scene): Framed {
  if (kind === "nasal") {
    const n = buildNasalSpray(0x9fd0f5);
    scene.add(n.group);
    return { ...n, cameraDistance: 2.7, cameraY: 0.7, lookY: 0.65, autoSpinY: 0.45 };
  }
  const t = buildTestTube();
  t.placeSurfaceInGroup();
  scene.add(t.group);
  return { ...t, cameraDistance: 2.4, cameraY: 0.6, lookY: 0.55, autoSpinY: 0.45 };
}

export default function YeastVaccine3D({
  kind = "tube",
  size = 220,
}: {
  kind?: Vaccine3DKind;
  size?: number;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof window === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
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
      renderer.render(scene, camera);
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
