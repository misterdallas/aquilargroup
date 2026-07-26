import type { Metadata } from "next";
import Link from "next/link";
import LiveLog from "@/components/LiveLog";
import StatusStrip from "@/components/StatusStrip";
import styles from "./operations.module.css";

export const metadata: Metadata = {
  title: "Operations",
  description:
    "Operational overview: capture & proposal support, BD strategy for govcon, ISR and tactical systems expertise. Supporting ALL ISR and Grey Space Consulting.",
  alternates: { canonical: "https://aquilargroup.com/operations" },
  openGraph: {
    title: "Operations | Aquilar Group",
    description:
      "Business development, capture management, defense consulting, and ISR support — executed with operational precision.",
    url: "https://aquilargroup.com/operations",
  },
};

const CAPABILITIES = [
  {
    title: "Capture & Proposal Support",
    body: "End-to-end capture discipline: opportunity qualification, win themes, competitive positioning, color team support, and proposal architecture that survives evaluation criteria.",
    tags: ["Win Themes", "Color Teams", "Volume Architecture", "PWS / SOW"],
  },
  {
    title: "BD Strategy for GovCon",
    body: "Pipeline design, customer engagement cadence, and pursuit prioritization for contractors operating in contested federal markets. Strategy that maps to real funding lines—not slideware.",
    tags: ["Pipeline", "Customer Mapping", "Pursuit Priority", "Go / No-Go"],
  },
  {
    title: "Technical Domain Expertise",
    body: "Eighteen years of Air Force operational depth applied to program and capture conversations. Translate capability into evaluator language without diluting technical truth.",
    tags: ["ISR", "RF / SATCOM", "TAK / Mesh", "C-sUAS"],
  },
  {
    title: "Defense Consulting",
    body: "Program managers, technical directors, and capture leads get a peer—not a vendor pitch. Quiet confidence. Mission-obsessed execution. Integrity first.",
    tags: ["Program Support", "Tech Advisement", "Partner Integration"],
  },
] as const;

export default function OperationsPage() {
  return (
    <>
      <section className={`page-hero page-hero--ops ${styles.ops}`}>
        <div className="hero-copy">
          <p className="section-label">Formation · Mission Set</p>
          <h1 className={`display-headline display-headline--sm ${styles.headline}`}>
            Operations
          </h1>
          <p className={`lead ${styles.leadWide}`}>
            Operational overview—not a service catalog. Capture, BD, and
            technical domain work executed with the same discipline expected on
            the mission floor.
          </p>

          <div className="ops-grid">
            {CAPABILITIES.map((cap) => (
              <article key={cap.title} className="ops-card">
                <h3>{cap.title}</h3>
                <p>{cap.body}</p>
                <div className="tag-row">
                  {cap.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="affiliations">
            <h3>Current Affiliations</h3>
            <div className="affil-list">
              <div className="affil-item">
                <span className="status-dot" aria-hidden="true" />
                <div>
                  <strong>ALL ISR</strong>
                  <span>
                    Active support across ISR mission requirements—field-tested
                    perspective applied to operational and capture outcomes.
                  </span>
                </div>
              </div>
              <div className="affil-item">
                <span className="status-dot" aria-hidden="true" />
                <div>
                  <strong>Grey Space Consulting</strong>
                  <span>
                    Business development and capture consulting partnership.
                    Expanding independent govcon work in parallel.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="btn-row">
            <Link href="/contact" className="btn">
              Initiate Contact
            </Link>
            <Link href="/systems" className="btn btn--ghost">
              View Systems
            </Link>
          </div>
        </div>
      </section>

      <StatusStrip
        logs={[
          <LiveLog key="log" />,
          "MISSION SET: CAPTURE · BD · ISR",
          "FORMATION: MULTI-PARTNER",
          "STATUS: MISSION READY",
        ]}
        rightLines={["OPERATIONAL OVERVIEW", "PEER TO PROGRAM LEADS", "U.S.A."]}
      />
    </>
  );
}
