"use client";

import { useState, FormEvent } from "react";
import styles from "./NewsletterSignup.module.css";

type Status = "idle" | "sending" | "success" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thanks — please check your inbox to confirm.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <form className={styles.wrap} onSubmit={handleSubmit} noValidate>
      <label className={styles.srOnly} htmlFor="newsletter-email">
        Email address
      </label>
      <div className={styles.row}>
        <input
          id="newsletter-email"
          className={styles.input}
          type="email"
          name="email"
          placeholder="Subscribe to our newsletter"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "sending"}
        />
        <input
          className={styles.honeypot}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-hidden="true"
        />
        <button
          className={styles.button}
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      <div
        className={`${styles.status} ${
          status === "error"
            ? styles.error
            : status === "success"
            ? styles.success
            : ""
        }`}
        aria-live="polite"
      >
        {message}
      </div>
    </form>
  );
}
