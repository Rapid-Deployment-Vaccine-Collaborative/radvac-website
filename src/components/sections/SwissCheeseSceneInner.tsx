"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./SwissCheeseScene.module.css";

const SLICES = [
  { layer: 1, title: ["N95 / UV-C"] },
  { layer: 2, title: ["NASAL SPRAY(S)"] },
  { layer: 3, title: ["ANTIVIRALS"] },
  { layer: 4, title: ["MODERNIZED", "VARIOLATION"] },
  { layer: 5, title: ["VACCINE FACTORIES", "IN A TUBE"] },
] as const;

// Slice dimensions (world units) — wide & tall, distributed holes
const SW = 4.0;
const SH = 7.0;
const SD = 0.22;
const SLICE_GAP = 3.7;
const SLICE_TILT_Y = -1.0; // radians (~57°), more edge-on view
const SLICE_TILT_X = Math.PI / 7; // mirror the mask box's downward tilt
const VIRUS_X = -6.0;

// Per-slice scatter holes distributed across the full slice area
// (x in [-SW/2, SW/2] = [-1.05, 1.05], y in [-SH/2, SH/2] = [-3.5, 3.5])
const SCATTER_HOLES: { x: number; y: number; r: number }[][] = [
  [
    { x: -0.65, y: 2.6, r: 0.18 },
    { x: 0.6, y: 2.9, r: 0.12 },
    { x: -0.5, y: 1.4, r: 0.22 },
    { x: 0.55, y: 0.9, r: 0.14 },
    { x: -0.7, y: -0.6, r: 0.16 },
    { x: 0.5, y: -1.2, r: 0.2 },
    { x: -0.55, y: -2.1, r: 0.13 },
    { x: 0.6, y: -2.7, r: 0.18 },
    { x: 0.0, y: -3.0, r: 0.1 },
  ],
  [
    { x: -0.7, y: 2.9, r: 0.15 },
    { x: 0.55, y: 2.4, r: 0.2 },
    { x: -0.6, y: 1.2, r: 0.13 },
    { x: 0.65, y: 1.6, r: 0.17 },
    { x: -0.5, y: -1.0, r: 0.16 },
    { x: 0.55, y: -0.5, r: 0.12 },
    { x: -0.7, y: -2.2, r: 0.18 },
    { x: 0.6, y: -2.8, r: 0.13 },
    { x: -0.15, y: 3.1, r: 0.09 },
  ],
  [
    { x: -0.65, y: 2.7, r: 0.14 },
    { x: 0.6, y: 3.1, r: 0.11 },
    { x: -0.55, y: 1.5, r: 0.18 },
    { x: 0.65, y: -0.7, r: 0.16 },
    { x: -0.6, y: -1.5, r: 0.13 },
    { x: 0.55, y: -2.1, r: 0.2 },
    { x: -0.5, y: -2.9, r: 0.14 },
    { x: 0.6, y: -3.0, r: 0.09 },
    { x: 0.1, y: 0.7, r: 0.11 },
  ],
  [
    { x: -0.6, y: 3.0, r: 0.17 },
    { x: 0.65, y: 2.3, r: 0.13 },
    { x: -0.55, y: 0.8, r: 0.11 },
    { x: 0.6, y: 1.3, r: 0.19 },
    { x: -0.65, y: -0.9, r: 0.14 },
    { x: 0.55, y: -1.8, r: 0.12 },
    { x: -0.5, y: -2.6, r: 0.18 },
    { x: 0.6, y: -3.1, r: 0.13 },
    { x: 0.0, y: 2.3, r: 0.08 },
  ],
  [
    { x: -0.7, y: 2.8, r: 0.14 },
    { x: 0.55, y: 3.0, r: 0.18 },
    { x: -0.55, y: 1.6, r: 0.12 },
    { x: 0.65, y: 0.6, r: 0.15 },
    { x: -0.6, y: -0.8, r: 0.13 },
    { x: 0.55, y: -1.6, r: 0.2 },
    { x: -0.6, y: -2.5, r: 0.11 },
    { x: 0.6, y: -2.9, r: 0.16 },
    { x: -0.1, y: -3.2, r: 0.09 },
  ],
];

function buildSliceShape(holes: { x: number; y: number; r: number }[]): THREE.Shape {
  const r = 0.18;
  const w = SW / 2;
  const h = SH / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-w + r, -h);
  shape.lineTo(w - r, -h);
  shape.quadraticCurveTo(w, -h, w, -h + r);
  shape.lineTo(w, h - r);
  shape.quadraticCurveTo(w, h, w - r, h);
  shape.lineTo(-w + r, h);
  shape.quadraticCurveTo(-w, h, -w, h - r);
  shape.lineTo(-w, -h + r);
  shape.quadraticCurveTo(-w, -h, -w + r, -h);
  for (const hole of holes) {
    const path = new THREE.Path();
    path.absarc(hole.x, hole.y, hole.r, 0, Math.PI * 2, false);
    shape.holes.push(path);
  }
  return shape;
}

function makeLabelSprite(
  layer: number,
  titleLines: readonly string[],
): { sprite: THREE.Sprite; dispose: () => void } {
  const W = 512;
  const H = 192;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  ctx.fillStyle = "#2a3550";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 56px ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";
  ctx.fillText(`LAYER ${layer}`, W / 2, 56);

  ctx.fillStyle = "#0e1a30";
  // Shrink title font until the widest line fits within the canvas width.
  const titleFontStack =
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";
  const MAX_TITLE_WIDTH = W - 24;
  let titleSize = 44;
  ctx.font = `700 ${titleSize}px ${titleFontStack}`;
  const widestLine = () =>
    Math.max(...titleLines.map((line) => ctx.measureText(line).width));
  while (widestLine() > MAX_TITLE_WIDTH && titleSize > 22) {
    titleSize -= 2;
    ctx.font = `700 ${titleSize}px ${titleFontStack}`;
  }
  const lineHeight = titleSize * 1.1;
  const titleCenterY = 138;
  const startY = titleCenterY - ((titleLines.length - 1) / 2) * lineHeight;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, startY + i * lineHeight);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.6, 0.6, 1);
  return {
    sprite,
    dispose: () => {
      tex.dispose();
      mat.dispose();
    },
  };
}

export default function SwissCheeseSceneInner() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Fallback when WebGL is unavailable (hardware acceleration off, headless
    // browsers, ancient devices). Keeps the rest of the page rendering instead
    // of throwing out of useEffect and tripping the global error boundary.
    const showFallback = () => {
      const note = document.createElement("div");
      note.textContent =
        "Your browser/setup doesn't support WebGL — try enabling hardware acceleration or use a different browser to view the Swiss cheese graphic.";
      note.style.cssText = [
        "position:absolute",
        "inset:0",
        "display:grid",
        "place-items:center",
        "padding:24px",
        "text-align:center",
        "color:var(--ink-soft,#475569)",
        "font-family:var(--sans,system-ui,sans-serif)",
        "font-size:14px",
        "line-height:1.5",
        "max-width:520px",
        "margin:0 auto",
      ].join(";");
      el.appendChild(note);
      return () => {
        if (note.parentNode === el) el.removeChild(note);
      };
    };

    // Pre-flight WebGL availability — try to get a context on a throwaway
    // canvas. Cheaper than catching a thrown WebGLRenderer constructor and
    // keeps us from having to clean up a half-built renderer.
    const probe = document.createElement("canvas");
    const probeCtx =
      probe.getContext("webgl2") ||
      probe.getContext("webgl") ||
      probe.getContext("experimental-webgl");
    if (!probeCtx) {
      return showFallback();
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(4.4, 1.8, 21);
    camera.lookAt(4.4, 1.8, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return showFallback();
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(3, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xa9c6ff, 0.35);
    fill.position.set(-5, -2, 3);
    scene.add(fill);

    // ---- Cheese slices (wireframe) ----
    const sliceLineMat = new THREE.LineBasicMaterial({
      color: 0xf6d020,
      transparent: true,
      opacity: 0.92,
    });
    const sliceFillMat = new THREE.MeshBasicMaterial({
      color: 0xf6d020,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    });

    const slicesGroup = new THREE.Group();
    const sliceDisposers: Array<() => void> = [
      () => sliceLineMat.dispose(),
      () => sliceFillMat.dispose(),
    ];
    const sliceContainers: THREE.Group[] = [];
    const sliceFillMeshes: THREE.Mesh[] = [];

    const firstSliceX = 0;
    SLICES.forEach((s, i) => {
      const holes = SCATTER_HOLES[i];
      const shape = buildSliceShape(holes);
      const geom = new THREE.ExtrudeGeometry(shape, {
        depth: SD,
        bevelEnabled: true,
        bevelThickness: 0.025,
        bevelSize: 0.025,
        bevelSegments: 2,
        curveSegments: 24,
      });
      // ExtrudeGeometry centers along XY but extrudes along +Z. Recenter on Z.
      geom.translate(0, 0, -SD / 2);
      // EdgesGeometry strips internal triangulation, keeping only outlines +
      // corner bevels + hole rims + connecting edges between front and back.
      const edgeGeom = new THREE.EdgesGeometry(geom, 20);

      const fillMesh = new THREE.Mesh(geom, sliceFillMat);
      const wireMesh = new THREE.LineSegments(edgeGeom, sliceLineMat);

      const sliceContainer = new THREE.Group();
      sliceContainer.add(fillMesh);
      sliceContainer.add(wireMesh);
      sliceContainer.position.set(firstSliceX + i * SLICE_GAP, 0, 0);
      sliceContainer.rotation.y = SLICE_TILT_Y;
      slicesGroup.add(sliceContainer);
      sliceContainers.push(sliceContainer);
      sliceFillMeshes.push(fillMesh);

      // Label sprite below the slice
      const { sprite, dispose } = makeLabelSprite(s.layer, s.title);
      sprite.scale.set(3.0, 0.85, 1);
      sprite.position.set(
        firstSliceX + i * SLICE_GAP,
        -SH / 2 - 1.6,
        0.05,
      );
      slicesGroup.add(sprite);
      sliceDisposers.push(
        dispose,
        () => geom.dispose(),
        () => edgeGeom.dispose(),
      );
    });
    slicesGroup.rotation.x = SLICE_TILT_X;
    scene.add(slicesGroup);

    // ---- Layer-2 nasal spray bottle (wireframe, rotating) ----
    const sprayBottleGroup = new THREE.Group();
    const layer2X = firstSliceX + 1 * SLICE_GAP;
    sprayBottleGroup.position.set(layer2X, SH / 2 + 0.55, 0);
    sprayBottleGroup.scale.setScalar(1.5);
    // Initial pose: tilt the bottle's top slightly toward the camera so the
    // viewer is looking a bit down onto it. Stays inside the ±15° clamp.
    sprayBottleGroup.rotation.x = Math.PI / 18;
    scene.add(sprayBottleGroup);

    const sprayLineMat = new THREE.LineBasicMaterial({
      color: 0x3a8ad8,
      transparent: true,
      opacity: 0.95,
    });
    const sprayBottleDisposers: Array<() => void> = [
      () => sprayLineMat.dispose(),
    ];

    // Bottle body — lathe-revolved spray-bottle silhouette (rounded base,
    // straight middle, shoulder narrowing to a slim neck)
    const bottleProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.17, 0.0),
      new THREE.Vector2(0.22, 0.06),
      new THREE.Vector2(0.24, 0.16),
      new THREE.Vector2(0.24, 0.62),
      new THREE.Vector2(0.22, 0.7),
      new THREE.Vector2(0.14, 0.8),
      new THREE.Vector2(0.1, 0.86),
    ];
    const bodyGeom = new THREE.LatheGeometry(bottleProfile, 12);
    const bodyWire = new THREE.WireframeGeometry(bodyGeom);
    sprayBottleGroup.add(new THREE.LineSegments(bodyWire, sprayLineMat));
    // Translucent white fill so the polygon sides read as frosted glass.
    const bodyFillMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    sprayBottleGroup.add(new THREE.Mesh(bodyGeom, bodyFillMat));
    sprayBottleDisposers.push(
      () => bodyGeom.dispose(),
      () => bodyWire.dispose(),
      () => bodyFillMat.dispose(),
    );

    // "FRIL" label on the front of the bottle — same canvas-texture treatment
    // as the N95 box: blue outline, white fill, mounted just outside the body.
    {
      const TW = 256;
      const TH = 128;
      const canvas = document.createElement("canvas");
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = TW * dpr;
      canvas.height = TH * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.font =
        "900 88px ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 9;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#3a8ad8";
      ctx.strokeText("FRIL", TW / 2, TH / 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("FRIL", TW / 2, TH / 2);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      const labelMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      // Curved label: an open cylinder section flush against the bottle wall,
      // so the lettering wraps like an actual bottle wrapper. Body radius is
      // ~0.24 in the cylindrical section (y ~0.16–0.62); sit the label a hair
      // outside it. theta=0 on CylinderGeometry points to +Z, so centering the
      // arc on -arc/2..+arc/2 puts the label on the front face.
      const LABEL_R = 0.242;
      const LABEL_H = 0.19;
      const LABEL_ARC = 0.38 / LABEL_R; // arc length matches prior flat width
      const labelGeom = new THREE.CylinderGeometry(
        LABEL_R,
        LABEL_R,
        LABEL_H,
        24,
        1,
        true,
        -LABEL_ARC / 2,
        LABEL_ARC,
      );
      const labelMesh = new THREE.Mesh(labelGeom, labelMat);
      labelMesh.position.set(0, 0.4, 0);
      sprayBottleGroup.add(labelMesh);
      sprayBottleDisposers.push(
        () => labelGeom.dispose(),
        () => labelMat.dispose(),
        () => tex.dispose(),
      );
    }

    // Pump cap — short cylinder sitting on the bottle neck
    const capGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.16, 16, 1, false);
    const capWire = new THREE.WireframeGeometry(capGeom);
    const cap = new THREE.LineSegments(capWire, sprayLineMat);
    const capCenterY = 0.86 + 0.08;
    cap.position.y = capCenterY;
    sprayBottleGroup.add(cap);
    sprayBottleDisposers.push(() => capGeom.dispose(), () => capWire.dispose());

    // Nozzle — tilted cylinder protruding forward from the cap
    const NOZZLE_TILT = -0.32;
    const NOZZLE_LEN = 0.24;
    const nozzleGeom = new THREE.CylinderGeometry(
      0.052,
      0.045,
      NOZZLE_LEN,
      12,
      1,
      false,
    );
    const nozzleWire = new THREE.WireframeGeometry(nozzleGeom);
    const nozzle = new THREE.LineSegments(nozzleWire, sprayLineMat);
    const nozzleCenterX = 0.04;
    const nozzleCenterY = capCenterY + 0.08 + (Math.cos(NOZZLE_TILT) * NOZZLE_LEN) / 2;
    nozzle.position.set(nozzleCenterX, nozzleCenterY, 0);
    nozzle.rotation.z = NOZZLE_TILT;
    sprayBottleGroup.add(nozzle);
    sprayBottleDisposers.push(
      () => nozzleGeom.dispose(),
      () => nozzleWire.dispose(),
    );

    // Spray particles — short line segments fanning from the nozzle tip
    const SPRAY_COUNT = 14;
    // Tip position (local to bottle group): nozzle center + half-length along
    // the rotated nozzle axis.
    const sprayDir = new THREE.Vector3(
      Math.sin(-NOZZLE_TILT),
      Math.cos(NOZZLE_TILT),
      0,
    ).normalize();
    const tipLocal = new THREE.Vector3(nozzleCenterX, nozzleCenterY, 0).add(
      sprayDir.clone().multiplyScalar(NOZZLE_LEN / 2),
    );
    // Two perpendicular axes used to fan the spray in a cone around sprayDir
    const sprayU = new THREE.Vector3(
      Math.cos(NOZZLE_TILT),
      -Math.sin(NOZZLE_TILT),
      0,
    );
    const sprayV = new THREE.Vector3(0, 0, 1);

    const sprayPositions: number[] = [];
    for (let i = 0; i < SPRAY_COUNT; i++) {
      const phi = (i / SPRAY_COUNT) * Math.PI * 2;
      const dist = 0.18 + Math.random() * 0.18;
      const spread = (0.18 + Math.random() * 0.12) * dist;
      const offset = sprayU
        .clone()
        .multiplyScalar(Math.cos(phi) * spread)
        .add(sprayV.clone().multiplyScalar(Math.sin(phi) * spread));
      const start = tipLocal.clone().add(sprayDir.clone().multiplyScalar(0.04));
      const end = tipLocal
        .clone()
        .add(sprayDir.clone().multiplyScalar(dist))
        .add(offset);
      sprayPositions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    }
    const sprayGeom = new THREE.BufferGeometry();
    sprayGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(sprayPositions, 3),
    );
    const sprayMat = new THREE.LineBasicMaterial({
      color: 0x6ab4ec,
      transparent: true,
      opacity: 0,
    });
    sprayBottleGroup.add(new THREE.LineSegments(sprayGeom, sprayMat));
    sprayBottleDisposers.push(
      () => sprayGeom.dispose(),
      () => sprayMat.dispose(),
    );

    // Invisible hit proxy so the raycaster can pick up the bottle (line
    // wireframes raycast poorly; a slightly oversized cylinder is forgiving).
    const bottleHitGeom = new THREE.CylinderGeometry(0.32, 0.32, 1.7, 12);
    const bottleHitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const bottleHitProxy = new THREE.Mesh(bottleHitGeom, bottleHitMat);
    bottleHitProxy.position.y = 0.7;
    sprayBottleGroup.add(bottleHitProxy);
    sprayBottleDisposers.push(
      () => bottleHitGeom.dispose(),
      () => bottleHitMat.dispose(),
    );

    // ---- Layer-1 N95 mask box (wireframe, draggable to spin) ----
    const maskGroup = new THREE.Group();
    const layer1X = firstSliceX + 0 * SLICE_GAP;
    maskGroup.position.set(layer1X, SH / 2 + 0.95, 0);
    maskGroup.scale.setScalar(1.4);
    // Initial pose: corner view from above-right, N95 face turned to the left.
    maskGroup.rotation.y = -Math.PI / 4;
    maskGroup.rotation.x = Math.PI / 7;
    scene.add(maskGroup);

    const maskLineMat = new THREE.LineBasicMaterial({
      color: 0x3a8ad8,
      transparent: true,
      opacity: 0.95,
    });
    const maskDisposers: Array<() => void> = [() => maskLineMat.dispose()];

    // Box dimensions
    const BOX_W = 1.4;
    const BOX_H = 0.8;
    const BOX_D = 0.7;

    // Open-top body: full box wireframe minus the top face. We build it by
    // hand so the lid can flap above without overlapping the body lines.
    const hx = BOX_W / 2;
    const hy = BOX_H / 2;
    const hz = BOX_D / 2;
    const boxLinePts: number[] = [];
    const addSeg = (a: [number, number, number], b: [number, number, number]) => {
      boxLinePts.push(...a, ...b);
    };
    // bottom rectangle
    addSeg([-hx, -hy, -hz], [hx, -hy, -hz]);
    addSeg([hx, -hy, -hz], [hx, -hy, hz]);
    addSeg([hx, -hy, hz], [-hx, -hy, hz]);
    addSeg([-hx, -hy, hz], [-hx, -hy, -hz]);
    // top opening rectangle
    addSeg([-hx, hy, -hz], [hx, hy, -hz]);
    addSeg([hx, hy, hz], [-hx, hy, hz]);
    addSeg([-hx, hy, hz], [-hx, hy, -hz]);
    addSeg([hx, hy, -hz], [hx, hy, hz]);
    // vertical edges
    addSeg([-hx, -hy, -hz], [-hx, hy, -hz]);
    addSeg([hx, -hy, -hz], [hx, hy, -hz]);
    addSeg([hx, -hy, hz], [hx, hy, hz]);
    addSeg([-hx, -hy, hz], [-hx, hy, hz]);
    const boxGeom = new THREE.BufferGeometry();
    boxGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(boxLinePts, 3),
    );
    maskGroup.add(new THREE.LineSegments(boxGeom, maskLineMat));
    maskDisposers.push(() => boxGeom.dispose());

    // Opaque very-light-white walls (front, back, left, right, bottom). The
    // lid is its own opaque panel added later inside the hinge group. Walls
    // sit just inside the wireframe so the blue edges render crisply on top.
    const WALL_INSET = 0.003;
    const wallMat = new THREE.MeshBasicMaterial({
      color: 0xdfeaf7,
      side: THREE.DoubleSide,
    });
    maskDisposers.push(() => wallMat.dispose());
    const addWall = (
      geom: THREE.PlaneGeometry,
      pos: [number, number, number],
      rot: [number, number, number],
    ) => {
      const mesh = new THREE.Mesh(geom, wallMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.set(rot[0], rot[1], rot[2]);
      maskGroup.add(mesh);
      maskDisposers.push(() => geom.dispose());
    };
    addWall(
      new THREE.PlaneGeometry(BOX_W, BOX_H),
      [0, 0, hz - WALL_INSET],
      [0, 0, 0],
    );
    addWall(
      new THREE.PlaneGeometry(BOX_W, BOX_H),
      [0, 0, -hz + WALL_INSET],
      [0, 0, 0],
    );
    addWall(
      new THREE.PlaneGeometry(BOX_D, BOX_H),
      [-hx + WALL_INSET, 0, 0],
      [0, Math.PI / 2, 0],
    );
    addWall(
      new THREE.PlaneGeometry(BOX_D, BOX_H),
      [hx - WALL_INSET, 0, 0],
      [0, Math.PI / 2, 0],
    );
    addWall(
      new THREE.PlaneGeometry(BOX_W, BOX_D),
      [0, -hy + WALL_INSET, 0],
      [Math.PI / 2, 0, 0],
    );

    // "N95" text on the front face — canvas texture with a blue outline and
    // white interior, mounted just in front of the front wall.
    {
      const TW = 256;
      const TH = 128;
      const canvas = document.createElement("canvas");
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = TW * dpr;
      canvas.height = TH * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);
      ctx.font =
        "900 96px ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 9;
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#3a8ad8";
      ctx.strokeText("N95", TW / 2, TH / 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillText("N95", TW / 2, TH / 2);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      const textMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
      });
      const textGeom = new THREE.PlaneGeometry(0.96, 0.48);
      const textMesh = new THREE.Mesh(textGeom, textMat);
      textMesh.position.set(0, 0, hz + 0.004);
      maskGroup.add(textMesh);
      maskDisposers.push(
        () => textGeom.dispose(),
        () => textMat.dispose(),
        () => tex.dispose(),
      );
    }

    // A few stylized masks peeking out of the open top — each a small curved
    // line segment (arc) inside the box.
    for (let i = 0; i < 5; i++) {
      const pts: THREE.Vector3[] = [];
      const baseY = hy - 0.04 - i * 0.06;
      const xc = (Math.random() - 0.5) * 0.4;
      const zc = (Math.random() - 0.5) * 0.3;
      const tilt = (Math.random() - 0.5) * 0.3;
      const halfW = 0.28;
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const x = xc + (u - 0.5) * 2 * halfW;
        const y = baseY + Math.sin(u * Math.PI) * 0.07 + tilt * (u - 0.5);
        const z = zc + Math.cos(u * Math.PI) * 0.04;
        pts.push(new THREE.Vector3(x, y, z));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      maskGroup.add(new THREE.Line(g, maskLineMat));
      maskDisposers.push(() => g.dispose());
    }

    // Lid — a hinged flap at the back top edge that flaps slightly.
    const lidHinge = new THREE.Group();
    lidHinge.position.set(0, hy, -hz);
    maskGroup.add(lidHinge);
    const lidPts: number[] = [];
    const addLid = (
      a: [number, number, number],
      b: [number, number, number],
    ) => {
      lidPts.push(...a, ...b);
    };
    // Rectangle in the lid's local frame: hinge along z=0, extending toward +Z
    // (forward when closed). Slight thickness omitted for visual lightness.
    addLid([-hx, 0, 0], [hx, 0, 0]);
    addLid([hx, 0, 0], [hx, 0, BOX_D]);
    addLid([hx, 0, BOX_D], [-hx, 0, BOX_D]);
    addLid([-hx, 0, BOX_D], [-hx, 0, 0]);
    const lidGeom = new THREE.BufferGeometry();
    lidGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(lidPts, 3),
    );
    lidHinge.add(new THREE.LineSegments(lidGeom, maskLineMat));
    maskDisposers.push(() => lidGeom.dispose());

    // Opaque lid panel — sits just below the wireframe rectangle so blue edges
    // render on top. Plane is in the lid's local XZ plane (rotated -90° on X).
    const lidPanelGeom = new THREE.PlaneGeometry(BOX_W, BOX_D);
    const lidPanel = new THREE.Mesh(lidPanelGeom, wallMat);
    lidPanel.rotation.x = -Math.PI / 2;
    lidPanel.position.set(0, 0.003, BOX_D / 2);
    lidHinge.add(lidPanel);
    maskDisposers.push(() => lidPanelGeom.dispose());

    // Front tuck flap — perpendicular flap hinged off the lid's front (long)
    // edge, like a cardboard box's closing flap. Wireframe rectangle + opaque
    // panel. Lives in a subgroup so it follows the lid as it opens.
    const FLAP_H = 0.22;
    const flapHinge = new THREE.Group();
    flapHinge.position.set(0, 0, BOX_D);
    lidHinge.add(flapHinge);
    // Wireframe edges of the flap rectangle (in the flap's local XY plane,
    // hanging from y=0 down to y=-FLAP_H).
    const flapEdgePts: number[] = [];
    const addFlapSeg = (
      a: [number, number, number],
      b: [number, number, number],
    ) => {
      flapEdgePts.push(...a, ...b);
    };
    addFlapSeg([-hx, 0, 0], [hx, 0, 0]);
    addFlapSeg([hx, 0, 0], [hx, -FLAP_H, 0]);
    addFlapSeg([hx, -FLAP_H, 0], [-hx, -FLAP_H, 0]);
    addFlapSeg([-hx, -FLAP_H, 0], [-hx, 0, 0]);
    const flapEdgeGeom = new THREE.BufferGeometry();
    flapEdgeGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(flapEdgePts, 3),
    );
    flapHinge.add(new THREE.LineSegments(flapEdgeGeom, maskLineMat));
    maskDisposers.push(() => flapEdgeGeom.dispose());
    // Opaque flap panel, centered between y=0 and y=-FLAP_H.
    const flapPanelGeom = new THREE.PlaneGeometry(BOX_W, FLAP_H);
    const flapPanel = new THREE.Mesh(flapPanelGeom, wallMat);
    flapPanel.position.set(0, -FLAP_H / 2, 0.001);
    flapHinge.add(flapPanel);
    maskDisposers.push(() => flapPanelGeom.dispose());

    // Invisible hit proxy so the raycaster picks the box reliably.
    const maskHitGeom = new THREE.BoxGeometry(BOX_W * 1.05, BOX_H * 1.4, BOX_D * 1.05);
    const maskHitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const maskHitProxy = new THREE.Mesh(maskHitGeom, maskHitMat);
    maskHitProxy.position.y = 0.1;
    maskGroup.add(maskHitProxy);
    maskDisposers.push(
      () => maskHitGeom.dispose(),
      () => maskHitMat.dispose(),
    );

    // ---- Layer-3 antivirals: a couple of wireframe pills (capsules) ----
    const pillsGroup = new THREE.Group();
    const layer3X = firstSliceX + 2 * SLICE_GAP;
    pillsGroup.position.set(layer3X, SH / 2 + 0.95, 0);
    pillsGroup.scale.setScalar(1.4);
    scene.add(pillsGroup);

    const pillLineMat = new THREE.LineBasicMaterial({
      color: 0x3a8ad8,
      transparent: true,
      opacity: 0.95,
    });
    const pillDisposers: Array<() => void> = [() => pillLineMat.dispose()];

    type PillState = {
      mesh: THREE.LineSegments;
      baseX: number;
      baseY: number;
      baseRotZ: number;
      phase: number;
    };
    const pills: PillState[] = [];

    const pillSpecs = [
      { baseX: -0.45, baseY: 0.05, baseRotZ: 0.35, phase: 0, fill: 0xf2a93a },
      { baseX: 0.45, baseY: -0.05, baseRotZ: -0.5, phase: 1.7, fill: 0xe04545 },
      { baseX: 0.0, baseY: 0.7, baseRotZ: -0.15, phase: 3.1, fill: 0x4ac572 },
    ];

    for (const spec of pillSpecs) {
      const capGeom = new THREE.CapsuleGeometry(0.16, 0.42, 6, 14);
      const capWire = new THREE.WireframeGeometry(capGeom);
      const pill = new THREE.LineSegments(capWire, pillLineMat);
      pill.position.set(spec.baseX, spec.baseY, 0);
      pill.rotation.z = spec.baseRotZ;
      // Semi-transparent solid fill sitting just inside the wireframe so each
      // pill reads as a colored capsule. Parented to the wireframe so it
      // inherits the per-pill shake/rotation.
      const fillGeom = new THREE.CapsuleGeometry(0.155, 0.41, 6, 14);
      const fillMat = new THREE.MeshBasicMaterial({
        color: spec.fill,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      });
      pill.add(new THREE.Mesh(fillGeom, fillMat));
      pillsGroup.add(pill);
      pills.push({
        mesh: pill,
        baseX: spec.baseX,
        baseY: spec.baseY,
        baseRotZ: spec.baseRotZ,
        phase: spec.phase,
      });
      pillDisposers.push(
        () => capGeom.dispose(),
        () => capWire.dispose(),
        () => fillGeom.dispose(),
        () => fillMat.dispose(),
      );
    }

    // Invisible hit proxy so the raycaster can pick the pills as a group
    const pillsHitGeom = new THREE.BoxGeometry(1.6, 1.0, 0.6);
    const pillsHitMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pillsHitProxy = new THREE.Mesh(pillsHitGeom, pillsHitMat);
    pillsGroup.add(pillsHitProxy);
    pillDisposers.push(
      () => pillsHitGeom.dispose(),
      () => pillsHitMat.dispose(),
    );

    // ---- Layer-5 test tube (wireframe + semi-transparent liquid) ----
    const tubeGroup = new THREE.Group();
    const layer5X = firstSliceX + 4 * SLICE_GAP;
    tubeGroup.position.set(layer5X, SH / 2 + 0.45, 0);
    tubeGroup.scale.setScalar(1.3);
    scene.add(tubeGroup);

    const tubeLineMat = new THREE.LineBasicMaterial({
      color: 0x3a8ad8,
      transparent: true,
      opacity: 0.95,
    });
    const tubeDisposers: Array<() => void> = [() => tubeLineMat.dispose()];

    // Tube body — lathe with rounded closed bottom, straight cylindrical body,
    // and a small lip at the open top.
    const tubeProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.08, 0.02),
      new THREE.Vector2(0.14, 0.08),
      new THREE.Vector2(0.17, 0.18),
      new THREE.Vector2(0.18, 0.28),
      new THREE.Vector2(0.18, 1.15),
      new THREE.Vector2(0.2, 1.2),
      new THREE.Vector2(0.2, 1.25),
    ];
    const tubeBodyGeom = new THREE.LatheGeometry(tubeProfile, 20);
    const tubeBodyWire = new THREE.WireframeGeometry(tubeBodyGeom);
    tubeGroup.add(new THREE.LineSegments(tubeBodyWire, tubeLineMat));
    tubeDisposers.push(
      () => tubeBodyGeom.dispose(),
      () => tubeBodyWire.dispose(),
    );

    // Liquid — a tall amber column that tilts together with the tube, then
    // clipped by a world-horizontal plane at the intended fill height so the
    // top surface always reads as flat & level no matter how the tube tilts.
    // The lathe is intentionally taller than the visible fill line (extends
    // well past it) so the clip cleanly trims it on every side under tilt.
    const LIQUID_FILL_LOCAL_Y = 0.3;
    const LIQUID_EXTENDED_TOP = 1.05; // safely past the tube lip under any tilt
    const liquidProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.07, 0.02),
      new THREE.Vector2(0.13, 0.08),
      new THREE.Vector2(0.16, 0.17),
      new THREE.Vector2(0.172, 0.26),
      new THREE.Vector2(0.172, LIQUID_EXTENDED_TOP),
      new THREE.Vector2(0.0, LIQUID_EXTENDED_TOP),
    ];
    const liquidGeom = new THREE.LatheGeometry(liquidProfile, 20);
    const liquidMat = new THREE.MeshBasicMaterial({
      color: 0xf0bf6e,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    // World-horizontal clip plane at the tube's intended fill height. Normal
    // points down so geometry *above* the plane is removed (kept: y < height).
    const liquidFillWorldY =
      tubeGroup.position.y + LIQUID_FILL_LOCAL_Y * tubeGroup.scale.y;
    const liquidClipPlane = new THREE.Plane(
      new THREE.Vector3(0, -1, 0),
      liquidFillWorldY,
    );
    liquidMat.clippingPlanes = [liquidClipPlane];
    liquidMat.clipShadows = false;
    tubeGroup.add(new THREE.Mesh(liquidGeom, liquidMat));
    const liquidWire = new THREE.WireframeGeometry(liquidGeom);
    const liquidWireMat = new THREE.LineBasicMaterial({
      color: 0xc78a35,
      transparent: true,
      opacity: 0.65,
    });
    liquidWireMat.clippingPlanes = [liquidClipPlane];
    liquidWireMat.clipShadows = false;
    tubeGroup.add(new THREE.LineSegments(liquidWire, liquidWireMat));

    // Flat horizontal disc that caps the clipped column — this is the visible
    // liquid surface. Parented to the scene (not the tube) and pinned to the
    // tube's world position at fill height so it stays world-level regardless
    // of how the tube is tilted.
    const liquidSurfaceGeom = new THREE.CircleGeometry(
      0.172 * tubeGroup.scale.x,
      24,
    );
    const liquidSurfaceMat = new THREE.MeshBasicMaterial({
      color: 0xf0bf6e,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const liquidSurface = new THREE.Mesh(liquidSurfaceGeom, liquidSurfaceMat);
    liquidSurface.rotation.x = -Math.PI / 2;
    liquidSurface.position.set(
      tubeGroup.position.x,
      liquidFillWorldY,
      tubeGroup.position.z,
    );
    scene.add(liquidSurface);
    tubeDisposers.push(
      () => liquidGeom.dispose(),
      () => liquidMat.dispose(),
      () => liquidWire.dispose(),
      () => liquidWireMat.dispose(),
      () => liquidSurfaceGeom.dispose(),
      () => liquidSurfaceMat.dispose(),
      () => scene.remove(liquidSurface),
    );

    // Invisible hit proxy so the raycaster can pick the tube reliably.
    const tubeHitGeom = new THREE.CylinderGeometry(0.26, 0.26, 1.3, 12);
    const tubeHitMat = new THREE.MeshBasicMaterial({
      visible: false,
      depthWrite: false,
    });
    const tubeHitProxy = new THREE.Mesh(tubeHitGeom, tubeHitMat);
    tubeHitProxy.position.y = 0.6;
    tubeGroup.add(tubeHitProxy);
    tubeDisposers.push(
      () => tubeHitGeom.dispose(),
      () => tubeHitMat.dispose(),
    );

    // ---- Animated arrow: probabilistic threading through slice holes ----
    // Each "shot" picks a random hole on each layer with a layer-specific pass
    // probability. If it passes, the arrow goes through and continues on a
    // diagonal toward the next slice's hole. If it fails, the arrow stops at
    // the slice surface and the shot ends. After the arrow plays out (or
    // splats), a brief pause, then a new shot is planned.
    const ARROW_TUBE_RADIUS = 0.06;
    const ARROW_TUBE_SEGMENTS = 240;
    const SHOT_DURATION = 3.5; // seconds for the arrow's traversal animation
    const SHOT_HOLD = 1.2; // seconds the finished arrow stays before next shot
    const SLICE_PASS_PROB = [0.8, 0.5, 0.5, 0.5, 0.5];

    const arrowMat = new THREE.MeshBasicMaterial({
      color: 0x3ddc7a,
      transparent: true,
      opacity: 0.94,
    });
    const arrowHeadGeom = new THREE.ConeGeometry(0.18, 0.45, 18);
    const arrowHead = new THREE.Mesh(arrowHeadGeom, arrowMat);
    arrowHead.visible = false;
    scene.add(arrowHead);
    const arrowUp = new THREE.Vector3(0, 1, 0);

    let shotMesh: THREE.Mesh | null = null;
    let shotGeom: THREE.TubeGeometry | null = null;
    let shotCurve: THREE.CatmullRomCurve3 | null = null;
    let shotStartTime = 0;

    const planShot = () => {
      // Slice container world matrices must reflect any user tilt
      slicesGroup.updateMatrixWorld(true);

      const waypoints: THREE.Vector3[] = [];
      // Start point: just in front of the virus, on the central axis
      waypoints.push(new THREE.Vector3(VIRUS_X + 1.1, 0, 0.0));

      let passedAll = true;
      for (let i = 0; i < 5; i++) {
        const sc = sliceContainers[i];
        const passes = Math.random() < SLICE_PASS_PROB[i];
        if (passes) {
          const holes = SCATTER_HOLES[i];
          const hole = holes[Math.floor(Math.random() * holes.length)];
          // Two waypoints per hole — entry just outside the front face
          // (virus-facing, local +Z side after the slice's Y tilt) and exit
          // just outside the back face — to force the curve straight through
          // the hole along the slice's local Z axis.
          const entry = sc.localToWorld(
            new THREE.Vector3(hole.x, hole.y, SD / 2 + 0.08),
          );
          const exit = sc.localToWorld(
            new THREE.Vector3(hole.x, hole.y, -SD / 2 - 0.08),
          );
          waypoints.push(entry, exit);
        } else {
          // Blocked: splat on a random spot of the slice's front face
          const localX = (Math.random() - 0.5) * SW * 0.7;
          const localY = (Math.random() - 0.5) * SH * 0.75;
          const splat = sc.localToWorld(
            new THREE.Vector3(localX, localY, SD / 2 + 0.04),
          );
          waypoints.push(splat);
          passedAll = false;
          break;
        }
      }

      if (passedAll) {
        waypoints.push(
          new THREE.Vector3(firstSliceX + 4 * SLICE_GAP + 1.8, 0, 0.0),
        );
      }

      shotCurve = new THREE.CatmullRomCurve3(waypoints);
      shotGeom = new THREE.TubeGeometry(
        shotCurve,
        ARROW_TUBE_SEGMENTS,
        ARROW_TUBE_RADIUS,
        12,
        false,
      );
      shotGeom.setDrawRange(0, 0);
      shotMesh = new THREE.Mesh(shotGeom, arrowMat);
      scene.add(shotMesh);
    };

    const disposeCurrentShot = () => {
      if (shotMesh) scene.remove(shotMesh);
      shotGeom?.dispose();
      shotMesh = null;
      shotGeom = null;
      shotCurve = null;
    };

    planShot();
    shotStartTime = performance.now() / 1000;

    // ---- Virus ----
    const virusGroup = new THREE.Group();
    virusGroup.position.set(VIRUS_X, 0, 0);
    virusGroup.scale.setScalar(0.75);
    scene.add(virusGroup);

    const SHELL_R = 0.78;
    const virusDisposers: Array<() => void> = [];

    // Outer wireframe shell (dense red mesh)
    const shellGeom = new THREE.IcosahedronGeometry(SHELL_R, 3);
    const shellWire = new THREE.WireframeGeometry(shellGeom);
    const shellMat = new THREE.LineBasicMaterial({
      color: 0xdc2f3a,
      transparent: true,
      opacity: 0.85,
    });
    virusGroup.add(new THREE.LineSegments(shellWire, shellMat));
    virusDisposers.push(
      () => shellGeom.dispose(),
      () => shellWire.dispose(),
      () => shellMat.dispose(),
    );

    // Faint translucent membrane to give the shell some "body"
    const membraneGeom = new THREE.SphereGeometry(SHELL_R * 0.985, 48, 32);
    const membraneMat = new THREE.MeshBasicMaterial({
      color: 0xff8a90,
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    });
    virusGroup.add(new THREE.Mesh(membraneGeom, membraneMat));
    virusDisposers.push(
      () => membraneGeom.dispose(),
      () => membraneMat.dispose(),
    );

    // Inner icosahedral capsid (cyan) — the genome shell
    const coreGeom = new THREE.IcosahedronGeometry(0.34, 1);
    const coreWire = new THREE.WireframeGeometry(coreGeom);
    const coreMat = new THREE.LineBasicMaterial({
      color: 0x6ec5ff,
      transparent: true,
      opacity: 0.7,
    });
    virusGroup.add(new THREE.LineSegments(coreWire, coreMat));
    const coreFillGeom = new THREE.IcosahedronGeometry(0.335, 1);
    const coreFillMat = new THREE.MeshBasicMaterial({
      color: 0x4aa8ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    virusGroup.add(new THREE.Mesh(coreFillGeom, coreFillMat));
    virusDisposers.push(
      () => coreGeom.dispose(),
      () => coreWire.dispose(),
      () => coreMat.dispose(),
      () => coreFillGeom.dispose(),
      () => coreFillMat.dispose(),
    );

    // ---- Spike proteins (trimer caps on stalks) ----
    const N_SPIKES = 38;
    const STALK_LEN = 0.22;
    const stalkProtoGeom = new THREE.CylinderGeometry(
      0.08,
      0.05,
      STALK_LEN,
      10,
      2,
      false,
    );
    const stalkProtoWire = new THREE.WireframeGeometry(stalkProtoGeom);
    // S1 head: club/bulb profile revolved around the spike axis. Narrow at the
    // neck (where it meets the stalk), bulges through the middle (ectodomain
    // belt), tapers to a small apex. Matches the SARS-CoV-2 silhouette far
    // better than a sphere. The lathe's local Y axis is the spike axis.
    const HEAD_HEIGHT = 0.27;
    const headProfile = [
      new THREE.Vector2(0.045, 0.0),
      new THREE.Vector2(0.09, 0.025),
      new THREE.Vector2(0.135, 0.06),
      new THREE.Vector2(0.16, 0.105),
      new THREE.Vector2(0.16, 0.155),
      new THREE.Vector2(0.14, 0.2),
      new THREE.Vector2(0.105, 0.235),
      new THREE.Vector2(0.06, 0.26),
      new THREE.Vector2(0.0, HEAD_HEIGHT),
    ];
    const headProtoGeom = new THREE.LatheGeometry(headProfile, 16);
    const headProtoWire = new THREE.WireframeGeometry(headProtoGeom);
    const headFillProfile = headProfile.map(
      (p) => new THREE.Vector2(p.x * 0.96, p.y * 0.99),
    );
    const spikeHeadFillGeom = new THREE.LatheGeometry(headFillProfile, 16);
    // RBD-like trimer subunit: elongated teardrop (prolate), not a marble
    const LOBE_HEIGHT = 0.19;
    const lobeProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.03, 0.025),
      new THREE.Vector2(0.055, 0.07),
      new THREE.Vector2(0.06, 0.115),
      new THREE.Vector2(0.045, 0.155),
      new THREE.Vector2(0.022, 0.18),
      new THREE.Vector2(0.0, LOBE_HEIGHT),
    ];
    const lobeProtoGeom = new THREE.LatheGeometry(lobeProfile, 12);
    const lobeProtoWire = new THREE.WireframeGeometry(lobeProtoGeom);
    const spikeMat = new THREE.LineBasicMaterial({
      color: 0xff4a52,
      transparent: true,
      opacity: 0.95,
    });
    const spikeHeadFillMat = new THREE.MeshBasicMaterial({
      color: 0xc41e2a,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    virusDisposers.push(
      () => stalkProtoGeom.dispose(),
      () => stalkProtoWire.dispose(),
      () => headProtoGeom.dispose(),
      () => headProtoWire.dispose(),
      () => lobeProtoGeom.dispose(),
      () => lobeProtoWire.dispose(),
      () => spikeMat.dispose(),
      () => spikeHeadFillGeom.dispose(),
      () => spikeHeadFillMat.dispose(),
    );

    const yAxis = new THREE.Vector3(0, 1, 0);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N_SPIKES; i++) {
      const y = 1 - (i / (N_SPIKES - 1)) * 2;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const dir = new THREE.Vector3(
        Math.cos(theta) * radial,
        y,
        Math.sin(theta) * radial,
      );
      const q = new THREE.Quaternion().setFromUnitVectors(yAxis, dir);

      // Stalk
      const stalk = new THREE.LineSegments(stalkProtoWire, spikeMat);
      stalk.quaternion.copy(q);
      stalk.position.copy(dir).multiplyScalar(SHELL_R + STALK_LEN / 2);
      virusGroup.add(stalk);

      // Club-shaped S1 head: LatheGeometry's local origin is at the base of
      // the profile, so positioning it at the top of the stalk makes the head
      // sit naturally on the stalk like a mushroom cap.
      const HEAD_BASE_R = SHELL_R + STALK_LEN;
      const headFill = new THREE.Mesh(spikeHeadFillGeom, spikeHeadFillMat);
      headFill.position.copy(dir).multiplyScalar(HEAD_BASE_R);
      headFill.quaternion.copy(q);
      virusGroup.add(headFill);

      const head = new THREE.LineSegments(headProtoWire, spikeMat);
      head.quaternion.copy(q);
      head.position.copy(dir).multiplyScalar(HEAD_BASE_R);
      virusGroup.add(head);

      // Build a perpendicular basis around `dir` for the trimer cap
      const tmp =
        Math.abs(dir.y) < 0.9
          ? new THREE.Vector3(0, 1, 0)
          : new THREE.Vector3(1, 0, 0);
      const u = new THREE.Vector3().crossVectors(dir, tmp).normalize();
      const v = new THREE.Vector3().crossVectors(dir, u).normalize();
      // Per-spike random orientation so trimers don't all line up
      const phase = (i * 1.318) % (Math.PI * 2);
      // Three RBD lobes splayed at the apex. Bases sit slightly inside the
      // head's belt; each lobe points outward + slightly outward laterally so
      // the three teardrops fan apart like petals of the trimer crown.
      const LOBE_BASE_R = SHELL_R + STALK_LEN + HEAD_HEIGHT * 0.55;
      const lobeLateral = 0.05;
      const lobeTilt = 0.35; // radians, lean outward from the spike axis
      for (let l = 0; l < 3; l++) {
        const lobeAngle = phase + (l / 3) * Math.PI * 2;
        const lateralDir = u
          .clone()
          .multiplyScalar(Math.cos(lobeAngle))
          .add(v.clone().multiplyScalar(Math.sin(lobeAngle)));
        // Each lobe's local Y points outward from the trimer axis, tilted
        // away from `dir` by lobeTilt. Compose dir + lateral component.
        const lobeAxis = dir
          .clone()
          .multiplyScalar(Math.cos(lobeTilt))
          .add(lateralDir.clone().multiplyScalar(Math.sin(lobeTilt)))
          .normalize();
        const lobeQ = new THREE.Quaternion().setFromUnitVectors(yAxis, lobeAxis);
        const lobe = new THREE.LineSegments(lobeProtoWire, spikeMat);
        lobe.quaternion.copy(lobeQ);
        lobe.position
          .copy(dir)
          .multiplyScalar(LOBE_BASE_R)
          .add(lateralDir.multiplyScalar(lobeLateral));
        virusGroup.add(lobe);
      }
    }

    // Small membrane proteins / receptors scattered across the surface
    // (the green and blue specks studding the envelope in the reference)
    const speckGeom = new THREE.IcosahedronGeometry(0.022, 0);
    const speckWire = new THREE.WireframeGeometry(speckGeom);
    const speckMatGreen = new THREE.LineBasicMaterial({
      color: 0x6ee06b,
      transparent: true,
      opacity: 0.95,
    });
    const speckMatBlue = new THREE.LineBasicMaterial({
      color: 0x7fd3ff,
      transparent: true,
      opacity: 0.95,
    });
    virusDisposers.push(
      () => speckGeom.dispose(),
      () => speckWire.dispose(),
      () => speckMatGreen.dispose(),
      () => speckMatBlue.dispose(),
    );
    const N_SPECKS = 90;
    for (let s = 0; s < N_SPECKS; s++) {
      const y = 1 - (s / (N_SPECKS - 1)) * 2;
      const radial = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * s * 1.7 + 0.4;
      const sd = new THREE.Vector3(
        Math.cos(theta) * radial,
        y,
        Math.sin(theta) * radial,
      );
      const speck = new THREE.LineSegments(
        speckWire,
        s % 5 === 0 ? speckMatBlue : speckMatGreen,
      );
      speck.position.copy(sd).multiplyScalar(SHELL_R + 0.005);
      virusGroup.add(speck);
    }

    // Genome strands (small inner cyan particles)
    const rnaProtoGeom = new THREE.IcosahedronGeometry(0.06, 0);
    const rnaProtoWire = new THREE.WireframeGeometry(rnaProtoGeom);
    const rnaMat = new THREE.LineBasicMaterial({
      color: 0x9dd3ff,
      transparent: true,
      opacity: 0.65,
    });
    virusDisposers.push(
      () => rnaProtoGeom.dispose(),
      () => rnaProtoWire.dispose(),
      () => rnaMat.dispose(),
    );
    const rnaPositions: [number, number, number][] = [
      [0.18, 0.06, 0.12],
      [-0.16, 0.19, -0.07],
      [0.0, -0.2, 0.16],
      [-0.13, -0.1, -0.18],
      [0.17, -0.14, -0.05],
      [-0.05, 0.22, 0.05],
      [0.08, 0.0, -0.22],
      [-0.2, 0.0, 0.1],
    ];
    for (const [x, y, z] of rnaPositions) {
      const rna = new THREE.LineSegments(rnaProtoWire, rnaMat);
      rna.position.set(x, y, z);
      virusGroup.add(rna);
    }

    // ---- Resize handling ----
    const setSize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Pull camera back on narrow viewports so everything stays in frame
      const target = Math.max(19, 21 + Math.max(0, (1.8 - w / h) * 7));
      camera.position.z = target;
      camera.updateProjectionMatrix();
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(el);

    // ---- Pointer drag: virus spin, bottle spin, or slice tilt ----
    let userInteracted = false;
    let dragMode:
      | "none"
      | "virus"
      | "bottle"
      | "tube"
      | "maskBox"
      | "pills"
      | "slice" = "none";
    let lastX = 0;
    let lastY = 0;
    // Virus angular velocity (rad/frame) carried after release; decays via FRICTION.
    let velY = 0;
    let velX = 0;
    // Bottle has its own independent velocity so it can coast separately.
    let bottleVelY = 0;
    let bottleVelX = 0;
    // Test tube only tilts, no Y spin — single-axis coast velocity.
    let tubeVelX = 0;
    let maskBoxVelY = 0;
    // Extra shake added on top of the per-pill idle wiggle while the user is
    // dragging the pills. Decays back to 0 so they ease into the idle motion.
    let pillsShake = 0;
    const PILLS_SHAKE_MAX = 2.5;
    const PILLS_SHAKE_DECAY = 0.96;
    const FRICTION = 0.97;
    const VEL_STOP_EPSILON = 1e-5;
    const VIRUS_ROT_PER_PX = 0.005;
    const BOTTLE_ROT_PER_PX = 0.006;
    const TUBE_ROT_PER_PX = 0.006;
    // Bottle is clamped to ±15°; the tube swings further (±45°) so the user
    // can really tip it over and see the liquid stay level.
    const BOTTLE_TILT_LIMIT = Math.PI / 12;
    const TUBE_TILT_LIMIT = Math.PI / 4;
    const MASKBOX_ROT_PER_PX = 0.006;
    const SLICE_ROT_PER_PX = 0.004;
    // Clamp slice user-tilt so cheese stays at least mostly edge-on / vertical
    const SLICE_Y_MIN = SLICE_TILT_Y - 0.6;
    const SLICE_Y_MAX = SLICE_TILT_Y + 0.6;
    const SLICE_X_MIN = -0.45;
    const SLICE_X_MAX = 0.45;
    const canvasEl = renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    const pickTarget = (
      e: PointerEvent,
    ): "bottle" | "tube" | "maskBox" | "pills" | "slice" | "virus" => {
      const rect = canvasEl.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      // Props first so they win against the slices behind them
      const hits = raycaster.intersectObjects(
        [
          bottleHitProxy,
          tubeHitProxy,
          maskHitProxy,
          pillsHitProxy,
          ...sliceFillMeshes,
        ],
        false,
      );
      if (hits.length === 0) return "virus";
      const obj = hits[0].object;
      if (obj === bottleHitProxy) return "bottle";
      if (obj === tubeHitProxy) return "tube";
      if (obj === maskHitProxy) return "maskBox";
      if (obj === pillsHitProxy) return "pills";
      return "slice";
    };

    const onPointerDown = (e: PointerEvent) => {
      dragMode = pickTarget(e);
      if (dragMode === "virus") {
        userInteracted = true;
        // Catching the virus mid-spin cancels in-progress momentum so the
        // drag starts from a known-still state.
        velY = 0;
        velX = 0;
      } else if (dragMode === "bottle") {
        bottleVelY = 0;
        bottleVelX = 0;
      } else if (dragMode === "tube") {
        tubeVelX = 0;
      } else if (dragMode === "maskBox") {
        maskBoxVelY = 0;
      }
      lastX = e.clientX;
      lastY = e.clientY;
      canvasEl.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (dragMode === "none") return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (dragMode === "virus") {
        const stepY = dx * VIRUS_ROT_PER_PX;
        const stepX = dy * VIRUS_ROT_PER_PX;
        virusGroup.rotation.y += stepY;
        virusGroup.rotation.x += stepX;
        // Smooth a running estimate of recent angular velocity so the fling
        // feels reactive without being whipped around by a single fast event.
        velY = velY * 0.5 + stepY * 0.5;
        velX = velX * 0.5 + stepX * 0.5;
      } else if (dragMode === "bottle") {
        const stepY = dx * BOTTLE_ROT_PER_PX;
        sprayBottleGroup.rotation.y += stepY;
        bottleVelY = bottleVelY * 0.5 + stepY * 0.5;
        // Vertical drag tilts the bottle around X, clamped to ±15° so the
        // bottle stays clearly bottle-shaped.
        const stepX = dy * BOTTLE_ROT_PER_PX;
        const nextX = sprayBottleGroup.rotation.x + stepX;
        const clampedX = Math.max(
          -BOTTLE_TILT_LIMIT,
          Math.min(BOTTLE_TILT_LIMIT, nextX),
        );
        // Kill velocity if we hit the rail so momentum doesn't keep pushing.
        if (clampedX !== nextX) bottleVelX = 0;
        else bottleVelX = bottleVelX * 0.5 + stepX * 0.5;
        sprayBottleGroup.rotation.x = clampedX;
      } else if (dragMode === "tube") {
        // Tube only tilts — no Y spin.
        const stepX = dy * TUBE_ROT_PER_PX;
        const nextX = tubeGroup.rotation.x + stepX;
        const clampedX = Math.max(
          -TUBE_TILT_LIMIT,
          Math.min(TUBE_TILT_LIMIT, nextX),
        );
        if (clampedX !== nextX) tubeVelX = 0;
        else tubeVelX = tubeVelX * 0.5 + stepX * 0.5;
        tubeGroup.rotation.x = clampedX;
      } else if (dragMode === "maskBox") {
        const stepY = dx * MASKBOX_ROT_PER_PX;
        maskGroup.rotation.y += stepY;
        maskBoxVelY = maskBoxVelY * 0.5 + stepY * 0.5;
      } else if (dragMode === "pills") {
        // Pills don't spin — drag energy only feeds the shake/jitter.
        pillsShake = Math.min(
          PILLS_SHAKE_MAX,
          pillsShake + (Math.abs(dx) + Math.abs(dy)) * 0.04,
        );
      } else {
        // Apply the same delta to every slice container, then clamp so the
        // arrangement can't be tilted past a sensible range.
        for (const sc of sliceContainers) {
          sc.rotation.y = Math.min(
            SLICE_Y_MAX,
            Math.max(SLICE_Y_MIN, sc.rotation.y + dx * SLICE_ROT_PER_PX),
          );
          sc.rotation.x = Math.min(
            SLICE_X_MAX,
            Math.max(SLICE_X_MIN, sc.rotation.x + dy * SLICE_ROT_PER_PX),
          );
        }
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      dragMode = "none";
      if (canvasEl.hasPointerCapture(e.pointerId)) {
        canvasEl.releasePointerCapture(e.pointerId);
      }
    };
    canvasEl.addEventListener("pointerdown", onPointerDown);
    canvasEl.addEventListener("pointermove", onPointerMove);
    canvasEl.addEventListener("pointerup", onPointerUp);
    canvasEl.addEventListener("pointercancel", onPointerUp);

    // ---- Animation ----
    let raf = 0;
    const tick = () => {
      if (!userInteracted) {
        // Gentle baseline auto-rotation before the user has ever interacted.
        virusGroup.rotation.y += 0.006;
        virusGroup.rotation.x += 0.0022;
      } else if (dragMode !== "virus") {
        // Momentum coast: apply remaining velocity, then bleed it off.
        virusGroup.rotation.y += velY;
        virusGroup.rotation.x += velX;
        velY *= FRICTION;
        velX *= FRICTION;
        if (Math.abs(velY) < VEL_STOP_EPSILON) velY = 0;
        if (Math.abs(velX) < VEL_STOP_EPSILON) velX = 0;
      }
      // Bottle momentum coast (independent of virus)
      if (dragMode !== "bottle") {
        sprayBottleGroup.rotation.y += bottleVelY;
        bottleVelY *= FRICTION;
        if (Math.abs(bottleVelY) < VEL_STOP_EPSILON) bottleVelY = 0;
        // Tilt coast with the same ±15° clamp; zero velocity if it bottoms out.
        const nextX = sprayBottleGroup.rotation.x + bottleVelX;
        const clampedX = Math.max(
          -BOTTLE_TILT_LIMIT,
          Math.min(BOTTLE_TILT_LIMIT, nextX),
        );
        if (clampedX !== nextX) bottleVelX = 0;
        sprayBottleGroup.rotation.x = clampedX;
        bottleVelX *= FRICTION;
        if (Math.abs(bottleVelX) < VEL_STOP_EPSILON) bottleVelX = 0;
      }
      // Test tube tilt-only momentum coast (no Y spin)
      if (dragMode !== "tube") {
        const nextX = tubeGroup.rotation.x + tubeVelX;
        const clampedX = Math.max(
          -TUBE_TILT_LIMIT,
          Math.min(TUBE_TILT_LIMIT, nextX),
        );
        if (clampedX !== nextX) tubeVelX = 0;
        tubeGroup.rotation.x = clampedX;
        tubeVelX *= FRICTION;
        if (Math.abs(tubeVelX) < VEL_STOP_EPSILON) tubeVelX = 0;
      }
      // Pills wiggle: per-pill sin/cos around stored base pose, distinct phases.
      // While the user is dragging the pills, `pillsShake` adds amplitude and
      // a touch of random jitter; it decays back to 0 so the motion eases into
      // the baseline idle wiggle.
      const pillT = performance.now() / 1000;
      const shakeAmp = 1 + pillsShake;
      const jitter = pillsShake * 0.08;
      for (const p of pills) {
        p.mesh.rotation.z =
          p.baseRotZ +
          Math.sin(pillT * 1.0 + p.phase) * 0.22 * shakeAmp +
          (Math.random() - 0.5) * jitter * 2;
        p.mesh.position.y =
          p.baseY +
          Math.sin(pillT * 1.3 + p.phase) * 0.07 * shakeAmp +
          (Math.random() - 0.5) * jitter;
        p.mesh.position.x =
          p.baseX +
          Math.cos(pillT * 0.8 + p.phase) * 0.03 * shakeAmp +
          (Math.random() - 0.5) * jitter;
      }
      pillsShake *= PILLS_SHAKE_DECAY;
      if (pillsShake < 1e-3) pillsShake = 0;
      if (dragMode !== "maskBox") {
        maskGroup.rotation.y += maskBoxVelY;
        maskBoxVelY *= FRICTION;
        if (Math.abs(maskBoxVelY) < VEL_STOP_EPSILON) maskBoxVelY = 0;
      }
      // Lid flap — small sinusoidal hinge rotation
      lidHinge.rotation.x = -0.7 + Math.sin(performance.now() / 380) * 0.12;
      // Advance the current arrow shot
      if (shotMesh && shotGeom && shotCurve && shotGeom.index) {
        const elapsed = performance.now() / 1000 - shotStartTime;
        const t = Math.min(1, elapsed / SHOT_DURATION);
        const indexCount = shotGeom.index.count;
        shotGeom.setDrawRange(0, Math.floor(indexCount * t));
        if (t < 1) {
          const tipPos = shotCurve.getPointAt(t);
          const tipTan = shotCurve.getTangentAt(t).normalize();
          arrowHead.position.copy(tipPos);
          arrowHead.quaternion.setFromUnitVectors(arrowUp, tipTan);
          arrowHead.visible = true;
        } else {
          arrowHead.visible = elapsed < SHOT_DURATION + SHOT_HOLD;
        }
        if (elapsed > SHOT_DURATION + SHOT_HOLD) {
          disposeCurrentShot();
          planShot();
          shotStartTime = performance.now() / 1000;
        }
      }
      // Spray bursts: short ramp-up + decay, then a longer pause
      const burstCycle = 1.4;
      const burstT = (performance.now() / 1000) % burstCycle;
      let burstOpacity = 0;
      if (burstT < 0.12) {
        burstOpacity = (burstT / 0.12) * 0.9;
      } else if (burstT < 0.55) {
        burstOpacity = 0.9 * (1 - (burstT - 0.12) / 0.43);
      }
      sprayMat.opacity = burstOpacity;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvasEl.removeEventListener("pointerdown", onPointerDown);
      canvasEl.removeEventListener("pointermove", onPointerMove);
      canvasEl.removeEventListener("pointerup", onPointerUp);
      canvasEl.removeEventListener("pointercancel", onPointerUp);
      sliceDisposers.forEach((fn) => fn());
      sprayBottleDisposers.forEach((fn) => fn());
      maskDisposers.forEach((fn) => fn());
      pillDisposers.forEach((fn) => fn());
      tubeDisposers.forEach((fn) => fn());
      disposeCurrentShot();
      arrowHeadGeom.dispose();
      arrowMat.dispose();
      virusDisposers.forEach((fn) => fn());
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className={styles.canvasHost} aria-hidden />;
}
