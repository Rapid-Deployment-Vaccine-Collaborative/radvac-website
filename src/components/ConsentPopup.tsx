"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "radvac-white-papers-consent";

type Props = {
  title: string;
  html: string;
};

export function ConsentPopup({ title, html }: Props) {
  const [agreed, setAgreed] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" &&
      window.sessionStorage.getItem(STORAGE_KEY) === "true";
    setAgreed(stored);
  }, []);

  useEffect(() => {
    if (agreed) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [agreed]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true);
    }
  };

  const handleAgree = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "true");
    setAgreed(true);
  };

  if (agreed) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        padding: "0",
      }}
    >
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <h2
            id="consent-title"
            style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}
          >
            {title}
          </h2>
          <p
            style={{
              margin: "0.5rem 0 0",
              fontSize: "0.875rem",
              color: "#6b7280",
            }}
          >
            Please read the following and scroll to the bottom to continue.
          </p>
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
          }}
        >
          <div
            className="prose prose-lg max-w-[800px] mx-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

        <div
          style={{
            padding: "1.25rem 2rem",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {!scrolledToEnd && (
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Scroll to the bottom to enable the button.
            </span>
          )}
          <button
            type="button"
            onClick={handleAgree}
            disabled={!scrolledToEnd}
            style={{
              padding: "0.75rem 1.75rem",
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: "0.375rem",
              border: "none",
              background: scrolledToEnd ? "#1e40af" : "#9ca3af",
              color: "white",
              cursor: scrolledToEnd ? "pointer" : "not-allowed",
            }}
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
