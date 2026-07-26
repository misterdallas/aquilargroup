# Aquilar Group, LLC — Corporate Website

Production website for **Aquilar Group, LLC** (`aquilargroup.com`).

Defense contracting and consulting — ISR, tactical communications, RF/satellite systems, TAK, C-sUAS, business development, and capture management.

**Motto:** Aim High  
**Values:** Integrity First · Service Before Self · Excellence in All We Do  
**Tagline:** Elevate the System

---

## Stack

- **Next.js 15** (App Router)
- **React 19** + **TypeScript**
- CSS Modules + global design tokens (no UI framework bloat)
- Canvas visualizations (globe network, architecture/PCB)
- Zero runtime analytics or third-party trackers by default

## Pages

| Route         | Purpose                                              |
|---------------|------------------------------------------------------|
| `/`           | Home — Elevate the System                            |
| `/systems`    | Core protocols + architecture visualization          |
| `/operations` | Capture, BD, technical domains, affiliations         |
| `/contact`    | High-trust intake form + direct channels             |

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Deploy / domain

Works on Vercel, Netlify, Cloudflare Pages, or any Node host supporting Next.js.

1. Connect the repo or upload the project.
2. Set production domain to `aquilargroup.com`.
3. Update contact email / LinkedIn URLs in `src/app/contact/` if needed.
4. Optional: replace mailto form handoff with a real API route or form service (Resend, Formspree, etc.).

### Environment

No secrets required for the static marketing experience. When wiring server-side email:

```env
# Example — not used until you add an API route
CONTACT_TO=contact@aquilargroup.com
RESEND_API_KEY=
```

## Design system (non-negotiable)

| Token        | Value                          |
|--------------|--------------------------------|
| Background   | `#0A0A0A` – `#111111`          |
| Accent       | `#FF5A00` / `#FF6200`          |
| Text         | `#E8E0D0` / `#F0EBE0`          |
| Grid         | Orange lines, low opacity      |
| Aesthetic    | Dark command-center / tactical |

Concept sources live in `Design_Images/`.

## Brand assets

- Nav mark: `src/components/Logo.tsx` (SVG)
- Public logo: `public/logo.svg`
- Favicon: `public/favicon.svg`
- OG image: `public/og-image.svg`
- Original logo sheet: `Design_Images/Aquilar_Group_Logo.jpg`

For print or partner kits, export high-res PNGs from the logo sheet.

## SEO & compliance baseline

- Metadata + Open Graph + Twitter cards (`src/app/layout.tsx`)
- JSON-LD Organization schema
- `sitemap.xml` / `robots.txt` via App Router
- Skip link, focus rings, `prefers-reduced-motion` support
- Semantic landmarks and ARIA on nav/status strips

## Content handoff notes

- Contact form uses **mailto** so the site deploys without backend dependencies.
- LinkedIn URL is a placeholder company path — confirm the live profile.
- Email defaults to `contact@aquilargroup.com` — update when inbox is provisioned.
- Status-strip log clock starts at page load (mission-clock aesthetic).

## Project structure

```
src/
  app/                 # Routes, layout, global CSS
  components/          # Nav, status strip, visualizations, logo
public/                # Static assets, favicon, OG
Design_Images/         # Visual north-star mockups (source of truth)
```

---

© Aquilar Group, LLC. Designed for uninterrupted operation. Redundant systems maintain flight integrity.
