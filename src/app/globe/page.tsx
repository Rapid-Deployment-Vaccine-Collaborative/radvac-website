import type { Metadata } from "next";
import SpreadGlobe from "@/components/sections/SpreadGlobe";

export const metadata: Metadata = {
  title: "Globe (test) | RaDVaC",
  robots: { index: false, follow: false },
};

export default function GlobeTestPage() {
  return (
    <main style={{ padding: "36px 24px 96px", maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Globe test</h1>
      <p style={{ color: "var(--ink-soft)", marginBottom: 24, fontSize: 14 }}>
        Scratch route for iterating on the spinning-globe replacement for the
        landing hero video. Top: current video. Bottom: new globe.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>Current video</h2>
        <figure
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "12 / 5",
            overflow: "hidden",
            background: "#000",
          }}
        >
          <video
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          >
            <source
              src="/wp-content/uploads/2026/05/science-faster.webm"
              type="video/webm"
            />
          </video>
        </figure>
      </section>

      <section>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>New globe</h2>
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "12 / 5",
            background: "transparent",
          }}
        >
          <SpreadGlobe />
        </div>
      </section>
    </main>
  );
}
