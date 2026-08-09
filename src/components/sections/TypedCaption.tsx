"use client";

import { useEffect, useState } from "react";

/**
 * Progressive-enhancement typewriter: the full text is server-rendered (so
 * crawlers and no-JS visitors always see it); after hydration it clears and
 * re-types with the original timing.
 */
export function TypedCaption({
  text,
  startMs,
  intervalMs,
  className,
}: {
  text: string;
  startMs: number;
  intervalMs: number;
  className?: string;
}) {
  // null = pre-hydration: show the full server-rendered text.
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    setCount(0);
    timers.push(
      setTimeout(() => {
        if (cancelled) return;
        let i = 0;
        const step = () => {
          if (cancelled) return;
          i++;
          setCount(i);
          if (i < text.length) timers.push(setTimeout(step, intervalMs));
        };
        timers.push(setTimeout(step, intervalMs));
      }, startMs)
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [text, startMs, intervalMs]);

  return (
    <span className={className}>
      {count === null ? text : text.slice(0, count)}
    </span>
  );
}
