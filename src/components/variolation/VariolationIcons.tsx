// Flat-SVG wireframe icons for the /modernized-variolation page.
//
// Same aesthetic as src/components/yeast/WireframeIcons.tsx — thin blue edges
// over faint translucent fills, echoing the site's three.js project graphics
// (WIRE_COLOR 0x3a8ad8). Kept as SVG so they are cheap to render at any size
// and recolour via `currentColor`.

import type { CSSProperties, ReactElement, ReactNode } from "react";

export type MvIconKind =
  | "collect"
  | "treat"
  | "administer"
  | "immunity";

const WIRE = "#3a8ad8";
const ROSE = "#e0556a";
const AMBER = "#e8a93a";

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

function Svg({
  size = 96,
  className,
  style,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
      style={{ color: WIRE, display: "block", ...style }}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Graduated collection tube holding a donor sample. Faint rose contents. */
export function CollectIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* contents */}
      <path
        d="M45,70 L45,82 A15,15 0 0 0 75,82 L75,70 Z"
        fill={ROSE}
        fillOpacity={0.16}
        stroke="none"
      />
      {/* tube body with rounded base */}
      <path d="M45,32 L45,82 A15,15 0 0 0 75,82 L75,32" />
      {/* meniscus */}
      <line x1="45" y1="70" x2="75" y2="70" stroke={ROSE} strokeWidth={2.4} />
      {/* cap */}
      <rect x="41" y="18" width="38" height="14" rx="3" fill={WIRE} fillOpacity={0.08} />
      {/* graduation ticks */}
      <line x1="45" y1="44" x2="52" y2="44" />
      <line x1="45" y1="53" x2="52" y2="53" />
      <line x1="45" y1="62" x2="52" y2="62" />
    </Svg>
  );
}

/**
 * Hydrogen peroxide (H–O–O–H) above a nicked genome strand: the oxidative
 * damage that stops — or slows — replication.
 */
export function TreatIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* peroxide bond O–O */}
      <line x1="50" y1="36" x2="70" y2="36" />
      <circle cx="50" cy="36" r="11" fill={WIRE} fillOpacity={0.09} />
      <circle cx="70" cy="36" r="11" fill={WIRE} fillOpacity={0.09} />
      {/* terminal hydrogens */}
      <line x1="30" y1="24" x2="42" y2="31" />
      <line x1="78" y1="41" x2="90" y2="48" />
      <circle cx="27" cy="22" r="6" fill={WIRE} fillOpacity={0.05} />
      <circle cx="93" cy="50" r="6" fill={WIRE} fillOpacity={0.05} />
      {/* genome strand, broken mid-span */}
      <path d="M14,88 C24,76 34,100 44,88 C52,78 58,96 66,89" />
      <path d="M84,89 C92,80 98,96 106,88" />
      {/* oxidised base at the lesion */}
      <line x1="71" y1="80" x2="79" y2="96" stroke={ROSE} strokeWidth={2.6} />
      <line x1="79" y1="80" x2="71" y2="96" stroke={ROSE} strokeWidth={2.6} />
    </Svg>
  );
}

/**
 * Head in profile with an inoculum entering the nasal passage — the first
 * route Radvac uses against a respiratory pathogen.
 */
export function AdministerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M92,100 L92,66 C92,42 76,26 58,26 C45,26 35,34 31,45 L23,58 C21,62 24,66 28,66 L31,66 L31,78 C31,86 37,90 45,90 L47,90 L47,100"
        fill={WIRE}
        fillOpacity={0.06}
      />
      {/* inoculum travelling into the nostril */}
      <line x1="4" y1="60" x2="17" y2="60" stroke={AMBER} strokeWidth={2.4} />
      <path d="M13,56 L18,60 L13,64" stroke={AMBER} strokeWidth={2.4} />
      <circle cx="8" cy="48" r="2.6" fill={ROSE} stroke="none" />
      <circle cx="16" cy="72" r="2.6" fill={ROSE} stroke="none" />
    </Svg>
  );
}

/** Shield holding antibodies — mucosal plus systemic protection. */
export function ImmunityIcon(props: IconProps) {
  const antibody = (x: number, y: number, s: number, key: number) => (
    <g key={key}>
      <line x1={x} y1={y} x2={x} y2={y - s} />
      <line x1={x} y1={y - s} x2={x - s * 0.7} y2={y - s * 1.7} />
      <line x1={x} y1={y - s} x2={x + s * 0.7} y2={y - s * 1.7} />
    </g>
  );
  return (
    <Svg {...props}>
      <path
        d="M60,16 L96,29 C96,68 81,94 60,105 C39,94 24,68 24,29 Z"
        fill={WIRE}
        fillOpacity={0.08}
      />
      {antibody(45, 74, 10, 1)}
      {antibody(75, 74, 10, 2)}
      {antibody(60, 92, 10, 3)}
    </Svg>
  );
}

const ICONS: Record<MvIconKind, (p: IconProps) => ReactElement> = {
  collect: CollectIcon,
  treat: TreatIcon,
  administer: AdministerIcon,
  immunity: ImmunityIcon,
};

export function MvIcon({ kind, ...rest }: { kind: MvIconKind } & IconProps) {
  const Cmp = ICONS[kind];
  return <Cmp {...rest} />;
}

/**
 * Hero graphic: a faceted capsid inside a shield, its edges broken where
 * oxidative treatment has disabled replication, antibodies rising around it.
 */
export function VariolationHeroArt() {
  const cx = 60;
  const cy = 58;
  const r = 26;
  const pts: [number, number][] = [
    [cx, cy - r],
    [cx + r * 0.866, cy - r * 0.5],
    [cx + r * 0.866, cy + r * 0.5],
    [cx, cy + r],
    [cx - r * 0.866, cy + r * 0.5],
    [cx - r * 0.866, cy - r * 0.5],
  ];
  const fmt = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg
      viewBox="0 0 120 120"
      // Fills .aHeroArt, which shrinks from 260px to 110px on narrow widths.
      width="100%"
      height="100%"
      style={{ color: WIRE, display: "block" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* shield */}
      <path
        d="M60,8 L108,25 C108,73 86,106 60,118 C34,106 12,73 12,25 Z"
        fill={WIRE}
        fillOpacity={0.07}
      />
      {/* capsid, drawn with broken edges = partial inactivation */}
      <polygon points={fmt} fill={ROSE} fillOpacity={0.12} stroke="none" />
      <polygon
        points={fmt}
        stroke={ROSE}
        strokeWidth={2}
        strokeDasharray="9 6"
      />
      {/* internal struts */}
      {pts.map(([x, y], i) => (
        <line
          key={i}
          x1={x.toFixed(1)}
          y1={y.toFixed(1)}
          x2={cx}
          y2={cy}
          stroke={ROSE}
          strokeOpacity={0.35}
          strokeWidth={1.2}
        />
      ))}
      {/* peroxide droplets arriving */}
      <circle cx="30" cy="34" r="3.4" fill={AMBER} stroke="none" />
      <circle cx="92" cy="40" r="3.4" fill={AMBER} stroke="none" />
      <circle cx="38" cy="76" r="3.4" fill={AMBER} stroke="none" />
      {/* antibodies */}
      {[
        [60, 104, 11],
        [40, 96, 9],
        [80, 96, 9],
      ].map(([x, y, s], i) => (
        <g key={`ab-${i}`}>
          <line x1={x} y1={y} x2={x} y2={y - s} />
          <line x1={x} y1={y - s} x2={x - s * 0.7} y2={y - s * 1.7} />
          <line x1={x} y1={y - s} x2={x + s * 0.7} y2={y - s * 1.7} />
        </g>
      ))}
    </svg>
  );
}
