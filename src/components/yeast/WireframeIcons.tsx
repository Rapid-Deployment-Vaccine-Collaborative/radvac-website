// Flat-SVG wireframe icons for the bfiat related pages.
//
// These echo the blue wireframe aesthetic of the site's three.js project
// graphics (src/components/sections/swissCheese/objects.ts, WIRE_COLOR
// 0x3a8ad8): thin blue edges over faint translucent fills. Keeping them as
// SVG (rather than WebGL) makes them cheap to render many at once and easy to
// recolour via `currentColor`.

import type { CSSProperties, ReactElement, ReactNode } from "react";

import styles from "./Yeast.module.css";

export type WireIconKind =
  | "capsid"
  | "plasmid"
  | "culture"
  | "factory"
  | "drink";

const WIRE = "#3a8ad8";
const ROSE = "#e0556a";
const LIGHT_ROSE = "#fadce0";
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
      {/* Cell A – two haploid cells joined (sexual reproduction / zygote).
          External tangent lines give a smooth peanut outline. */}
      <path
        d="M 26 60 A 12 12 0 0 1 44 44 L 68.5 68.7 A 14 14 0 0 1 47.5 87.3 Z"
        fill={AMBER}
        fillOpacity={0.16}
      />

      {/* Cell B – budding yeast: mother + small bud joined smoothly. */}
      <path
        d="M 73.1 30.1 A 14 14 0 0 0 92.9 49.9 L 101.9 30.9 A 7 7 0 0 0 92.1 21.1 Z"
        fill={AMBER}
        fillOpacity={0.16}
      />

      {/* Cell C – small solo cell, lower-right */}
      <ellipse cx="91" cy="89" rx="13" ry="10" transform="rotate(22 91 89)" fill={AMBER} fillOpacity={0.16} />
    </Svg>
  );
}

/** A yeast cell full of viral shells — single smooth organic outline with membrane bleb. */
export function FactoryIcon(props: IconProps) {
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
      <g key={key} className={styles.factoryShell}>
        <polygon points={fmt(outer)} fill={LIGHT_ROSE} />
        <polygon points={fmt(inner)} fill={ROSE} fillOpacity={0.28} />
        {outer.map(([ox, oy], k) => {
          const i1 = (k + 4) % 6;
          const i2 = (k + 5) % 6;
          return (
            <g key={k}>
              <line x1={ox.toFixed(1)} y1={oy.toFixed(1)} x2={inner[i1][0].toFixed(1)} y2={inner[i1][1].toFixed(1)} />
              <line x1={ox.toFixed(1)} y1={oy.toFixed(1)} x2={inner[i2][0].toFixed(1)} y2={inner[i2][1].toFixed(1)} />
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <Svg {...props}>
      {/* Single smooth closed path: main cell body + membrane bleb on upper-right */}
      <path
        d="M 58,14 C 78,11 94,17 100,34 C 108,47 108,57 100,67 C 92,81 78,97 58,106 C 38,114 18,102 8,84 C 2,64 8,38 22,26 C 36,14 50,12 58,14 Z"
        fill={AMBER}
        fillOpacity={0.16}
      />
      {facetedShell(38, 48, 14, 1)}
      {facetedShell(68, 46, 14, 2)}
      {facetedShell(52, 78, 14, 3)}
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
      {antibody(61, 24, 9, 2)}
      {antibody(94, 34, 9, 3)}
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
