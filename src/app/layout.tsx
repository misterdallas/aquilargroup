import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

const siteUrl = "https://aquilargroup.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Aquilar Group, LLC | Elevate the System",
    template: "%s | Aquilar Group",
  },
  description:
    "Defense contracting and consulting firm specializing in ISR, tactical communications, RF/satellite systems, TAK, C-sUAS, business development, and capture management. Founded by an 18-year U.S. Air Force veteran.",
  keywords: [
    "defense contractor",
    "govcon",
    "ISR",
    "capture management",
    "business development",
    "tactical communications",
    "RF satellite",
    "TAK",
    "C-sUAS",
    "Aquilar Group",
    "defense consulting",
    "Georgia",
  ],
  authors: [{ name: "Aquilar Group, LLC" }],
  creator: "Aquilar Group, LLC",
  publisher: "Aquilar Group, LLC",
  applicationName: "Aquilar Group",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Aquilar Group, LLC",
    title: "Aquilar Group, LLC | Elevate the System",
    description:
      "Unmatched industrial strength and autonomous vision for the modern defense landscape. ISR, capture, and tactical systems expertise.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Aquilar Group — Elevate the System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aquilar Group, LLC | Elevate the System",
    description:
      "Defense contracting and consulting. ISR, capture management, tactical systems. Aim High.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  category: "defense",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aquilar Group, LLC",
  legalName: "Aquilar Group, LLC",
  url: siteUrl,
  logo: `${siteUrl}/logo.svg`,
  description:
    "Defense contracting and consulting firm specializing in ISR, tactical communications, RF/satellite systems, TAK, C-sUAS, business development, and capture management.",
  foundingLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressRegion: "GA",
      addressCountry: "US",
    },
  },
  areaServed: "US",
  knowsAbout: [
    "Intelligence, Surveillance, and Reconnaissance",
    "Capture Management",
    "Business Development",
    "Tactical Communications",
    "RF and Satellite Systems",
    "TAK",
    "Counter-sUAS",
    "Defense Consulting",
  ],
  slogan: "Elevate the System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to mission content
        </a>
        <div className="app-shell">
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
