export function RaDVaCLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-140 -140 2545 1044"
      role="img"
      aria-label="RaDVaC"
    >
      <defs>
        <radialGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="1260"
          cy="180"
          r="600"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#525595" />
          <stop offset="1" stopColor="#1c2470" />
        </radialGradient>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feMorphology in="SourceAlpha" operator="dilate" radius="52" result="dilated" />
          <feGaussianBlur in="dilated" stdDeviation="50" result="blurred" />
          <feFlood floodColor="#ffffff" floodOpacity="1" result="white" />
          <feComposite in="white" in2="blurred" operator="in" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path fill="#dc5d29" d="M545.33,662.66l-318.61.16c-12.69-1.52-24.15-1.78-36.22-7.53l189.13-83.68,165.7,91.05h0Z" />
        <path fill="#446fb6" d="M173.23,641.01c-12.19-18.1-.43-40.74,11.37-57.65l50.49-90.61,121.96,66.89-183.81,81.37h0Z" />
        <polygon fill="#db5c28" points="572 536.51 500.71 540.06 432.75 449.55 572 422.05 572 536.51" />
        <path fill="#db5c28" d="M496.98,89.57l.04,95.36-109.21-31.23,42.6-84.6,45.58-.06c10.71,1.71,18.8,9.25,20.99,20.53h0Z" />
        <path fill="#db5d28" d="M249.96,465.31l46.19-83.12c8.54-16.37,15.78-31.88,23.37-50.01l78.19,103.98-147.75,29.15h0Z" />
        <polygon fill="#ddb12b" points="434.52 350.23 337.25 318.26 475.55 227.75 434.52 350.23" />
        <path fill="#6c4b9e" d="M533.38,345.69c7.5,16.22,16.93,30.22,26.04,46.11l-107.04-35,42.68-125.56,2.88.12c3.5,38.95,17.49,79.13,35.44,114.33h0Z" />
        <path fill="#17ae4c" d="M695.55,624.06c.87,26.84-31.53,38.23-57.5,38.16l-47.14-.12,73.53-102.25,20.03,31.67c6.18,9.76,10.69,20.66,11.07,32.53h.01Z" />
        <path fill="#6d4c9e" d="M368.89,543.65l-107.24-58.63c-.27-.9.98-2.4,2.38-2.94l134.66-26.35-29.8,87.92h0Z" />
        <polygon fill="#4570b6" points="551.59 642.55 409.03 564.85 491.05 560.54 551.59 642.55" />
        <polygon fill="#1eae4d" points="475.9 540.91 389 545.28 417.21 462.69 475.9 540.91" />
        <path fill="#1eae4d" d="M332.68,297.37c5.58-20.6,11.18-40.23,12.62-60.91l109.92-19.81-122.54,80.72h0Z" />
        <path fill="#6c4b9e" d="M369.29,148.52l-23.43-6.36v-47.28c-.9-12.45,7.9-25.65,21.19-25.73l42.06-.27-39.82,79.65h0Z" />
        <polygon fill="#4570b6" points="542.02 407.02 428.58 429.65 446.95 375.4 542.02 407.02" />
        <path fill="#6d4c9e" d="M629.45,534.08l-20.49.9c-6.05.26-11.51,1.55-17.92.76l-.05-89.36,2.88-.22,54.01,86.44c-6.06,1.43-11.72,1.19-18.42,1.49h-.01Z" />
        <path fill="#ddb12b" d="M569.66,632.67l-54.55-72.5c2.12-1.76,4.7-2.43,6.81-2.06,6.72,1.17,12.69-.2,19.07-.55l20.14-1.11,11.83.04.08,74.59-3.38,1.58h0Z" />
        <polygon fill="#1eae4d" points="427.78 368.92 410.38 419.74 354.48 345.15 427.78 368.92" />
        <polygon fill="#4570b6" points="458.73 194.9 358.05 213.79 379.08 171.93 458.73 194.9" />
        <polygon fill="#4570b6" points="592.59 624.63 592.35 555.69 644.36 553.09 592.59 624.63" />
        <polygon fill="#deb63d" points="359.28 166.07 346.58 190.77 346.16 162.43 359.28 166.07" />
      </g>
      <text
        x="820"
        y="660"
        fontSize="400"
        fontWeight="800"
        letterSpacing="-15"
        fill="url(#textGradient)"
        style={{ fontFamily: "var(--display)" }}
      >
        Radvac
      </text>
    </svg>
  );
}
