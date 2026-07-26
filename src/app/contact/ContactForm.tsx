"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [state, setState] = useState<FormState>("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState("sending");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      organization: String(data.get("organization") || ""),
      classification: String(data.get("classification") || "UNCLASSIFIED"),
      message: String(data.get("message") || ""),
    };

    // Client-side handoff: mailto fallback keeps site deployable without backend.
    // Swap this block for a server action / API route when email infrastructure is ready.
    try {
      const subject = encodeURIComponent(
        `[Aquilar Group] Contact — ${payload.organization || payload.name}`
      );
      const body = encodeURIComponent(
        [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Organization: ${payload.organization}`,
          `Classification Awareness: ${payload.classification}`,
          "",
          payload.message,
        ].join("\n")
      );

      // Brief delay for tactical feedback, then open mail client
      await new Promise((r) => setTimeout(r, 450));
      window.location.href = `mailto:contact@aquilargroup.com?subject=${subject}&body=${body}`;
      setState("sent");
      form.reset();
    } catch {
      setState("error");
    }
  };

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="Full name"
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@organization.mil"
        />
      </div>

      <div className="field">
        <label htmlFor="organization">Organization</label>
        <input
          id="organization"
          name="organization"
          type="text"
          autoComplete="organization"
          required
          placeholder="Agency / company"
        />
      </div>

      <div className="field">
        <label htmlFor="classification">Classification Level Awareness</label>
        <select id="classification" name="classification" defaultValue="UNCLASSIFIED">
          <option value="UNCLASSIFIED">Unclassified discussion</option>
          <option value="CUI">CUI may apply (use approved channel)</option>
          <option value="CLEARED">Cleared discussion requested</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          required
          placeholder="Requirement, timeline, and preferred follow-up channel."
          rows={5}
        />
      </div>

      <p className="form-note">
        Unclassified intake only. Submitting opens your mail client with a
        pre-filled message to contact@aquilargroup.com.
      </p>

      <button
        type="submit"
        className="btn btn--block"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Transmitting…" : "Transmit Message"}
      </button>

      {state === "sent" && (
        <p className="form-success" role="status">
          Channel opened — complete send in your mail client. Status: queued.
        </p>
      )}
      {state === "error" && (
        <p className="form-success" role="alert" style={{ borderColor: "#ff5a00" }}>
          Transmission fault. Email contact@aquilargroup.com directly.
        </p>
      )}
    </form>
  );
}
