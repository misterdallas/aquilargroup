"use client";

import { useEffect, useState } from "react";

/** UTC wall-clock HH:MM:SS (same reference as https://time.is/GMT) */
function formatGmtTime(date: Date): string {
  return date.toISOString().slice(11, 19);
}

/** Live GMT clock for status strips — wall clock, not page elapsed time */
export default function LiveLog({ prefix = "LOG" }: { prefix?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatGmtTime(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Avoid SSR/hydration flash of a fake 00:00:00 timer
  if (time === null) {
    return (
      <span>
        {prefix} --:--:-- GMT
      </span>
    );
  }

  return (
    <span>
      {prefix} {time} GMT
    </span>
  );
}
