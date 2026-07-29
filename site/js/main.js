/**
 * Aquilar Group — shared UI (nav, mission clock, contact, systems actions)
 */
(function () {
  "use strict";

  /* Mobile nav — solid dropdown under hamburger (top-right) */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    const closeNav = () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
    };

    const openNav = () => {
      nav.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (nav.classList.contains("is-open")) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Live mission clock */
  const logEls = document.querySelectorAll("[data-live-log]");
  if (logEls.length) {
    const start = Date.now();
    const tick = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const s = String(elapsed % 60).padStart(2, "0");
      const text = `LOG ${h}:${m}:${s}`;
      logEls.forEach((el) => {
        el.textContent = text;
      });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Systems protocol buttons */
  const statusOut = document.getElementById("systems-status");
  document.querySelectorAll("[data-protocol]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!statusOut) return;
      const kind = btn.getAttribute("data-protocol");
      statusOut.textContent =
        kind === "init"
          ? "INITIALIZE COMPLETE — CORE PROTOCOL STACK ONLINE"
          : "DIAGNOSTICS NOMINAL — ALL CHANNELS CLEAR · 0 ANOMALIES";
    });
  });

  /* Contact form → mailto */
  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "");
      const email = String(data.get("email") || "");
      const org = String(data.get("organization") || "");
      const classification = String(data.get("classification") || "UNCLASSIFIED");
      const message = String(data.get("message") || "");

      const subject = encodeURIComponent(
        `[Aquilar Group] Contact — ${org || name}`
      );
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Email: ${email}`,
          `Organization: ${org}`,
          `Classification Awareness: ${classification}`,
          "",
          message,
        ].join("\n")
      );

      const note = document.getElementById("form-status");
      window.location.href = `mailto:contact@aquilargroup.com?subject=${subject}&body=${body}`;
      if (note) {
        note.hidden = false;
        note.textContent =
          "CHANNEL OPENED — COMPLETE SEND IN YOUR MAIL CLIENT. STATUS: QUEUED.";
      }
      form.reset();
    });
  }

  /* Footer year */
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
