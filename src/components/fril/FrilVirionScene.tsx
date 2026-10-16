"use client";

// Life-size FRIL aggregation for the web, built from the same structural
// pipeline as the video (../../../fril_molecular_render).
//
// This is the "accurate" counterpart to FrilAggregationScene, which is
// deliberately schematic. Here every number is real: a 110 nm influenza
// envelope carrying 350 HA trimers and 50 NA tetramers at ~9 nm spacing, each
// spike a decimated molecular surface from a glycosylated crystal structure,
// and 9 particles moving on a Brownian-dynamics trajectory with
// Stokes-Einstein diffusion. FRIL is drawn at its true ~9 nm against the
// 132 nm particles, which is the honest and rather striking comparison the
// schematic figure has to exaggerate away.
//
// Performance note: each virion is a Group containing one InstancedMesh per
// (spike type, component), with the spike placements baked in as static
// instance matrices. Playback then animates 9 group transforms rather than
// 10,800 instance matrices per frame.

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import styles from "./Fril.module.css";

const BASE = "/models/fril-virion";

// Matches the Blender render and fril_lectin_video/design.md.
const COL_PROTEIN = 0x9a2c24;
const COL_COMPLEX = 0xf0c45a;
const COL_MANNOSE = 0x4ecf8f;
const COL_MEMBRANE = 0x5a6b80;
const COL_FRIL_FREE = 0x5eb8ff;
const COL_FRIL_BOUND = 0x4ecf8f;

const COMPONENTS = ["protein", "glycan_complex", "glycan_mannose"] as const;
type ComponentName = (typeof COMPONENTS)[number];

const COMPONENT_COLOR: Record<ComponentName, number> = {
  protein: COL_PROTEIN,
  glycan_complex: COL_COMPLEX,
  glycan_mannose: COL_MANNOSE,
};

type Placement = { t: string; r: number[]; p: number[] };

type SceneManifest = {
  virion: string;
  units: string;
  envelope_radius_nm: number;
  outer_radius_nm: number;
  source: string;
  fril: {
    mesh: string;
    diameter_nm: number;
    crosslink_span_nm: number | null;
    pdb: string;
  };
  spike_types: Record<
    string,
    { mesh: string; count: number; height_nm: number; note: string; center_angstrom: number[] }
  >;
  placements: Placement[];
  trajectory: {
    frames: number;
    n_virions: number;
    n_fril: number;
    virions_bin: string;
    fril_bin: string;
    bonds_bin: string;
    final?: Record<string, number>;
  } | null;
};

type MeshSet = Map<string, Map<ComponentName, THREE.BufferGeometry>>;

type Loaded = {
  manifest: SceneManifest;
  meshes: MeshSet;
  frilGeometry: THREE.BufferGeometry;
  virions: Float32Array;
  fril: Float32Array;
  bonds: Int16Array;
  /** Fetches the heavier geometry, which is not in the initial payload. */
  loadDetail: () => Promise<{ meshes: MeshSet; fril: THREE.BufferGeometry }>;
};

async function loadAll(signal: AbortSignal): Promise<Loaded> {
  const manifest: SceneManifest = await fetch(`${BASE}/scene.json`, { signal }).then(
    (r) => {
      if (!r.ok) throw new Error(`scene.json: HTTP ${r.status}`);
      return r.json();
    },
  );

  const loader = new GLTFLoader();
  const loadMeshes = (file: string) =>
    new Promise<Map<ComponentName, THREE.BufferGeometry>>((resolve, reject) => {
      loader.load(
        `${BASE}/${file}`,
        (gltf) => {
          const out = new Map<ComponentName, THREE.BufferGeometry>();
          gltf.scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            const name = m.name.replace(/\.\d+$/, "") as ComponentName;
            if (COMPONENTS.includes(name)) out.set(name, m.geometry as THREE.BufferGeometry);
          });
          resolve(out);
        },
        undefined,
        reject,
      );
    });

  const meshes = new Map<string, Map<ComponentName, THREE.BufferGeometry>>();
  for (const [stype, info] of Object.entries(manifest.spike_types)) {
    meshes.set(stype, await loadMeshes(info.mesh));
  }
  const frilMeshes = await loadMeshes(manifest.fril.mesh);
  const frilGeometry =
    frilMeshes.get("protein") ?? [...frilMeshes.values()][0];

  const traj = manifest.trajectory;
  if (!traj) throw new Error("scene.json has no trajectory");
  const buf = async (name: string) => {
    const r = await fetch(`${BASE}/${name}`, { signal });
    if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
    return r.arrayBuffer();
  };
  const [vb, fb, bb] = await Promise.all([
    buf(traj.virions_bin),
    buf(traj.fril_bin),
    buf(traj.bonds_bin),
  ]);

  const loadDetail = async () => {
    const detail: MeshSet = new Map();
    for (const [stype, info] of Object.entries(manifest.spike_types)) {
      detail.set(stype, await loadMeshes(info.mesh.replace(".glb", "_detail.glb")));
    }
    const fm = await loadMeshes(manifest.fril.mesh.replace(".glb", "_detail.glb"));
    return {
      meshes: detail,
      fril: fm.get("protein") ?? [...fm.values()][0],
    };
  };

  return {
    manifest,
    meshes,
    frilGeometry,
    virions: new Float32Array(vb),
    fril: new Float32Array(fb),
    bonds: new Int16Array(bb),
    loadDetail,
  };
}

export default function FrilVirionScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [stats, setStats] = useState<{ t: number; xlinks: number } | null>(null);

  const playingRef = useRef(true);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const restartRef = useRef<(() => void) | null>(null);
  const restart = useCallback(() => restartRef.current?.(), []);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [detail, setDetail] = useState<"standard" | "loading" | "high">("standard");
  const zoomRef = useRef<((z: number) => void) | null>(null);
  const getZoomRef = useRef<(() => number) | null>(null);
  const nudgeZoom = useCallback((factor: number) => {
    const cur = getZoomRef.current?.() ?? 1;
    zoomRef.current?.(cur * factor);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof window === "undefined") return;

    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) {
      setFailed("webgl");
      return;
    }

    const abort = new AbortController();
    let disposed = false;
    let teardown: (() => void) | null = null;

    loadAll(abort.signal)
      .then((data) => {
        if (disposed) return;
        teardown = start(data, host);
        setReady(true);
      })
      .catch((err) => {
        if (!disposed && err?.name !== "AbortError") {
          setFailed(String(err?.message ?? err));
        }
      });

    function start(data: Loaded, host: HTMLDivElement) {
      const { manifest, meshes, frilGeometry, virions, fril, bonds } = data;
      const traj = manifest.trajectory!;
      const nV = traj.n_virions;
      const nF = traj.n_fril;
      const frames = traj.frames;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setClearColor(0x081018, 1);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 1, 8000);
      const root = new THREE.Group();
      scene.add(root);

      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 2.1);
      key.position.set(300, 240, 320);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x9fd0f5, 0.9);
      rim.position.set(-260, 180, -200);
      scene.add(rim);

      const disposables: Array<{ dispose: () => void }> = [];
      const materials: Partial<Record<ComponentName, THREE.Material>> = {};
      for (const c of COMPONENTS) {
        const m = new THREE.MeshStandardMaterial({
          color: COMPONENT_COLOR[c],
          roughness: c === "protein" ? 0.55 : 0.4,
          metalness: 0.0,
          flatShading: true,
        });
        materials[c] = m;
        disposables.push(m);
      }

      // Group placements by spike type so each becomes one InstancedMesh.
      const byType = new Map<string, Placement[]>();
      for (const p of manifest.placements) {
        const arr = byType.get(p.t) ?? [];
        arr.push(p);
        byType.set(p.t, arr);
      }

      const tmp = new THREE.Matrix4();
      const rotM = new THREE.Matrix4();

      // Keyed so the detail LOD can be swapped in later without rebuilding.
      const spikeMeshes: Array<{
        stype: string;
        comp: ComponentName;
        mesh: THREE.InstancedMesh;
      }> = [];
      const virionGroups: THREE.Group[] = [];
      for (let v = 0; v < nV; v++) {
        const g = new THREE.Group();
        for (const [stype, places] of byType) {
          const geos = meshes.get(stype);
          if (!geos) continue;
          for (const c of COMPONENTS) {
            const geo = geos.get(c);
            if (!geo) continue;
            const inst = new THREE.InstancedMesh(geo, materials[c]!, places.length);
            // Culling per virion pays off when zoomed in, which is exactly
            // when the heavier geometry is loaded.
            inst.frustumCulled = true;
            places.forEach((p, i) => {
              const r = p.r;
              rotM.set(
                r[0], r[1], r[2], 0,
                r[3], r[4], r[5], 0,
                r[6], r[7], r[8], 0,
                0, 0, 0, 1,
              );
              // The exported mesh already has T(-centroid) and the
              // angstrom -> nanometre scale baked in (blender_web_export), so
              // placing it needs only translate-and-rotate. Re-deriving the
              // full transform here scaled every spike down by 10x.
              tmp.makeTranslation(p.p[0], p.p[1], p.p[2]);
              tmp.multiply(rotM);
              inst.setMatrixAt(i, tmp);
            });
            inst.instanceMatrix.needsUpdate = true;
            inst.computeBoundingSphere();
            spikeMeshes.push({ stype, comp: c, mesh: inst });
            g.add(inst);
          }
        }
        const envGeo = new THREE.SphereGeometry(manifest.envelope_radius_nm, 48, 32);
        const envMat = new THREE.MeshStandardMaterial({
          color: COL_MEMBRANE,
          roughness: 0.75,
        });
        disposables.push(envGeo, envMat);
        g.add(new THREE.Mesh(envGeo, envMat));
        root.add(g);
        virionGroups.push(g);
      }

      const frilMatFree = new THREE.MeshStandardMaterial({
        color: COL_FRIL_FREE,
        roughness: 0.35,
        emissive: COL_FRIL_FREE,
        emissiveIntensity: 0.18,
      });
      const frilMatBound = new THREE.MeshStandardMaterial({
        color: COL_FRIL_BOUND,
        roughness: 0.3,
        emissive: COL_FRIL_BOUND,
        emissiveIntensity: 0.35,
      });
      disposables.push(frilMatFree, frilMatBound);
      const frilFree = new THREE.InstancedMesh(frilGeometry, frilMatFree, nF);
      const frilBound = new THREE.InstancedMesh(frilGeometry, frilMatBound, nF);
      frilFree.frustumCulled = false;
      frilBound.frustumCulled = false;
      root.add(frilFree, frilBound);

      // Centre the system on the trajectory's mean so the camera can be fixed.
      const centroid = new THREE.Vector3();
      for (let f = 0; f < frames; f++) {
        for (let v = 0; v < nV; v++) {
          const o = (f * nV + v) * 7;
          centroid.x += virions[o];
          centroid.y += virions[o + 1];
          centroid.z += virions[o + 2];
        }
      }
      centroid.divideScalar(frames * nV);

      let maxR = 0;
      for (let v = 0; v < nV; v++) {
        const o = v * 7;
        maxR = Math.max(
          maxR,
          new THREE.Vector3(virions[o], virions[o + 1], virions[o + 2])
            .sub(centroid)
            .length(),
        );
      }
      const sceneRadius = maxR + manifest.outer_radius_nm;

      const q = new THREE.Quaternion();
      const pos = new THREE.Vector3();
      const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
      const frilM = new THREE.Matrix4();

      const applyFrame = (frame: number) => {
        const f = Math.min(frames - 1, Math.max(0, Math.floor(frame)));
        for (let v = 0; v < nV; v++) {
          const o = (f * nV + v) * 7;
          virionGroups[v].position.set(
            virions[o] - centroid.x,
            virions[o + 1] - centroid.y,
            virions[o + 2] - centroid.z,
          );
          virionGroups[v].quaternion.set(
            virions[o + 4], virions[o + 5], virions[o + 6], virions[o + 3],
          );
        }
        let xlinks = 0;
        for (let j = 0; j < nF; j++) {
          const o = (f * nF + j) * 7;
          pos.set(
            fril[o] - centroid.x,
            fril[o + 1] - centroid.y,
            fril[o + 2] - centroid.z,
          );
          q.set(fril[o + 4], fril[o + 5], fril[o + 6], fril[o + 3]);
          frilM.makeRotationFromQuaternion(q);
          frilM.setPosition(pos);
          const b = (f * nF + j) * 2;
          const bridging = bonds[b] >= 0 && bonds[b + 1] >= 0;
          if (bridging) xlinks++;
          frilBound.setMatrixAt(j, bridging ? frilM : hidden);
          frilFree.setMatrixAt(j, bridging ? hidden : frilM);
        }
        frilFree.instanceMatrix.needsUpdate = true;
        frilBound.instanceMatrix.needsUpdate = true;
        return { frame: f, xlinks };
      };

      // ---- pointer drag ----
      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let velY = 0.0012;
      let velX = 0;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = velY = 0;
        renderer.domElement.setPointerCapture(e.pointerId);
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        velY = (e.clientX - lastX) * 0.005;
        velX = (e.clientY - lastY) * 0.005;
        lastX = e.clientX;
        lastY = e.clientY;
        root.rotation.y += velY;
        root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + velX, -0.8, 0.8);
      };
      const onUp = (e: PointerEvent) => {
        dragging = false;
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      };
      const el = renderer.domElement;
      el.addEventListener("pointerdown", onDown);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);

      // zoom = 1 frames the whole system; larger values move in. The lower
      // bound keeps one particle comfortably in frame.
      let zoom = 1;
      let fitDist = sceneRadius * 3;
      const MIN_ZOOM = 1;
      const MAX_ZOOM = 9;

      const placeCamera = () => {
        const d = fitDist / zoom;
        camera.position.set(d * 0.25, d * 0.22, d * 0.94);
        camera.lookAt(0, 0, 0);
        camera.near = Math.max(0.5, d * 0.01);
        camera.far = d * 12 + sceneRadius * 4;
        camera.updateProjectionMatrix();
      };

      const setSize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const vHalf = THREE.MathUtils.degToRad(camera.fov) / 2;
        const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
        fitDist = (sceneRadius * 1.15) / Math.sin(Math.min(vHalf, hHalf));
        placeCamera();
      };
      setSize();

      let detailLoading = false;
      let detailApplied = false;
      const ensureDetail = () => {
        if (detailLoading || detailApplied) return;
        detailLoading = true;
        setDetail("loading");
        data
          .loadDetail()
          .then(({ meshes: hi, fril: hiFril }) => {
            if (disposed) return;
            for (const { stype, comp, mesh } of spikeMeshes) {
              const geo = hi.get(stype)?.get(comp);
              if (geo) {
                mesh.geometry = geo;
                mesh.computeBoundingSphere();
              }
            }
            frilFree.geometry = hiFril;
            frilBound.geometry = hiFril;
            detailApplied = true;
            setDetail("high");
          })
          .catch(() => setDetail("standard"))
          .finally(() => {
            detailLoading = false;
          });
      };

      const applyZoom = (next: number) => {
        zoom = THREE.MathUtils.clamp(next, MIN_ZOOM, MAX_ZOOM);
        placeCamera();
        setZoomLevel(zoom);
        if (zoom > 1.8) ensureDetail();
      };
      zoomRef.current = applyZoom;
      getZoomRef.current = () => zoom;

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        applyZoom(zoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      const ro = new ResizeObserver(setSize);
      ro.observe(host);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let cursor = reduced ? frames - 1 : 0;
      if (reduced) {
        playingRef.current = false;
        setPlaying(false);
      }
      restartRef.current = () => {
        cursor = 0;
      };

      let raf = 0;
      let last = performance.now();
      let shown = -1;
      const FPS = 28;

      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (playingRef.current) {
          cursor += dt * FPS;
          if (cursor >= frames) cursor = 0;
        }
        const { frame, xlinks } = applyFrame(cursor);
        if (frame !== shown) {
          shown = frame;
          setStats({
            t: (frame / Math.max(1, frames - 1)) * (traj.final?.t_total_us ?? 0),
            xlinks,
          });
        }
        if (!dragging) {
          root.rotation.y += velY || 0.0012;
          velY *= 0.94;
          if (Math.abs(velY) < 0.0012) velY = 0;
        }
        try {
          renderer.render(scene, camera);
        } catch {
          cancelAnimationFrame(raf);
          setFailed("render");
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        el.removeEventListener("pointerdown", onDown);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("wheel", onWheel);
        for (const d of disposables) d.dispose();
        for (const geos of meshes.values()) for (const g of geos.values()) g.dispose();
        frilGeometry.dispose();
        renderer.dispose();
        if (el.parentNode === host) host.removeChild(el);
      };
    }

    return () => {
      disposed = true;
      abort.abort();
      teardown?.();
    };
  }, []);

  if (failed) {
    return (
      <div className={styles.sceneWrap}>
        <p className={styles.fallbackNote}>
          {failed === "webgl"
            ? "This figure needs WebGL. Try enabling hardware acceleration, or open the page in Firefox."
            : `Could not load the virion model (${failed}).`}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.sceneWrap}>
      <div
        ref={hostRef}
        className={`${styles.canvasHost} ${styles.canvasHostDark}`}
        data-ready={ready ? "1" : "0"}
        role="img"
        aria-label="Life-size 3D model of influenza virus particles being cross-linked into an aggregate by FRIL tetramers"
      />
      <div className={styles.sceneUi}>
        <div className={styles.zoomGroup}>
          <button
            type="button"
            className={styles.playBtn}
            onClick={() => nudgeZoom(1 / 1.5)}
            disabled={zoomLevel <= 1.001}
            aria-label="Zoom out"
          >
            −
          </button>
          <span className={styles.zoomLabel}>
            {zoomLevel.toFixed(1)}×
            {detail === "high" && <em className={styles.detailTag}>detail</em>}
            {detail === "loading" && <em className={styles.detailTag}>loading…</em>}
          </span>
          <button
            type="button"
            className={styles.playBtn}
            onClick={() => nudgeZoom(1.5)}
            aria-label="Zoom in to see the spike surface in detail"
          >
            +
          </button>
        </div>
        <div className={styles.readout}>
          {stats ? (
            <>
              <span className={styles.readoutValue}>{stats.t.toFixed(0)} µs</span>
              <span className={styles.readoutLabel}>simulated</span>
              <span className={styles.readoutValue}>{stats.xlinks}</span>
              <span className={styles.readoutLabel}>cross-links</span>
            </>
          ) : (
            <span className={styles.readoutLabel}>loading model…</span>
          )}
        </div>
        <button
          type="button"
          className={styles.playBtn}
          onClick={restart}
          aria-label="Restart"
        >
          ↺
        </button>
        <button
          type="button"
          className={styles.playBtn}
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>
      <p className={styles.sceneLegend}>
        <span className={styles.swatchVirion} /> HA / NA
        <span className={styles.swatchGlycan2} /> complex N-glycan
        <span className={styles.swatchMannose} /> oligomannose
        <span className={styles.swatchFrilFree} /> FRIL
        <span className={styles.swatchFrilBound} /> bridging
      </p>
    </div>
  );
}
