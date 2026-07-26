import Link from "next/link";
import StatusStrip from "@/components/StatusStrip";

export default function NotFound() {
  return (
    <>
      <section className="page-hero page-hero--ops" style={{ minHeight: "50vh" }}>
        <div className="hero-copy">
          <p className="section-label">Anomaly Detected</p>
          <h1 className="display-headline display-headline--sm" style={{ margin: "0.75rem 0 1.25rem" }}>
            404 //
            <br />
            Off Grid
          </h1>
          <p className="lead">
            Requested sector not found. Reacquire navigation and return to formation.
          </p>
          <div className="btn-row">
            <Link href="/" className="btn">
              Return Home
            </Link>
            <Link href="/contact" className="btn btn--ghost">
              Contact
            </Link>
          </div>
        </div>
      </section>
      <StatusStrip
        logs={["LOG 00:00:00", "ERROR: ROUTE NOT FOUND", "RECOVERY: RECOMMENDED", "NO CRITICAL FAULT"]}
        rightLines={["STATUS: OFF GRID", "REACQUIRE LINK"]}
      />
    </>
  );
}
