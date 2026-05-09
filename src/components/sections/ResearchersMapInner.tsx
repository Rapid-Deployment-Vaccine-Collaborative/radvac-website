"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { researchers, type Researcher } from "@/data/researchers";
import styles from "./ResearchersMap.module.css";

// Leaflet's default icon URLs are broken under bundlers — point them at the CDN.
function fixDefaultIcon() {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
    ._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

function locationLine(r: Researcher) {
  return [r.city, r.state, r.country].filter(Boolean).join(", ");
}

export default function ResearchersMapInner() {
  useEffect(() => {
    fixDefaultIcon();
  }, []);

  return (
    <div className={styles.wrap}>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        scrollWheelZoom={false}
        worldCopyJump
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {researchers.map((r) => {
          const flags: string[] = [];
          if (r.scienceDegree) flags.push("Science degree");
          if (r.labSkills) flags.push("Basic lab skills");
          if (r.labSpace) flags.push("Lab space / materials");
          return (
            <Marker key={r.id} position={[r.lat, r.lng]}>
              <Popup>
                <div className={styles.popup}>
                  <h4>{r.name}</h4>
                  <p className={styles.loc}>{locationLine(r)}</p>
                  {r.email ? (
                    <p>
                      <a href={`mailto:${r.email}`}>{r.email}</a>
                    </p>
                  ) : null}
                  {flags.length ? (
                    <ul className={styles.flags}>
                      {flags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : null}
                  {r.notes ? <p className={styles.notes}>{r.notes}</p> : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
