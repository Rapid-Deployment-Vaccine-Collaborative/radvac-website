// Flat-SVG wireframe icons for the /fril-draft page.
//
// Same aesthetic as yeast/WireframeIcons.tsx and variolation/VariolationIcons.tsx
// — thin blue edges over faint translucent fills, echoing the site's three.js
// project graphics (WIRE_COLOR 0x3a8ad8).

import type { CSSProperties, ReactNode } from "react";

export type FrilIconKind = "bean" | "purify" | "formulate" | "assay" | "study";

const WIRE = "#3a8ad8";
const GREEN = "#58c97a";
const AMBER = "#e8a93a";
const ROSE = "#e0556a";

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

/** Hyacinth bean pod with seeds — the source material. */
export function BeanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* pod */}
      <path
        d="M22,74 C34,40 62,24 94,28 C92,60 68,86 34,88 Z"
        fill={GREEN}
        fillOpacity={0.14}
      />
      <path d="M22,74 C34,40 62,24 94,28" />
      <path d="M22,74 C44,80 72,64 94,28" strokeOpacity={0.5} />
      {/* seeds */}
      <ellipse cx="44" cy="68" rx="8" ry="6.5" transform="rotate(-32 44 68)" />
      <ellipse cx="60" cy="54" rx="8" ry="6.5" transform="rotate(-32 60 54)" />
      <ellipse cx="76" cy="41" rx="8" ry="6.5" transform="rotate(-32 76 41)" />
      {/* stem */}
      <path d="M22,74 L14,86" strokeWidth={2.4} />
    </Svg>
  );
}

/** Two-step purification: column over a collection vessel. */
export function PurifyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* funnel/column */}
      <path d="M32,20 L88,20 L68,56 L68,70 L52,70 L52,56 Z" fill={WIRE} fillOpacity={0.07} />
      {/* bed of resin */}
      <path d="M44,41 L76,41" strokeWidth={2.4} strokeOpacity={0.75} />
      <path d="M40,34 L80,34" strokeOpacity={0.45} />
      {/* drip */}
      <circle cx="60" cy="80" r="3" fill={GREEN} stroke="none" />
      {/* beaker */}
      <path d="M38,88 L38,100 A6,6 0 0 0 44,106 L76,106 A6,6 0 0 0 82,100 L82,88 Z"
        fill={GREEN} fillOpacity={0.16} />
      <path d="M38,88 L38,100 A6,6 0 0 0 44,106 L76,106 A6,6 0 0 0 82,100 L82,88" />
      <line x1="34" y1="88" x2="86" y2="88" />
    </Svg>
  );
}

/** Intranasal spray bottle with a plume. */
export function FormulateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* bottle */}
      <rect x="42" y="54" width="36" height="52" rx="7" fill={GREEN} fillOpacity={0.16} />
      <rect x="42" y="54" width="36" height="52" rx="7" />
      {/* pump collar */}
      <rect x="38" y="46" width="44" height="10" rx="3" fill={WIRE} fillOpacity={0.1} />
      {/* nozzle */}
      <path d="M52,46 L52,28 L68,28 L68,46" />
      {/* plume */}
      <path d="M60,26 Q58,16 48,12" strokeWidth={1.6} strokeOpacity={0.75} />
      <path d="M62,26 Q64,14 76,10" strokeWidth={1.6} strokeOpacity={0.75} />
      <circle cx="44" cy="10" r="2.4" fill={GREEN} stroke="none" />
      <circle cx="80" cy="9" r="2.4" fill={GREEN} stroke="none" />
      <circle cx="62" cy="6" r="2" fill={GREEN} stroke="none" />
      {/* fill line */}
      <line x1="42" y1="74" x2="78" y2="74" stroke={GREEN} strokeWidth={2.2} />
    </Svg>
  );
}

/** Neutralization assay: a well plate with a dose-response gradient. */
export function AssayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="16" y="30" width="88" height="60" rx="6" fill={WIRE} fillOpacity={0.06} />
      <rect x="16" y="30" width="88" height="60" rx="6" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const cx = 31 + col * 20;
          const cy = 45 + row * 18;
          // Left-to-right gradient: virus killed off as the dose rises.
          const fade = [0.55, 0.38, 0.2, 0.06][col];
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r="7"
              fill={ROSE}
              fillOpacity={fade}
              stroke={WIRE}
              strokeWidth={1.6}
            />
          );
        }),
      )}
      {/* dose arrow */}
      <path d="M26,102 L98,102" strokeWidth={1.8} strokeOpacity={0.7} />
      <path d="M92,98 L98,102 L92,106" strokeWidth={1.8} strokeOpacity={0.7} />
    </Svg>
  );
}

/** Consented self-administration study: people plus a logged record. */
export function StudyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      {/* clipboard */}
      <rect x="28" y="22" width="52" height="68" rx="6" fill={WIRE} fillOpacity={0.07} />
      <rect x="28" y="22" width="52" height="68" rx="6" />
      <rect x="44" y="15" width="20" height="13" rx="3" fill={WIRE} fillOpacity={0.12} />
      {/* log lines with ticks */}
      {[40, 54, 68].map((y, i) => (
        <g key={y}>
          <path
            d={`M38,${y} l4,4 l7,-8`}
            stroke={i === 2 ? AMBER : GREEN}
            strokeWidth={2.4}
          />
          <line x1="56" y1={y} x2="70" y2={y} strokeOpacity={0.55} />
        </g>
      ))}
      {/* two participants */}
      <circle cx="90" cy="68" r="7" />
      <path d="M79,96 A11,11 0 0 1 101,96" />
      <circle cx="104" cy="80" r="5.5" strokeOpacity={0.6} />
      <path d="M96,100 A9,9 0 0 1 112,100" strokeOpacity={0.6} />
    </Svg>
  );
}

const ICONS: Record<FrilIconKind, (p: IconProps) => React.ReactElement> = {
  bean: BeanIcon,
  purify: PurifyIcon,
  formulate: FormulateIcon,
  assay: AssayIcon,
  study: StudyIcon,
};

export function FrilIcon({ kind, ...rest }: IconProps & { kind: FrilIconKind }) {
  const Icon = ICONS[kind];
  return <Icon {...rest} />;
}
