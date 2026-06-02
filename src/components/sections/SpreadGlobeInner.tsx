"use client";

import { useEffect, useRef } from "react";
import {
  geoOrthographic,
  geoPath,
  geoGraticule10,
  geoInterpolate,
  geoDistance,
} from "d3-geo";
import { mesh as topoMesh } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

type LonLat = [number, number];

// Branching outbreak tree. Each non-root arc starts `delay` seconds after its
// `parent` arc lands, so the spread cascades: origin → first wave → each landing
// seeds its own local outbreak. Mostly near hops with a few deliberate far jumps
// (Wuhan→Milan, Bangkok→Sydney, Milan→NYC, London→Lagos, NYC→Rio).
type Outbreak = { pos: LonLat; parent: number; delay: number };

const TREE: Outbreak[] = [
  { pos: [114.3, 30.6], parent: -1, delay: 0 }, // 0  Wuhan (origin)

  // Gen 1 — three regional + one transcontinental seed jump
  { pos: [126.98, 37.57], parent: 0, delay: 0.5 }, // 1  Seoul
  { pos: [139.7, 35.7], parent: 0, delay: 0.7 },   // 2  Tokyo
  { pos: [100.5, 13.75], parent: 0, delay: 0.9 },  // 3  Bangkok
  { pos: [9.2, 45.5], parent: 0, delay: 1.2 },     // 4  Milan (far)

  // Gen 2 from Seoul
  { pos: [116.4, 39.9], parent: 1, delay: 0.3 }, // 5  Beijing
  { pos: [121.5, 25.0], parent: 1, delay: 0.5 }, // 6  Taipei

  // Gen 2 from Tokyo
  { pos: [135.5, 34.7], parent: 2, delay: 0.3 }, // 7  Osaka
  { pos: [121.0, 14.6], parent: 2, delay: 0.6 }, // 8  Manila

  // Gen 2 from Bangkok
  { pos: [103.8, 1.35], parent: 3, delay: 0.3 },  // 9  Singapore
  { pos: [72.8, 19.07], parent: 3, delay: 0.6 },  // 10 Mumbai
  { pos: [151.2, -33.9], parent: 3, delay: 0.9 }, // 11 Sydney (far)

  // Gen 2 from Milan
  { pos: [2.35, 48.85], parent: 4, delay: 0.3 }, // 12 Paris
  { pos: [-0.1, 51.5], parent: 4, delay: 0.5 },  // 13 London
  { pos: [-3.7, 40.4], parent: 4, delay: 0.7 },  // 14 Madrid
  { pos: [-74.0, 40.7], parent: 4, delay: 1.0 }, // 15 NYC (transatlantic)

  // Gen 3 — local clusters around each Gen 2 hub, all close hops
  { pos: [121.5, 31.2], parent: 5, delay: 0.3 },   // 16 Shanghai (←Beijing)
  { pos: [106.8, -6.2], parent: 8, delay: 0.4 },   // 17 Jakarta (←Manila)
  { pos: [101.7, 3.2], parent: 9, delay: 0.3 },    // 18 Kuala Lumpur (←Singapore)
  { pos: [106.7, 10.8], parent: 9, delay: 0.5 },   // 19 Ho Chi Minh (←Singapore)
  { pos: [77.2, 28.6], parent: 10, delay: 0.3 },   // 20 Delhi (←Mumbai)
  { pos: [67.0, 24.9], parent: 10, delay: 0.5 },   // 21 Karachi (←Mumbai)
  { pos: [55.3, 25.2], parent: 10, delay: 0.8 },   // 22 Dubai (←Mumbai)
  { pos: [174.8, -36.85], parent: 11, delay: 0.4 }, // 23 Auckland (←Sydney)
  { pos: [4.3, 50.8], parent: 12, delay: 0.3 },    // 24 Brussels (←Paris)
  { pos: [4.9, 52.4], parent: 12, delay: 0.5 },    // 25 Amsterdam (←Paris)
  { pos: [37.6, 55.75], parent: 13, delay: 0.4 },  // 26 Moscow (←London)
  { pos: [3.4, 6.5], parent: 13, delay: 0.8 },     // 27 Lagos (←London, far south)
  { pos: [-9.1, 38.7], parent: 14, delay: 0.3 },   // 28 Lisbon (←Madrid)
  { pos: [-118.2, 34.1], parent: 15, delay: 0.3 }, // 29 LA (←NYC)
  { pos: [-79.4, 43.7], parent: 15, delay: 0.5 },  // 30 Toronto (←NYC)
  { pos: [-99.1, 19.4], parent: 15, delay: 0.8 },  // 31 Mexico City (←NYC)
  { pos: [-43.2, -22.9], parent: 15, delay: 1.1 }, // 32 Rio (←NYC, far south)

  // Gen 4 — tertiary outbreaks, all close neighbors
  { pos: [114.2, 22.3], parent: 16, delay: 0.3 },  // 33 Hong Kong (←Shanghai)
  { pos: [74.4, 31.5], parent: 21, delay: 0.3 },   // 34 Lahore (←Karachi)
  { pos: [51.4, 35.7], parent: 22, delay: 0.3 },   // 35 Tehran (←Dubai)
  { pos: [46.7, 24.6], parent: 22, delay: 0.5 },   // 36 Riyadh (←Dubai)
  { pos: [30.5, 50.5], parent: 26, delay: 0.4 },   // 37 Kiev (←Moscow)
  { pos: [21.0, 52.2], parent: 26, delay: 0.6 },   // 38 Warsaw (←Moscow)
  { pos: [15.3, -4.3], parent: 27, delay: 0.4 },   // 39 Kinshasa (←Lagos)
  { pos: [18.4, -33.9], parent: 27, delay: 0.7 },  // 40 Cape Town (←Lagos)
  { pos: [-122.4, 37.8], parent: 29, delay: 0.3 }, // 41 San Francisco (←LA)
  { pos: [-122.3, 47.6], parent: 29, delay: 0.5 }, // 42 Seattle (←LA)
  { pos: [-73.6, 45.5], parent: 30, delay: 0.3 },  // 43 Montreal (←Toronto)
  { pos: [-87.6, 41.9], parent: 30, delay: 0.5 },  // 44 Chicago (←Toronto)
  { pos: [-74.1, 4.6], parent: 31, delay: 0.4 },   // 45 Bogota (←Mexico City)
  { pos: [-58.4, -34.6], parent: 31, delay: 0.9 }, // 46 Buenos Aires (←Mexico City)
  { pos: [-46.6, -23.5], parent: 32, delay: 0.3 }, // 47 Sao Paulo (←Rio)
];

// Animation timing (seconds).
const ARC_DURATION = 0.8;
const RESPONSE_DELAY = 4.0; // each dot turns green this long after it is hit
const FADE_DURATION = 2.0;

// Pre-compute when each arc starts being drawn and when it lands.
const ARC_START: number[] = [];
const LAND_TIME: number[] = [];
for (let i = 0; i < TREE.length; i++) {
  if (TREE[i].parent === -1) {
    ARC_START.push(-1); // root has no arc
    LAND_TIME.push(0);
  } else {
    const s = LAND_TIME[TREE[i].parent] + TREE[i].delay;
    ARC_START.push(s);
    LAND_TIME.push(s + ARC_DURATION);
  }
}
const ORIGIN_RESPONSE = Math.max(...LAND_TIME) + RESPONSE_DELAY;

export default function SpreadGlobeInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const ctxEl = canvasEl.getContext("2d");
    if (!ctxEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctx: CanvasRenderingContext2D = ctxEl;

    let topo: Topology | null = null;
    let landMesh: ReturnType<typeof topoMesh> | null = null;
    let raf = 0;
    let mounted = true;
    let start = 0;
    let lastFrame = 0;

    // Pull theme colors (set once — no need to react to changes mid-animation).
    const styles = getComputedStyle(document.documentElement);
    const cssVar = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const COLOR_MESH = cssVar("--blue", "#1f4dab");
    const COLOR_GRATICULE = "rgba(31, 77, 171, 0.22)";
    const COLOR_SPHERE = "rgba(31, 77, 171, 0.45)";
    const COLOR_VIRUS = "#d62828";
    const COLOR_SHIELD = cssVar("--color-accent", "#2ecc71");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const projection = geoOrthographic().precision(0.5);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();
    const sphere = { type: "Sphere" as const };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause when off-screen or tab hidden.
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduceMotion && !raf) {
          lastFrame = performance.now();
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      } else if (visible && !reduceMotion && !raf) {
        lastFrame = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    fetch("/data/countries-110m.json")
      .then((r) => r.json())
      .then((t: Topology) => {
        if (!mounted) return;
        topo = t;
        landMesh = topoMesh(
          topo,
          topo.objects.countries as GeometryCollection,
        );
        start = performance.now();
        lastFrame = start;
        if (reduceMotion) {
          // Render a single static frame deep into the response phase.
          drawAt(12);
        } else if (!raf) {
          raf = requestAnimationFrame(loop);
        }
      })
      .catch((err) => {
        console.error("[SpreadGlobe] failed to load topology", err);
      });

    let rotationLon = -30; // view center ~30°E; China at 114°E sits on the right side
    const ROT_SPEED = 4; // deg/sec — slow enough that China stays in view during cascade
    const ARC_LIFT = 0.18; // peak altitude of arcs as a fraction of globe radius

    function loop(now: number) {
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      rotationLon -= ROT_SPEED * dt;
      drawAt((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    }

    function drawAt(t: number) {
      if (!landMesh) return;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (W < 2 || H < 2) return;
      const R = Math.min(W, H) / 2 - 6;

      projection
        .scale(R)
        .translate([W / 2, H / 2])
        .rotate([rotationLon, -15]);

      ctx.clearRect(0, 0, W, H);

      // Visible-hemisphere center in geographic coords.
      const [lam, phi] = projection.rotate();
      const center: LonLat = [-lam, -phi];

      // Sphere outline.
      ctx.beginPath();
      path(sphere);
      ctx.strokeStyle = COLOR_SPHERE;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graticule.
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = COLOR_GRATICULE;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Land outlines.
      ctx.beginPath();
      path(landMesh);
      ctx.strokeStyle = COLOR_MESH;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Outbreak tree: each arc draws from its parent's location, lifted in
      // screen space so it appears to bounce above the globe.
      const cx = W / 2;
      const cy = H / 2;
      for (let i = 1; i < TREE.length; i++) {
        const arcStart = ARC_START[i];
        if (t < arcStart) continue;
        const node = TREE[i];
        const from = TREE[node.parent].pos;
        const to = node.pos;
        const arcProgress = Math.min(1, (t - arcStart) / ARC_DURATION);

        const interp = geoInterpolate(from, to);
        const steps = 32;
        const visibleSteps = Math.max(2, Math.ceil(steps * arcProgress));

        const responseT = LAND_TIME[i] + RESPONSE_DELAY;
        const respondedFor = t - responseT;
        const isResponded = respondedFor > 0;
        const fadeAlpha = isResponded
          ? Math.max(0, 1 - respondedFor / FADE_DURATION)
          : 1;

        ctx.beginPath();
        let started = false;
        for (let k = 0; k <= visibleSteps; k++) {
          const s = k / steps;
          const pt = interp(s) as LonLat;
          // Skip points on the back hemisphere — they shouldn't contribute.
          if (geoDistance(pt, center) >= Math.PI / 2) {
            started = false;
            continue;
          }
          const projected = projection(pt);
          if (!projected) {
            started = false;
            continue;
          }
          // Lift radially from screen center; for orthographic this is
          // equivalent to raising the 3D point along its surface normal by
          // ARC_LIFT * sin(πs) * R.
          const lift = 1 + ARC_LIFT * Math.sin(Math.PI * s);
          const lx = cx + (projected[0] - cx) * lift;
          const ly = cy + (projected[1] - cy) * lift;
          if (!started) {
            ctx.moveTo(lx, ly);
            started = true;
          } else {
            ctx.lineTo(lx, ly);
          }
        }
        ctx.strokeStyle = isResponded ? COLOR_SHIELD : COLOR_VIRUS;
        ctx.globalAlpha = isResponded ? 0.5 * fadeAlpha : 0.85;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (arcProgress >= 1) {
          const destVisible = geoDistance(to, center) < Math.PI / 2;
          if (destVisible) {
            const projected = projection(to);
            if (projected) {
              const [dx, dy] = projected;
              ctx.fillStyle = isResponded ? COLOR_SHIELD : COLOR_VIRUS;
              ctx.beginPath();
              ctx.arc(dx, dy, 2.8, 0, Math.PI * 2);
              ctx.fill();

              if (isResponded) {
                const ringT = respondedFor % 2.2;
                ctx.strokeStyle = COLOR_SHIELD;
                ctx.globalAlpha = Math.max(0, 1 - ringT / 2.2) * 0.7;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(dx, dy, 3 + ringT * 14, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
              }
            }
          }
        }
      }

      // Origin dot (visible from t=0; responds last).
      const origin = TREE[0].pos;
      const originVisible = geoDistance(origin, center) < Math.PI / 2;
      if (originVisible) {
        const projected = projection(origin);
        if (projected) {
          const [ox, oy] = projected;
          const isResponded = t > ORIGIN_RESPONSE;
          ctx.fillStyle = isResponded ? COLOR_SHIELD : COLOR_VIRUS;
          ctx.beginPath();
          ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      role="img"
      aria-label="Animated globe showing a virus spreading from a single origin, then countermeasures deploying worldwide"
    />
  );
}
