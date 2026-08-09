"use client";

// Cell text whose full version lives in a tooltip.
//
// Pointer devices keep the native `title` tooltip on hover. Touch devices have
// no hover, so the same text becomes a tap-to-open disclosure that renders
// below the trigger — inside the stacked card, where there is room for it.
//
// The server and the first client render always emit the `<abbr>` branch; the
// swap happens in an effect, so hydration matches regardless of device.

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./Yeast.module.css";

export function Tipped({
  label,
  detail,
  className,
}: {
  label: ReactNode;
  detail: string;
  className?: string;
}) {
  const [touch, setTouch] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const sync = () => setTouch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!touch) {
    return (
      <abbr className={className} title={detail}>
        {label}
      </abbr>
    );
  }

  return (
    <span
      className={`${styles.tipWrap} ${open ? styles.tipOpen : ""}`}
      ref={wrapRef}
    >
      <span
        className={className}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
      >
        {label}
      </span>
      {open && (
        <span className={styles.tipBubble} id={id}>
          {detail}
        </span>
      )}
    </span>
  );
}
