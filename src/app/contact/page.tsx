import type { Metadata } from "next";
import LiveLog from "@/components/LiveLog";
import StatusStrip from "@/components/StatusStrip";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Aquilar Group, LLC for defense consulting, capture management, and ISR support. Georgia-based. Clearance-friendly discussions available.",
  alternates: { canonical: "https://aquilargroup.com/contact" },
  openGraph: {
    title: "Contact | Aquilar Group",
    description:
      "Initiate contact for capture, BD, and technical domain support. Clearance-friendly. Georgia, U.S.A.",
    url: "https://aquilargroup.com/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <section className={`contact-layout ${styles.layout}`}>
        <div>
          <p className="section-label">Channel Open · Secure Intake</p>
          <h1 className={`display-headline display-headline--sm ${styles.headline}`}>
            Contact
          </h1>
          <p className="lead">
            Direct line for program managers, capture leads, and technical
            directors. State the requirement. We respond with status.
          </p>
          <ContactForm />
        </div>

        <aside className="contact-aside" aria-label="Direct channels">
          <h2>Direct Channels</h2>
          <dl className="contact-meta">
            <div>
              <dt>Email</dt>
              <dd>
                <a href="mailto:contact@aquilargroup.com">
                  contact@aquilargroup.com
                </a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a
                  href="https://www.linkedin.com/company/aquilar-group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Aquilar Group
                </a>
              </dd>
            </div>
            <div>
              <dt>Jurisdiction</dt>
              <dd>Georgia, United States</dd>
            </div>
            <div>
              <dt>Entity</dt>
              <dd>Aquilar Group, LLC</dd>
            </div>
          </dl>
          <p className="clearance-note">
            Available for clearance-friendly discussions. Do not transmit
            classified or CUI material through this form. Use approved channels
            for protected information.
          </p>
        </aside>
      </section>

      <StatusStrip
        logs={[
          <LiveLog key="log" />,
          "CHANNEL: OPEN",
          "INTAKE: UNCLASSIFIED ONLY",
          "RESPONSE PROTOCOL: ACTIVE",
        ]}
        rightLines={["CLEARANCE AWARE", "GEORGIA · U.S.A."]}
      />
    </>
  );
}
