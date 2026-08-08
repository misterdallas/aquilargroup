import type { Metadata } from "next";
import AmericanFlag from "@/components/AmericanFlag";
import ArchitectureViz from "@/components/ArchitectureViz";
import LiveLog from "@/components/LiveLog";
import StatusStrip from "@/components/StatusStrip";
import SystemsActions from "./SystemsActions";
import styles from "./systems.module.css";

export const metadata: Metadata = {
  title: "Systems // Core Protocols",
  description:
    "Core protocols and technical architecture for Aquilar Group defense systems: ISR, RF/SATCOM, TAK mesh, and autonomous defense frameworks.",
  alternates: { canonical: "https://aquilargroup.com/systems" },
  openGraph: {
    title: "Systems // Core Protocols | Aquilar Group",
    description:
      "Core protocols engaged. Network uptime nominal. Technical specifications for uninterrupted operation.",
    url: "https://aquilargroup.com/systems",
  },
};

export default function SystemsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="hero-copy">
          <p className="section-label">Diagnostics · Protocol Stack</p>
          <h1 className={`display-headline display-headline--sm ${styles.headline}`}>
            Systems //
            <br />
            Core
            <br />
            Protocols
          </h1>
          <p className="lead">
            Architecture built for continuity under pressure. Redundant paths.
            Nominal status. Zero tolerance for anomaly.
          </p>
          <SystemsActions />
        </div>

        <div className="hero-visual">
          <div className="hero-visual__frame">
            <span className="badge hero-visual__badge">Architecture</span>
            <ArchitectureViz />
            <AmericanFlag className="hero-visual__flag" />
          </div>
          <p className="status-display hero-visual__status">
            Status: <span className="accent">Nominal</span>
          </p>
        </div>
      </section>

      <StatusStrip
        logs={[
          <LiveLog key="log" />,
          "CORE PROTOCOL: ENGAGED",
          "NETWORK: 100% UPTIME",
          "NO ANOMALIES",
        ]}
        rightLines={["TECHNICAL SPECIFICATIONS", "QUANTUM ENCRYPTION ACTIVE"]}
        integrity="SYSTEMS DESIGNED FOR CRITICAL OPERATIONS. COMMAND AND CONTROL | ANYTIME. ANYWHERE."
      />
    </>
  );
}
