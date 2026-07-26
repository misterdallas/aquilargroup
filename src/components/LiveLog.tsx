"use client";

import { useEffect, useState } from "react";

/** Live-updating mission clock for status strips */
export default function LiveLog({ prefix = "LOG" }: { prefix?: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
  const s = String(elapsed % 60).padStart(2, "0");

  return (
    <span>
      {prefix} {h}:{m}:{s}
    </span>
  );
}
