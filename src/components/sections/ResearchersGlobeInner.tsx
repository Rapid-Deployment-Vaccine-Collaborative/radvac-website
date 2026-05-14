"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { MeshPhongMaterial } from "three";
import { researchers, type Researcher } from "@/data/researchers";
import styles from "./ResearchersGlobe.module.css";

type PolygonFeature = {
  type: "Feature";
  properties: Record<string, unknown> & { _layer?: "country" | "state" };
  geometry: { type: string; coordinates: unknown };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: PolygonFeature[];
};

const COUNTRIES_URL = "/data/ne_110m_admin_0_countries.geojson";
const US_STATES_URL = "/data/us-continental-states.geojson";

function locationLine(r: Researcher) {
  return [r.city, r.state, r.country].filter(Boolean).join(", ");
}

export default function ResearchersGlobeInner() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [polygons, setPolygons] = useState<PolygonFeature[]>([]);
  const [selected, setSelected] = useState<Researcher | null>(null);
  const [hint, setHint] = useState(true);

  // Track wrap size for the Globe canvas
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load country + US state borders as GeoJSON, in parallel
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tag = (
        features: PolygonFeature[],
        layer: "country" | "state",
      ): PolygonFeature[] =>
        features.map((f) => ({
          ...f,
          properties: { ...f.properties, _layer: layer },
        }));
      const fetchJson = async (
        url: string,
        layer: "country" | "state",
      ): Promise<PolygonFeature[]> => {
        try {
          const res = await fetch(url);
          const fc = (await res.json()) as FeatureCollection;
          return tag(fc.features ?? [], layer);
        } catch {
          return [];
        }
      };
      const [countries, states] = await Promise.all([
        fetchJson(COUNTRIES_URL, "country"),
        fetchJson(US_STATES_URL, "state"),
      ]);
      if (cancelled) return;
      setPolygons([...countries, ...states]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fade the hint after a few seconds even if user doesn't interact
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // One-time setup once globe is mounted: auto-rotate, zoom limits, initial POV
  const handleGlobeReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableDamping = true;
    controls.minDistance = 110;
    controls.maxDistance = 600;
    const stop = () => {
      controls.autoRotate = false;
      controls.removeEventListener("start", stop);
      setHint(false);
    };
    controls.addEventListener("start", stop);
    globe.pointOfView({ lat: 25, lng: 10, altitude: 2.4 }, 0);
  }, []);

  // Fully opaque sphere — created once. Opaque material lets three.js depth-test
  // back-facing polygons correctly so they don't bleed through.
  const globeMaterial = useMemo(
    () => new MeshPhongMaterial({ color: 0x0a1628 }),
    [],
  );

  const polygonCapColor = useCallback(
    () => "rgba(126, 197, 255, 0.06)",
    [],
  );
  const polygonSideColor = useCallback(() => "rgba(0, 0, 0, 0)", []);
  const polygonStrokeColor = useCallback(
    (d: object) =>
      (d as PolygonFeature).properties._layer === "state"
        ? "rgba(126, 197, 255, 0.45)"
        : "#7ec5ff",
    [],
  );

  const htmlElement = useCallback((d: object) => {
    const r = d as Researcher;
    const el = document.createElement("div");
    el.className = styles.pin;
    const loc = locationLine(r);
    el.title = loc ? `${r.name} — ${loc}` : r.name;
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      setSelected(r);
    });
    return el;
  }, []);

  // Hide pins on the back hemisphere — HTML elements don't depth-test against
  // the WebGL globe, so we toggle display when the library reports them
  // occluded. CSS defaults .pin to `display: none`, so back-side pins stay
  // hidden until the modifier explicitly reveals them.
  const htmlVisibility = useCallback(
    (el: HTMLElement, isVisible: boolean) => {
      el.style.display = isVisible ? "block" : "none";
    },
    [],
  );

  return (
    <div ref={wrapRef} className={styles.wrap}>
      {size.w > 0 && size.h > 0 ? (
        <Globe
          ref={globeRef}
          width={size.w}
          height={size.h}
          onGlobeReady={handleGlobeReady}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere
          atmosphereColor="#7ec5ff"
          atmosphereAltitude={0.18}
          globeMaterial={globeMaterial}
          polygonsData={polygons}
          polygonsTransitionDuration={0}
          polygonCapColor={polygonCapColor}
          polygonSideColor={polygonSideColor}
          polygonStrokeColor={polygonStrokeColor}
          polygonAltitude={0.005}
          htmlElementsData={researchers}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.005}
          htmlElement={htmlElement}
          htmlElementVisibilityModifier={htmlVisibility}
          htmlTransitionDuration={0}
        />
      ) : null}

      {hint ? (
        <div className={styles.hint} aria-hidden>
          drag to spin · scroll to zoom
        </div>
      ) : null}

      {selected ? (
        <aside className={styles.panel} aria-live="polite">
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
          <h4 className={styles.name}>{selected.name}</h4>
          {locationLine(selected) ? (
            <p className={styles.loc}>{locationLine(selected)}</p>
          ) : null}
          {selected.email ? (
            <p className={styles.email}>
              <a href={`mailto:${selected.email}`}>{selected.email}</a>
            </p>
          ) : null}
          {(selected.scienceDegree ||
            selected.labSkills ||
            selected.labSpace) && (
            <ul className={styles.flags}>
              {selected.scienceDegree ? <li>Science degree</li> : null}
              {selected.labSkills ? <li>Basic lab skills</li> : null}
              {selected.labSpace ? <li>Lab space / materials</li> : null}
            </ul>
          )}
          {selected.notes ? (
            <p className={styles.notes}>{selected.notes}</p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
