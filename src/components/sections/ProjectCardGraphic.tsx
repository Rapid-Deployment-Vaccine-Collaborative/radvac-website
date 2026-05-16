"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildH2O2Bottle,
  buildNasalSpray,
  buildPills,
  buildTestTube,
  type Built,
} from "./swissCheese/objects";

export type ProjectGraphicKind = "tube" | "pills" | "h2o2" | "nasal";

type Built3D = Built & {
  // Camera framing tuned per object so each one fills a similar visual
  // footprint at 140px square.
  cameraDistance: number;
  cameraY: number;
  lookY: number;
  autoSpinY: number; // radians/sec (Y-axis auto-rotate, 0 = none)
};

function buildForKind(kind: ProjectGraphicKind, scene: THREE.Scene): Built3D {
  if (kind === "tube") {
    const t = buildTestTube();
    t.placeSurfaceInGroup();
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
  if (kind === "nasal") {
    const n = buildNasalSpray();
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
    // Pills already animate via update(); a slow auto-spin would feel busy.
    autoSpinY: 0,
  };
}

export default function ProjectCardGraphic({
  kind,
}: {
  kind: ProjectGraphicKind;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;

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
      style={{ width: 140, height: 140, flex: "0 0 140px" }}
    />
  );
}
