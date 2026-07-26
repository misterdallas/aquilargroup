import type { ReactNode } from "react";
import styles from "./StatusStrip.module.css";

export type StatusStripProps = {
  logs: ReactNode[];
  rightLines: ReactNode[];
  integrity?: string;
};

const DEFAULT_INTEGRITY =
  "SYSTEMS DESIGNED FOR UNINTERRUPTED OPERATION. REDUNDANT SYSTEMS MAINTAIN FLIGHT INTEGRITY.";

export default function StatusStrip({
  logs,
  rightLines,
  integrity = DEFAULT_INTEGRITY,
}: StatusStripProps) {
  return (
    <section className={styles.strip} aria-label="System status log">
      <div className={styles.inner}>
        <div className={styles.left}>
          <ul className={styles.logs}>
            {logs.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
          <p className={styles.integrity}>{integrity}</p>
        </div>
        <div className={styles.right}>
          {rightLines.map((line, i) => (
            <p
              key={i}
              className={
                i === rightLines.length - 1 && rightLines.length > 1
                  ? styles.usa
                  : styles.rightLine
              }
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
