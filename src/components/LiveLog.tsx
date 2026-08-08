"use client";

import { useEffect, useState } from "react";

function formatGmtTime(date: Date): string {
  const h = String(date.getUTCHours()).padStart(2, "0");
  const m = String(date.getUTCMinutes()).padStart(2, "0");
  const s = String(date.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Live-updating GMT mission clock for status strips */
export default function LiveLog({ prefix = "LOG" }: { prefix?: string }) {
  const [time, setTime] = useState(() => formatGmtTime(new Date()));

  useEffect(() => {
    const tick = () => setTime(formatGmtTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span>
      {prefix} {time} GMT
    </span>
  );
}
