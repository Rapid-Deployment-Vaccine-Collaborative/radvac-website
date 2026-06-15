// Flat-SVG wireframe icons for the yeast-vaccine pages.
//
// These echo the blue wireframe aesthetic of the site's three.js project
// graphics (src/components/sections/swissCheese/objects.ts, WIRE_COLOR
// 0x3a8ad8): thin blue edges over faint translucent fills. Keeping them as
// SVG (rather than WebGL) makes them cheap to render many at once and easy to
// recolour via `currentColor`.

import type { CSSProperties, ReactElement, ReactNode } from "react";

export type WireIconKind =
  | "capsid"
  | "plasmid"
  | "culture"
  | "factory"
  | "drink";

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

/** Faceted icosahedral capsid — the viral antigen. Faint rose fill. */
export function CapsidIcon(props: IconProps) {
  const outer = "60,14 100,37 100,83 60,106 20,83 20,37";
  const inner = "84,60 72,80.8 48,80.8 36,60 48,39.2 72,39.2";
  return (
    <Svg {...props}>
      <polygon points={outer} fill={ROSE} fillOpacity={0.1} />
      <polygon points={inner} fill={ROSE} fillOpacity={0.16} />
      <line x1="60" y1="14" x2="48" y2="39.2" />
      <line x1="60" y1="14" x2="72" y2="39.2" />
      <line x1="100" y1="37" x2="72" y2="39.2" />
      <line x1="100" y1="37" x2="84" y2="60" />
      <line x1="100" y1="83" x2="84" y2="60" />
      <line x1="100" y1="83" x2="72" y2="80.8" />
      <line x1="60" y1="106" x2="72" y2="80.8" />
      <line x1="60" y1="106" x2="48" y2="80.8" />
      <line x1="20" y1="83" x2="48" y2="80.8" />
      <line x1="20" y1="83" x2="36" y2="60" />
      <line x1="20" y1="37" x2="36" y2="60" />
      <line x1="20" y1="37" x2="48" y2="39.2" />
    </Svg>
  );
}

/** Circular plasmid map with an inserted (rose) antigen gene. */
export function PlasmidIcon(props: IconProps) {
  // restriction-site ticks around the ring
  const dots = [
    [101.3, 45],
    [67.6, 16.7],
    [26.3, 31.7],
    [18.7, 75],
    [48.6, 102.5],
    [88.3, 93.7],
  ];
  return (
    <Svg {...props}>
      <circle cx="60" cy="60" r="44" fill={WIRE} fillOpacity={0.05} />
      <circle cx="60" cy="60" r="36" />
      {/* inserted gene = bold rose arc */}
      <path
        d="M102.5,71.4 A44,44 0 0 1 88,98"
        stroke={ROSE}
        strokeWidth={5}
      />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill={WIRE} stroke="none" />
      ))}
    </Svg>
  );
}

/** Budding yeast cells (mother + buds). Faint amber fill. */
export function CultureIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* Cell A – large mother, tilted, with bud sprouting upper-left */}
      <ellipse cx="46" cy="76" rx="26" ry="19" transform="rotate(-15 46 76)" fill={AMBER} fillOpacity={0.16} />
      <ellipse cx="32" cy="50" rx="14" ry="11" transform="rotate(-10 32 50)" fill={AMBER} fillOpacity={0.16} />
      {/* nucleus A */}
      <circle cx="47" cy="77" r="5" />

      {/* Cell B – medium mother tilted right, bud at upper-right */}
      <ellipse cx="83" cy="40" rx="19" ry="14" transform="rotate(18 83 40)" fill={AMBER} fillOpacity={0.16} />
      <ellipse cx="97" cy="26" rx="10" ry="8" transform="rotate(12 97 26)" fill={AMBER} fillOpacity={0.16} />
      {/* nucleus B */}
      <circle cx="83" cy="41" r="4" />

      {/* Cell C – small solo cell, lower-right */}
      <ellipse cx="91" cy="89" rx="13" ry="10" transform="rotate(22 91 89)" fill={AMBER} fillOpacity={0.16} />
    </Svg>
  );
}

/** A yeast cell full of empty viral shells — the "factory". */
export function FactoryIcon(props: IconProps) {
  // Mini faceted icosahedron matching CapsidIcon: outer pointy-top hexagon,
  // inner flat-top hexagon (rotated 30°), and 12 lines connecting each outer
  // vertex to its two nearest inner vertices.
  const facetedShell = (cx: number, cy: number, r: number, key: number) => {
    const innerR = r * 0.52;
    const outer: [number, number][] = [
      [cx, cy - r],
      [cx + r * 0.866, cy - r * 0.5],
      [cx + r * 0.866, cy + r * 0.5],
      [cx, cy + r],
      [cx - r * 0.866, cy + r * 0.5],
      [cx - r * 0.866, cy - r * 0.5],
    ];
    const inner: [number, number][] = [
      [cx + innerR, cy],
      [cx + innerR * 0.5, cy + innerR * 0.866],
      [cx - innerR * 0.5, cy + innerR * 0.866],
      [cx - innerR, cy],
      [cx - innerR * 0.5, cy - innerR * 0.866],
      [cx + innerR * 0.5, cy - innerR * 0.866],
    ];
    const fmt = (pts: [number, number][]) =>
      pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    return (
      <g key={key}>
        <polygon points={fmt(outer)} fill={ROSE} fillOpacity={0.1} />
        <polygon points={fmt(inner)} fill={ROSE} fillOpacity={0.18} />
        {outer.map(([ox, oy], k) => {
          const i1 = (k + 4) % 6;
          const i2 = (k + 5) % 6;
          return (
            <g key={k}>
              <line
                x1={ox.toFixed(1)}
                y1={oy.toFixed(1)}
                x2={inner[i1][0].toFixed(1)}
                y2={inner[i1][1].toFixed(1)}
              />
              <line
                x1={ox.toFixed(1)}
                y1={oy.toFixed(1)}
                x2={inner[i2][0].toFixed(1)}
                y2={inner[i2][1].toFixed(1)}
              />
            </g>
          );
        })}
      </g>
    );
  };
  return (
    <Svg {...props}>
      <ellipse cx="58" cy="62" rx="46" ry="42" fill={AMBER} fillOpacity={0.16} />
      {/* small bud */}
      <circle cx="98" cy="30" r="12" fill={AMBER} fillOpacity={0.16} />
      {facetedShell(44, 52, 12, 1)}
      {facetedShell(72, 50, 12, 2)}
      {facetedShell(57, 80, 12, 3)}
    </Svg>
  );
}

/** Drink it → antibodies. A wireframe glass with shells, antibodies rising. */
export function DrinkIcon(props: IconProps) {
  const antibody = (x: number, y: number, s: number, key: number) => (
    <g key={key} stroke={WIRE}>
      <line x1={x} y1={y} x2={x} y2={y - s} />
      <line x1={x} y1={y - s} x2={x - s * 0.7} y2={y - s * 1.7} />
      <line x1={x} y1={y - s} x2={x + s * 0.7} y2={y - s * 1.7} />
    </g>
  );
  return (
    <Svg {...props}>
      {/* antibodies rising */}
      {antibody(28, 30, 9, 1)}
      {antibody(94, 34, 9, 2)}
      {/* glass */}
      <polygon points="40,46 82,46 75,108 47,108" fill="none" />
      {/* liquid */}
      <path
        d="M42,64 C50,60 60,68 70,63 C75,61 79,62 80.5,64 L75,108 L47,108 Z"
        fill={AMBER}
        fillOpacity={0.22}
        stroke="none"
      />
      <path d="M42,64 C50,60 60,68 70,63 C75,61 79,62 80.5,64" />
      {/* a released shell in the liquid */}
      <polygon
        points="61,84 69,80 69,88 61,92 53,88 53,80"
        fill={ROSE}
        fillOpacity={0.16}
      />
    </Svg>
  );
}

const ICONS: Record<WireIconKind, (p: IconProps) => ReactElement> = {
  capsid: CapsidIcon,
  plasmid: PlasmidIcon,
  culture: CultureIcon,
  factory: FactoryIcon,
  drink: DrinkIcon,
};

export function WireIcon({ kind, ...rest }: { kind: WireIconKind } & IconProps) {
  const Cmp = ICONS[kind];
  return <Cmp {...rest} />;
}

/**
 * Large hero capsid — a bigger faceted icosahedron used as the focal graphic.
 * Animate the wrapper (slow spin) via CSS in the page module.
 */
export function CapsidHero({
  size = 320,
  className,
  style,
}: IconProps) {
  return <CapsidIcon size={size} className={className} style={style} />;
}
