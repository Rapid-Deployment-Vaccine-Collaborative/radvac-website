"use client";

// Animated figure for /fril-draft: FRIL tetramers cross-linking influenza-like
// virions into an aggregate.
//
// The FRIL envelope is the real thing — built from PDB 9VBW by
// scripts/build-fril-model.py — and the tetramer's local z axis is its
// cross-linking axis (two of the four carbohydrate-binding sites face each
// end), so a bridging tetramer is simply oriented along the line between the
// two virions it holds. The virions are schematic wireframes in the same
// style as the Swiss-cheese scene on /projects.
//
// Sizes are NOT to scale: a FRIL tetramer is ~8 nm across against a ~100 nm
// virion, so it is drawn several times larger to stay legible. The caption
// says so.

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { buildSurface, loadFrilModel, siteCenter } from "./frilModel";
import styles from "./Fril.module.css";

// ── Palette (matches the site's other three.js graphics) ─────────────────────
const VIRION_SHELL = 0xd92b38;
const VIRION_SPIKE = 0xf4616a;
const GLYCAN = 0x37b85f;
const FRIL_BODY = 0x1f58c0;
const FRIL_EDGE = 0x9fd0f5;
const SITE_AMBER = 0xf0c419;

// ── Layout ────────────────────────────────────────────────────────────────────
const VIRION_R = 0.6;
/** Tetramer's longest axis, in scene units. Exaggerated — see the caption. */
const FRIL_SPAN = 0.62;
/** Centre-to-centre spacing of two virions bridged by a tetramer. */
const BRIDGE_D = 2 * VIRION_R + FRIL_SPAN * 0.78;
const FREE_RADIUS = 3.5;
const N_FREE_FRIL = 5;
/** Outermost thing on a virion: shell + stalk + head. */
const VIRION_OUTER = VIRION_R + 0.33;

// Eight virions on the corners of a cube of edge BRIDGE_D: every virion ends
// up bridged to three others, which reads as a compact 3D clump rather than a
// flat raft. The 12 cube edges are the 12 bridging tetramers.
const CUBE: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

// ── Timeline (seconds) ────────────────────────────────────────────────────────
// Every ramp must finish inside CYCLE or the loop snaps, so the release has
// to clear the largest per-object delay (BRIDGE_STAGGER) before the wrap:
// RELEASE_START + BRIDGE_STAGGER + RELEASE_DUR = 23.5 < CYCLE.
const CYCLE = 24;
const BIND_START = 4.5;
const BIND_DUR = 2.2;
const BRIDGE_STAGGER = 2.2;
const CLUMP_START = 9.5;
const CLUMP_DUR = 3;
const VIRION_STAGGER = 1.75;
const RELEASE_START = 19.5;
const RELEASE_DUR = 1.8;

export type Phase = { at: number; title: string; body: string };

export const PHASES: Phase[] = [
  {
    at: 0,
    title: "A glycan shield, and a way in",
    body: "Influenza hemagglutinin and coronavirus spike are heavily coated in N-glycans (green). The glycans shield the virus from antibodies — but they are also hard to mutate away, which makes them a target.",
  },
  {
    at: BIND_START,
    title: "FRIL grips complex-type N-glycans",
    body: "FRIL is a homotetramer: four subunits, four carbohydrate-binding sites (amber). Unlike most antiviral lectins, it prefers complex-type N-glycans — the kind that dominate influenza and SARS-CoV-2 envelopes.",
  },
  {
    at: CLUMP_START,
    title: "One tetramer, two virions",
    body: "Two of the four sites face each end of the tetramer, so a single FRIL molecule can grip two virus particles at once and hold them together.",
  },
  {
    at: 15,
    title: "The virions aggregate",
    body: "Multivalent cross-linking pulls particles into clumps. Under electron microscopy, FRIL-treated influenza appears as large, densely packed aggregates — and aggregated virus cannot productively infect a cell.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * A 0→1→0 ramp: rises over `upDur` from `upStart + delay`, holds, then falls
 * over `downDur` from `downStart + delay`. Deterministic in the cycle time, so
 * the loop closes without a snap.
 */
function ramp(
  t: number,
  upStart: number,
  upDur: number,
  downStart: number,
  downDur: number,
  delay: number,
): number {
  const up = upStart + delay;
  const down = downStart + delay;
  if (t < up) return 0;
  if (t < up + upDur) return smooth((t - up) / upDur);
  if (t < down) return 1;
  if (t < down + downDur) return 1 - smooth((t - down) / downDur);
  return 0;
}

/**
 * Camera distance that fits a sphere of `radius` about the origin, honouring
 * the horizontal field of view too — the figure is much wider than it is tall
 * on desktop, so fitting vertically alone would push content off the sides.
 */
function fitDistance(camera: THREE.PerspectiveCamera, radius: number): number {
  const vHalf = THREE.MathUtils.degToRad(camera.fov) / 2;
  const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
  return radius / Math.sin(Math.min(vHalf, hHalf));
}

export function phaseIndexAt(t: number): number {
  let idx = 0;
  for (let i = 0; i < PHASES.length; i++) if (t >= PHASES[i].at) idx = i;
  return idx;
}

// ── Virion geometry ───────────────────────────────────────────────────────────
// Built once and shared by all eight virions: the spikes are merged into a
// single wireframe geometry so each virion costs three draw calls, not a
// hundred.
function buildVirionGeometry(rand: () => number) {
  const N_SPIKES = 18;
  const STALK = 0.15;
  const HEAD_H = 0.18;

  const stalkProto = new THREE.CylinderGeometry(0.058, 0.04, STALK, 7, 1, false);
  const headProto = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.035, 0),
      new THREE.Vector2(0.085, 0.03),
      new THREE.Vector2(0.115, 0.08),
      new THREE.Vector2(0.1, 0.14),
      new THREE.Vector2(0.06, 0.18),
      new THREE.Vector2(0, HEAD_H),
    ],
    9,
  );
  // Glycans are solid beads, not wireframe — at this size an outline reads as
  // noise, while a filled dot stays legible and keeps the green visible.
  const glycanProto = new THREE.IcosahedronGeometry(0.052, 1);

  const spikeParts: THREE.BufferGeometry[] = [];
  const glycanParts: THREE.BufferGeometry[] = [];

  const yAxis = new THREE.Vector3(0, 1, 0);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);

  const addWire = (
    proto: THREE.BufferGeometry,
    matrix: THREE.Matrix4,
    into: THREE.BufferGeometry[],
  ) => {
    const w = new THREE.WireframeGeometry(proto);
    w.applyMatrix4(matrix);
    into.push(w);
  };

  for (let i = 0; i < N_SPIKES; i++) {
    const y = 1 - (i / (N_SPIKES - 1)) * 2;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const dir = new THREE.Vector3(
      Math.cos(theta) * radial,
      y,
      Math.sin(theta) * radial,
    );
    q.setFromUnitVectors(yAxis, dir);

    addWire(
      stalkProto,
      m.compose(dir.clone().multiplyScalar(VIRION_R + STALK / 2), q, one),
      spikeParts,
    );
    const headBase = VIRION_R + STALK;
    addWire(headProto, m.compose(dir.clone().multiplyScalar(headBase), q, one), spikeParts);

    // Two or three N-glycans per spike, scattered over the head's shoulder —
    // the handholds FRIL actually grips.
    const tmp =
      Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const u = new THREE.Vector3().crossVectors(dir, tmp).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const nGlycan = 2 + (rand() < 0.5 ? 1 : 0);
    for (let g = 0; g < nGlycan; g++) {
      const a = rand() * Math.PI * 2;
      const up = headBase + HEAD_H * (0.3 + rand() * 0.65);
      const out = 0.1 + rand() * 0.04;
      const pos = dir
        .clone()
        .multiplyScalar(up)
        .addScaledVector(u, Math.cos(a) * out)
        .addScaledVector(v, Math.sin(a) * out);
      const bead = glycanProto.clone();
      bead.applyMatrix4(m.compose(pos, q, one));
      glycanParts.push(bead);
    }
  }

  const shellProto = new THREE.IcosahedronGeometry(VIRION_R, 2);
  const shell = new THREE.WireframeGeometry(shellProto);
  const spikes = mergeGeometries(spikeParts)!;
  const glycans = mergeGeometries(glycanParts)!;

  for (const g of [...spikeParts, ...glycanParts]) g.dispose();
  stalkProto.dispose();
  headProto.dispose();
  glycanProto.dispose();
  shellProto.dispose();

  const membrane = new THREE.SphereGeometry(VIRION_R * 0.99, 24, 16);
  return { shell, spikes, glycans, membrane };
}

// ── Static fallback (no WebGL) ────────────────────────────────────────────────
function SceneFallback() {
  const virions: [number, number][] = [
    [95, 95], [185, 85], [150, 170], [60, 180], [225, 160],
  ];
  return (
    <svg
      viewBox="0 0 300 260"
      className={styles.fallbackSvg}
      role="img"
      aria-label="Diagram: FRIL tetramers cross-linking virus particles into an aggregate"
    >
      {virions.map(([cx, cy], i) => (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r="34"
            fill={`#${VIRION_SHELL.toString(16)}`}
            fillOpacity={0.08}
            stroke={`#${VIRION_SHELL.toString(16)}`}
            strokeWidth={1.4}
          />
          {Array.from({ length: 12 }, (_, s) => {
            const a = (s / 12) * Math.PI * 2;
            return (
              <g key={s}>
                <line
                  x1={cx + Math.cos(a) * 34}
                  y1={cy + Math.sin(a) * 34}
                  x2={cx + Math.cos(a) * 43}
                  y2={cy + Math.sin(a) * 43}
                  stroke={`#${VIRION_SPIKE.toString(16)}`}
                  strokeWidth={1.4}
                />
                <circle
                  cx={cx + Math.cos(a) * 45}
                  cy={cy + Math.sin(a) * 45}
                  r="2.6"
                  fill={`#${GLYCAN.toString(16)}`}
                />
              </g>
            );
          })}
        </g>
      ))}
      {([[0, 1], [1, 2], [2, 3], [0, 3], [2, 4], [1, 4]] as [number, number][]).map(
        ([a, b], i) => {
          const mx = (virions[a][0] + virions[b][0]) / 2;
          const my = (virions[a][1] + virions[b][1]) / 2;
          const ang =
            (Math.atan2(virions[b][1] - virions[a][1], virions[b][0] - virions[a][0]) *
              180) /
            Math.PI;
          return (
            <g key={i} transform={`translate(${mx} ${my}) rotate(${ang})`}>
              <rect
                x="-11"
                y="-8"
                width="22"
                height="16"
                rx="4"
                fill={`#${FRIL_BODY.toString(16)}`}
                fillOpacity={0.9}
                stroke={`#${FRIL_EDGE.toString(16)}`}
                strokeWidth={1.2}
              />
              {[-1, 1].map((s) => (
                <g key={s}>
                  <circle cx={s * 8} cy={-4} r="2" fill={`#${SITE_AMBER.toString(16)}`} />
                  <circle cx={s * 8} cy={4} r="2" fill={`#${SITE_AMBER.toString(16)}`} />
                </g>
              ))}
            </g>
          );
        },
      )}
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FrilAggregationScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Written by the UI, read by the rAF loop.
  const playingRef = useRef(true);
  const seekRef = useRef<number | null>(null);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const seekTo = useCallback((i: number) => {
    seekRef.current = PHASES[i].at;
    setPhase(i);
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof window === "undefined") return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      setFailed(true);
      return;
    }

    const abort = new AbortController();
    let teardown: (() => void) | null = null;
    let cancelled = false;

    loadFrilModel(abort.signal)
      .then((model) => {
        if (cancelled) return;
        teardown = start(model);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    function start(model: Awaited<ReturnType<typeof loadFrilModel>>) {
      const host = el!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        playingRef.current = false;
        seekRef.current = PHASES[PHASES.length - 1].at;
        setPlaying(false);
        setPhase(PHASES.length - 1);
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        setFailed(true);
        return null;
      }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      scene.add(new THREE.AmbientLight(0xffffff, 0.62));
      const key = new THREE.DirectionalLight(0xffffff, 0.95);
      key.position.set(3, 6, 6);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xa9c6ff, 0.4);
      fill.position.set(-5, -2, 3);
      scene.add(fill);

      const root = new THREE.Group();
      scene.add(root);

      const disposers: Array<() => void> = [];
      const rand = mulberry32(20200811);

      // ---- Virions ----
      const vGeom = buildVirionGeometry(rand);
      // The envelope mesh is dense, so it is kept faint: at eight virions the
      // spikes and glycans should carry the shape, not a thicket of red lines.
      const shellMat = new THREE.LineBasicMaterial({
        color: VIRION_SHELL,
        transparent: true,
        opacity: 0.45,
      });
      const spikeMat = new THREE.LineBasicMaterial({
        color: VIRION_SPIKE,
        transparent: true,
        opacity: 0.8,
      });
      const glycanMat = new THREE.MeshBasicMaterial({ color: GLYCAN });
      const membraneMat = new THREE.MeshBasicMaterial({
        color: 0xff8a90,
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
      });
      disposers.push(
        () => vGeom.shell.dispose(),
        () => vGeom.spikes.dispose(),
        () => vGeom.glycans.dispose(),
        () => vGeom.membrane.dispose(),
        () => shellMat.dispose(),
        () => spikeMat.dispose(),
        () => glycanMat.dispose(),
        () => membraneMat.dispose(),
      );

      type Virion = {
        group: THREE.Group;
        free: THREE.Vector3;
        agg: THREE.Vector3;
        spin: THREE.Vector3;
        drift: THREE.Vector3;
        delay: number;
      };
      const virions: Virion[] = CUBE.map((corner, i) => {
        const group = new THREE.Group();
        group.add(new THREE.LineSegments(vGeom.shell, shellMat));
        group.add(new THREE.LineSegments(vGeom.spikes, spikeMat));
        group.add(new THREE.Mesh(vGeom.glycans, glycanMat));
        group.add(new THREE.Mesh(vGeom.membrane, membraneMat));
        group.rotation.set(rand() * 6.28, rand() * 6.28, rand() * 6.28);
        root.add(group);

        const agg = new THREE.Vector3(...corner)
          .multiplyScalar(BRIDGE_D / 2)
          .add(
            new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(
              0.09,
            ),
          );
        // Free positions fan out roughly along the same corner direction, so
        // nothing has to cross the middle of the clump on its way in — but
        // tilted well off it, or opposite corners would line up in projection
        // and the eight virions would read as four.
        const free = new THREE.Vector3(...corner)
          .normalize()
          .applyAxisAngle(
            new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
            0.5 + rand() * 0.5,
          )
          .multiplyScalar(FREE_RADIUS * (0.82 + rand() * 0.36));
        return {
          group,
          free,
          agg,
          spin: new THREE.Vector3(
            (rand() - 0.5) * 0.22,
            (rand() - 0.5) * 0.22,
            (rand() - 0.5) * 0.22,
          ),
          drift: new THREE.Vector3(rand() * 6.28, rand() * 6.28, rand() * 6.28),
          delay: (i / CUBE.length) * VIRION_STAGGER,
        };
      });

      // ---- FRIL tetramers ----
      const { geometry: frilGeom, wire: frilWire, scale } = buildSurface(
        model,
        FRIL_SPAN,
      );
      const frilMat = new THREE.MeshPhongMaterial({
        color: FRIL_BODY,
        shininess: 12,
        flatShading: true,
      });
      const frilEdgeMat = new THREE.LineBasicMaterial({
        color: FRIL_EDGE,
        transparent: true,
        opacity: 0.3,
      });
      const siteGeom = new THREE.IcosahedronGeometry(FRIL_SPAN * 0.13, 1);
      const siteMat = new THREE.MeshBasicMaterial({ color: SITE_AMBER });
      disposers.push(
        () => frilGeom.dispose(),
        () => frilWire.dispose(),
        () => frilMat.dispose(),
        () => frilEdgeMat.dispose(),
        () => siteGeom.dispose(),
        () => siteMat.dispose(),
      );

      const sitePositions = model.sites.map((s) =>
        siteCenter(s).multiplyScalar(scale),
      );

      const makeFril = () => {
        const g = new THREE.Group();
        g.add(new THREE.Mesh(frilGeom, frilMat));
        g.add(new THREE.LineSegments(frilWire, frilEdgeMat));
        for (const p of sitePositions) {
          const dot = new THREE.Mesh(siteGeom, siteMat);
          dot.position.copy(p);
          g.add(dot);
        }
        root.add(g);
        return g;
      };

      type Bridge = {
        group: THREE.Group;
        a: number;
        b: number;
        free: THREE.Vector3;
        roll: number;
        drift: THREE.Vector3;
        delay: number;
      };
      const bridges: Bridge[] = EDGES.map(([a, b], i) => ({
        group: makeFril(),
        a,
        b,
        free: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5)
          .normalize()
          .multiplyScalar(FREE_RADIUS * (1.1 + rand() * 0.3)),
        roll: rand() * Math.PI * 2,
        drift: new THREE.Vector3(rand() * 6.28, rand() * 6.28, rand() * 6.28),
        delay: (i / EDGES.length) * BRIDGE_STAGGER,
      }));

      // A few tetramers that never find a partner — the solution is full of them.
      const strays = Array.from({ length: N_FREE_FRIL }, () => ({
        group: makeFril(),
        // Direction only — the radius is set per frame so they stay inside the
        // frame as the camera dollies in on the closing clump.
        dir: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        spread: 0.8 + rand() * 0.18,
        spin: new THREE.Vector3(
          (rand() - 0.5) * 0.5,
          (rand() - 0.5) * 0.5,
          (rand() - 0.5) * 0.5,
        ),
        drift: new THREE.Vector3(rand() * 6.28, rand() * 6.28, rand() * 6.28),
      }));

      // ---- Pointer drag ----
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let velY = 0.0016;
      let velX = 0;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = 0;
        velY = 0;
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velY = dx * 0.005;
        velX = dy * 0.005;
        root.rotation.y += velY;
        root.rotation.x += velX;
      };
      const onUp = (e: PointerEvent) => {
        dragging = false;
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          // pointer already released
        }
      };
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointermove", onMove);
      renderer.domElement.addEventListener("pointerup", onUp);
      renderer.domElement.addEventListener("pointercancel", onUp);

      // ---- Resize ----
      const setSize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      setSize();
      const ro = new ResizeObserver(setSize);
      ro.observe(host);

      // ---- Loop ----
      const zAxis = new THREE.Vector3(0, 0, 1);
      const dir = new THREE.Vector3();
      const mid = new THREE.Vector3();
      const q = new THREE.Quaternion();
      const roll = new THREE.Quaternion();
      const posA = new THREE.Vector3();
      const posB = new THREE.Vector3();

      let raf = 0;
      let clock = 0;
      let last = performance.now();
      let shownPhase = -1;

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        if (seekRef.current !== null) {
          clock = seekRef.current;
          seekRef.current = null;
        } else if (playingRef.current) {
          clock = (clock + dt) % CYCLE;
        }
        const t = clock;

        const idx = phaseIndexAt(t);
        if (idx !== shownPhase) {
          shownPhase = idx;
          setPhase(idx);
        }

        // Virions: free scatter → cube corners.
        let clumpMean = 0;
        for (const v of virions) {
          const p = ramp(t, CLUMP_START, CLUMP_DUR, RELEASE_START, RELEASE_DUR, v.delay);
          clumpMean += p;
          const wobble = (1 - p) * 0.14;
          v.group.position.lerpVectors(v.free, v.agg, p);
          v.group.position.x += Math.sin(t * 0.55 + v.drift.x) * wobble;
          v.group.position.y += Math.sin(t * 0.47 + v.drift.y) * wobble;
          v.group.position.z += Math.sin(t * 0.61 + v.drift.z) * wobble;
          // Spin freely, then settle as the clump locks up.
          v.group.rotation.x += v.spin.x * dt * (1 - p * 0.85);
          v.group.rotation.y += v.spin.y * dt * (1 - p * 0.85);
          v.group.rotation.z += v.spin.z * dt * (1 - p * 0.85);
        }
        clumpMean /= virions.length;

        // Bridging tetramers: drift → docked on the face of virion a, pointing
        // at virion b, so they end up sandwiched once the clump closes.
        for (const br of bridges) {
          const p = ramp(t, BIND_START, BIND_DUR, RELEASE_START, RELEASE_DUR, br.delay);
          posA.copy(virions[br.a].group.position);
          posB.copy(virions[br.b].group.position);
          dir.subVectors(posB, posA).normalize();
          mid
            .copy(posA)
            .addScaledVector(dir, VIRION_R + FRIL_SPAN / 2 + 0.03);

          const wobble = (1 - p) * 0.2;
          br.group.position.lerpVectors(br.free, mid, p);
          br.group.position.x += Math.sin(t * 0.7 + br.drift.x) * wobble;
          br.group.position.y += Math.sin(t * 0.63 + br.drift.y) * wobble;
          br.group.position.z += Math.sin(t * 0.81 + br.drift.z) * wobble;

          // Local z is the cross-linking axis: two binding sites face each end.
          q.setFromUnitVectors(zAxis, dir);
          roll.setFromAxisAngle(zAxis, br.roll + (1 - p) * t * 0.6);
          q.multiply(roll);
          br.group.quaternion.slerp(q, p > 0 ? Math.min(1, 0.06 + p * 0.3) : 0.04);
          const s = 0.75 + 0.25 * p;
          br.group.scale.setScalar(s);
        }

        // Dolly in as the clump forms. The distance is solved from the radius
        // that has to fit, so the framing survives both the canvas's wide
        // aspect on desktop and its near-square one on a phone.
        const clumped = smooth(clumpMean);
        const radius = THREE.MathUtils.lerp(
          FREE_RADIUS * 1.2 + VIRION_OUTER,
          (BRIDGE_D / 2) * Math.sqrt(3) + VIRION_OUTER,
          clumped,
        );

        // Unbound tetramers orbit just inside whatever is currently framed, so
        // they stay visible without being cut off by the canvas edge.
        const strayR = radius * 0.94;
        for (const st of strays) {
          st.group.position
            .copy(st.dir)
            .multiplyScalar(strayR * st.spread)
            .add(
              new THREE.Vector3(
                Math.sin(t * 0.5 + st.drift.x),
                Math.sin(t * 0.43 + st.drift.y),
                Math.sin(t * 0.57 + st.drift.z),
              ).multiplyScalar(0.22),
            );
          st.group.rotation.x += st.spin.x * dt;
          st.group.rotation.y += st.spin.y * dt;
          st.group.rotation.z += st.spin.z * dt;
        }

        camera.position.set(0, 0.2, fitDistance(camera, radius));
        camera.lookAt(0, 0, 0);

        if (!dragging) {
          root.rotation.y += velY || 0.0016;
          root.rotation.x += velX;
          velY *= 0.95;
          velX *= 0.95;
          if (Math.abs(velY) < 0.0016) velY = 0;
          if (Math.abs(velX) < 1e-5) velX = 0;
          root.rotation.x = THREE.MathUtils.clamp(root.rotation.x, -0.6, 0.6);
        }

        try {
          renderer.render(scene, camera);
        } catch {
          cancelAnimationFrame(raf);
          setFailed(true);
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        renderer.domElement.removeEventListener("pointerdown", onDown);
        renderer.domElement.removeEventListener("pointermove", onMove);
        renderer.domElement.removeEventListener("pointerup", onUp);
        renderer.domElement.removeEventListener("pointercancel", onUp);
        for (const d of disposers) d();
        renderer.dispose();
        if (renderer.domElement.parentNode === host) {
          host.removeChild(renderer.domElement);
        }
      };
    }

    return () => {
      cancelled = true;
      abort.abort();
      teardown?.();
    };
  }, []);

  if (failed) {
    return (
      <div className={styles.sceneWrap}>
        <div className={styles.fallback}>
          <SceneFallback />
          <p className={styles.fallbackNote}>
            This figure is animated in 3D, which needs WebGL — try enabling
            hardware acceleration or another browser to see it move.
          </p>
        </div>
      </div>
    );
  }

  const active = PHASES[phase];
  return (
    <div className={styles.sceneWrap}>
      <div
        ref={hostRef}
        className={styles.canvasHost}
        data-ready={ready ? "1" : "0"}
        role="img"
        aria-label="Animated 3D figure: FRIL tetramers binding the glycans on virus particles and cross-linking them into an aggregate"
      />
      <div className={styles.sceneUi}>
        <div className={styles.steps}>
          {PHASES.map((p, i) => (
            <button
              key={p.title}
              type="button"
              className={i === phase ? `${styles.stepDot} ${styles.stepDotOn}` : styles.stepDot}
              onClick={() => seekTo(i)}
              aria-current={i === phase}
            >
              <span className={styles.stepDotNum}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.stepDotLabel}>{p.title}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.playBtn}
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pause animation" : "Play animation"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>
      <p className={styles.sceneCaption}>
        <strong>{active.title}.</strong> {active.body}
      </p>
      <p className={styles.sceneLegend}>
        <span className={styles.swatchVirion} /> virion
        <span className={styles.swatchGlycan} /> N-glycan
        <span className={styles.swatchFril} /> FRIL tetramer
        <span className={styles.swatchSite} /> binding site
      </p>
    </div>
  );
}
