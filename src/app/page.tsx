import Link from "next/link";
import AmericanFlag from "@/components/AmericanFlag";
import GlobeViz from "@/components/GlobeViz";
import LiveLog from "@/components/LiveLog";
import StatusStrip from "@/components/StatusStrip";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <section className="page-hero">
        <div className="hero-copy">
          <p className="section-label">Aim High · Integrity First</p>
          <h1 className={`display-headline ${styles.headline}`}>
            Elevate
            <br />
            The System
          </h1>
          <p className="lead">
            Unmatched industrial strength and autonomous vision for the modern
            defense landscape.
          </p>
          <div className="btn-row">
            <Link href="/systems" className="btn">
              Discover Systems
            </Link>
            <Link href="/operations" className="btn">
              View Operations
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual__frame">
            <span className={`badge hero-visual__badge`}>Field Tested</span>
            <GlobeViz />
            <AmericanFlag className="hero-visual__flag" />
          </div>
          <p className="status-display hero-visual__status">
            Status <span className="accent">:</span> Active
          </p>
        </div>
      </section>

      <StatusStrip
        logs={[
          <LiveLog key="log" />,
          "FORMATION PATTERN: ADAPTIVE GRID",
          "ALTITUDE BAND: 240 FT",
          "NO HUMAN INPUT",
        ]}
        rightLines={["MISSION OBSESSED", "AUTONOMOUS DEFENSE", "U.S.A."]}
        integrity="SYSTEMS DESIGNED FOR UNINTERRUPTED OPERATION. REDUNDANT SYSTEMS MAINTAIN FLIGHT INTEGRITY."
      />
    </>
  );
}
