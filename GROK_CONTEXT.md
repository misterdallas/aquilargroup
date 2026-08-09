# GROK_CONTEXT.md
> Living project brief for AI agents and future sessions.  
> Keep this file updated. It is the primary memory for continuity across machines and conversations.

---

## 1. Project Identity

- **Project Name:** Aquilar Group website (Aquilar Group, LLC)
- **Client / Owner:** Aquilar Group, LLC (Georgia, U.S.A.) — defense contracting & consulting firm; founder background reflected as 18-year U.S. Air Force veteran experience in site copy
- **Primary Goal:** Production marketing / corporate site for Aquilar Group: brand presence, service positioning (ISR, capture/BD, tactical systems), and contact intake — tactical “command-center” aesthetic matching design references
- **Current Status:** Live production site on static HTML deploy path; content and UI messaging recently refreshed (status strip, integrity line, home label, GMT log clock, footer cleanup). Next.js app remains in-repo as **legacy** and is not the deploy target
- **Repository:** https://github.com/misterdallas/aquilargroup.git (`main`)
- **Live URL (if any):** https://aquilargroup.com (canonical); contact email `contact@aquilargroup.com`
- **Last Updated:** 2026-08-09

---

## 2. Core Architecture & Constraints

**Tech Stack:**

- **Primary (deployed):** Static HTML / CSS / vanilla JS under `site/` — no build step, no Node runtime required for production
- **Three.js:** Vendored ES module at `site/js/vendor/three.module.min.js` (not CDN-only); shared helpers in `site/js/three-setup.js`
- **Fonts:** Google Fonts — Inter + JetBrains Mono (linked from HTML)
- **Hosting (intended / documented):** Cloudflare Pages with **root directory `site`**, empty build command, output `.` or `/`
- **Legacy (optional):** Next.js 15 + React 19 + TypeScript under `src/` (`package.json` scripts: `dev` / `build` / `start`); mirrors pages/components but is **not** what README says to deploy
- **Asset tooling (dev-only):** Node scripts in `scripts/` for logo cleanup/SVG conversion (`build-clean-logo.js`, `png-to-svg-logo.js`, `redraw-logo.js`) using `jimp` / related deps as installed in the workspace

**Key Architectural Decisions:**

- Dual-track codebase: ship pure static `site/` for zero-ops deploy; keep Next.js as a parallel/legacy implementation of the same brand and routes
- Page-level Three.js canvases (globe / architecture / radar / signal) as ES modules, with mobile-aware WebGL setup and forced animation reliability after prior CDN/mobile issues
- Cache-bust query strings on CSS/JS (`?v=…`) plus `site/_headers` forcing `Cache-Control: max-age=0, must-revalidate` for HTML/CSS/JS so updates land on Cloudflare without sticky stale assets
- Contact form is **client-side mailto** to `contact@aquilargroup.com` (no backend form API)
- Status strip LOG time is a **real GMT/UTC wall clock** (`data-gmt-clock` + `site/js/gmt-clock.js`), not page-elapsed “mission timer”

**Hard Constraints (do not violate):**

- **Deploy `site/` only** for production unless the owner explicitly switches off static hosting — do not assume Next.js is live
- **Brand palette:** background ≈ `#0A0A0A`, accent orange `#FF5A00`, cream `#E8E0D0` (CSS vars in `site/css/styles.css` / `src/app/globals.css`)
- **Do not reintroduce an elapsed-from-zero LOG timer** — clock must match UTC/GMT wall time (reference: https://time.is/GMT)
- **Keep static and Next messaging in sync** when editing public copy if both trees are retained (easy to drift)
- No exploit/malware work; contact path must remain unclassified intake messaging as currently written
- Prefer not to reintroduce the footer tagline that was intentionally removed (“Designed for uninterrupted operation…”)

**Preferred Patterns / Conventions:**

- Tactical/command UI copy: uppercase mono status lines, short labels, orange accent on CTAs and status punctuation
- Shared chrome: header logo wordmark, hamburger mobile nav (`site/js/main.js`), status strip, minimal footer (copyright only)
- After JS/CSS changes that must reach production: **bump `?v=`** on affected script/link tags (recent JS/clock: `20260808a`; CSS still often `20260729b` — intentional partial busting)
- Local static preview: `cd site` then `npx --yes serve .` (ES modules / Three will not work reliably via `file://`)
- GitHub remote branch for deploy: `main`

---

## 3. What Has Been Built & Why

### Major Features / Components

| Feature / Area | Status | Why it was built this way | Notes / Location in code |
|----------------|--------|---------------------------|---------------------------|
| Static multi-page site | Done / live path | Free, simple Cloudflare Pages deploy; no PM2/Node reverse-proxy pain | `site/index.html`, `operations.html`, `systems.html`, `contact.html`, `404.html` |
| Design system / CSS | Done | Command-center look from brand + `Design_Images/` | `site/css/styles.css` |
| Home hero + globe viz | Done | Signature “network globe” visual for defense/tech brand | `site/js/globe.js`, canvas `#viz-canvas` |
| Systems page + architecture viz | Done | Technical credibility + interactive “protocol” buttons | `site/js/architecture.js`, `data-protocol` in `main.js` |
| Operations page + radar viz | Done | Service offerings (capture, BD, domain expertise, consulting) + affiliations | `site/js/radar.js`, ops cards / ALL ISR & Grey Space Consulting |
| Contact page + signal viz | Done | Mailto intake with classification awareness field | `site/js/signal.js`, form → `mailto:` in `main.js` |
| GMT log clock | Done (fixed 2026-08-08) | User wants wall-clock GMT, not session timer; cache-safe | `site/js/gmt-clock.js`, `[data-gmt-clock]`; React: `src/components/LiveLog.tsx` |
| Status strip messaging | Done | Mission-critical positioning language | Home logs: “MISSION-CRITICAL SYSTEMS SUPPORT”, “ALL SYSTEMS ONLINE”; integrity: “SYSTEMS DESIGNED FOR CRITICAL OPERATIONS. COMMAND AND CONTROL \| ANYTIME. ANYWHERE.” |
| Home section label | Done | Brand posture line | “AUSTERE. CONTESTED. CONNECTED.” (was “Aim High · Integrity First”) |
| Mobile nav | Done | Solid dropdown under hamburger; Escape/outside click close | `site/js/main.js` + CSS |
| SEO basics | Done | Canonicals, OG tags, JSON-LD Organization, sitemap, robots | `site/sitemap.xml`, `site/robots.txt`, per-page `<head>` |
| Cloudflare headers | Done | Defeat aggressive browser/CDN caching of HTML/assets | `site/_headers` |
| Logo / brand assets | Done | Multiple SVG/PNG marks for light/dark use | `site/assets/`, `Design_Images/`, `public/` (Next) |
| Next.js parallel app | Legacy / optional | Earlier production approach; still builds same IA | `src/app/*`, `src/components/*` |
| Footer | Simplified | Copyright only; long integrity tagline removed from bottom-right | `site/*` footers, `src/components/Footer.tsx` |

### Important Technical Decisions Log

- **Decision:** Primary production path is static `site/`, not Next.js.  
  **Reason:** Simpler deploy on Cloudflare Pages; avoids Node hosting/ops.  
  **Date:** ~2026-07 (commit “Add static site for Cloudflare Pages deploy”)

- **Decision:** Vendor Three.js locally and use `three-setup.js` helpers.  
  **Reason:** Avoid CDN/CORS/mobile WebGL failures; control animation reliability.  
  **Date:** 2026-07 (mobile nav + Three.js animation fixes)

- **Decision:** LOG clock = UTC via `toISOString().slice(11, 19)`, dedicated `gmt-clock.js`, hook `data-gmt-clock`.  
  **Reason:** User rejected elapsed timer; stale cached `main.js` could overwrite GMT with old timer — separate file + renamed attribute prevents that.  
  **Date:** 2026-08-08 (commit `5e13f14`)

- **Decision:** Contact is mailto, not a server form backend.  
  **Reason:** Static hosting only; zero backend surface.  
  **Date:** Initial site design

- **Decision:** Aggressive cache busting + `_headers` must-revalidate.  
  **Reason:** Live site repeatedly showed old JS/CSS after deploys.  
  **Date:** 2026-07–08

---

## 4. Content & Data Workflow

- **How new content is added:** Manually edit HTML in `site/*.html` (primary). If Next.js is still maintained, mirror copy in `src/app/**/page.tsx` and related components. Design reference still-images live in `Design_Images/` (not served as the live design system).
- **File formats expected:** HTML pages, one shared CSS, plain JS modules, SVG/PNG logos, optional OG/favicon assets under `site/assets/`.
- **Naming conventions:** Multi-word pages as `operations.html` / `systems.html` / `contact.html`; CSS BEM-like blocks (`status-strip__logs`, `hero-visual__canvas`); JS data attributes for behavior (`data-gmt-clock`, `data-protocol`, `data-year`, `nav-toggle`).
- **Any automation or manual steps required:**
  1. Edit files under `site/`
  2. Bump `?v=` on changed CSS/JS references when cache risk is high
  3. Commit + push `main` → Cloudflare Pages redeploy (if Git-connected)
  4. Hard-refresh browser to verify
  5. Optional: `npm run dev` only if working on the Next.js tree

---

## 5. Current Working State

**What is working well:**

- Static site structure, brand chrome, and four main pages with distinct Three.js scenes
- Mobile nav and forced Three.js loading path (post 2026-07 fixes)
- Status strip / integrity / home label copy aligned with recent owner requests
- GMT wall clock implemented to avoid “starts at 00:00:00 on refresh” timer behavior
- Repo clean on `main`, pushed through `5e13f14`

**Known issues / technical debt:**

- **Dual codebase drift:** `site/` is source of truth for deploy; `src/` still contains older mottos/metadata phrasing in places (e.g. layout meta still mentions “Aim High”; README brand line still older). Agents must not assume Next is live.
- **Inconsistent cache versions:** JS/clock often `20260808a`, CSS/Three import chains still `20260729b` — fine if intentional, but easy to forget when CSS changes don’t appear live.
- **README brand copy slightly stale** vs. live UI (footer motto and “Aim High · Elevate the System” vs. current status-strip language).
- **Contact form** depends on user’s mail client (mailto); no server confirmation or CRM integration.
- **Three.js** requires a local HTTP server for reliable local preview; WebGL may fail on locked-down GPUs (setup tries to degrade gracefully).
- Whether Cloudflare Pages auto-deploy is currently connected is environment-dependent; code assumes GitHub `main` → Pages.

**In-progress work:**

- None committed as open WIP; last completed work was GMT clock hardening and messaging/footer updates.

**Next logical steps:**

1. Confirm live site shows GMT wall time after Cloudflare deploy + hard refresh; bump CSS `?v=` if design tweaks lag.
2. Optionally sync Next.js copy/metadata with `site/` or formally archive/delete `src/` if static-only is permanent.
3. Refresh root `README.md` brand/motto lines to match current UI (AUSTERE. CONTESTED. CONNECTED. / integrity line / no footer tagline).
4. If owner wants real form delivery, replace mailto with a form backend (Formspree, Cloudflare Worker, etc.) — not present today.
5. Align all asset `?v=` strings in one pass when shipping the next visual change.

---

## 6. Agent Instructions (Read Carefully)

When picking up this project:

1. Read this entire file first.
2. Explore the repository structure before making changes.
3. Respect all Hard Constraints listed above.
4. Prefer minimal, clean changes that match existing patterns.
5. When making significant decisions, update this file with the decision + reason.
6. After major work, update the “Current Working State” and “Last Updated” sections.

**Default edit target:** `site/` for anything user-facing on aquilargroup.com. Touch `src/` only when asked to keep Next in parity or when working explicitly on the Next app.

**Tone & Quality Expectations:**

- Professional defense / govcon voice: confident, mission-focused, no hype fluff or startup slang
- Visual language: dark tactical UI, mono status logs, orange accent, cream type
- Copy edits should stay concise, uppercase-friendly for status strip, sentence case for body prose
- Prefer surgical diffs; do not rewrite the design system unless requested
- After production-facing JS/CSS changes: cache-bust and push if user wants GitHub/live updated

---

## 7. Recovery Notes (for new machine / new session)

- Clone the repository: `git clone https://github.com/misterdallas/aquilargroup.git`
- Open this `GROK_CONTEXT.md` first.
- Confirm the current status section is accurate (`git log -5 --oneline`, skim `site/index.html` hero + status strip).
- Local preview of production path:
  ```powershell
  cd site
  npx --yes serve .
  ```
- Optional Next legacy:
  ```powershell
  npm install
  npm run dev
  ```
- Continue from the “Next logical steps” list unless told otherwise.
- Deploy path reminder: Cloudflare Pages **root directory = `site`**, branch `main`, no build command.

---

### Quick reference — current public home status strip (static)

- LOG: live `HH:MM:SS GMT` via `data-gmt-clock`
- MISSION-CRITICAL SYSTEMS SUPPORT
- ALL SYSTEMS ONLINE
- Integrity: SYSTEMS DESIGNED FOR CRITICAL OPERATIONS. COMMAND AND CONTROL | ANYTIME. ANYWHERE.
- Right: Mission Obsessed / Autonomous Defense / U.S.A.
- Home label: AUSTERE. CONTESTED. CONNECTED.
- Headline: Elevate The System
