"use client";

import { useState, type FormEvent } from "react";

export function ContactNewsletterSignup() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      company: formData.get("company") as string,
    };

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not subscribe. Please try again.");
      }

      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 text-accent"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h3 className="text-xl font-semibold text-primary-dark mb-2">
          You&apos;re subscribed
        </h3>
        <p className="text-text-secondary">
          Thanks — we&apos;ll be in touch with occasional updates.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-primary hover:text-primary-dark underline"
        >
          Subscribe another email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="newsletter-firstName"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Name <span className="text-text-secondary font-normal">(optional)</span>
          </label>
          <input
            type="text"
            id="newsletter-firstName"
            name="firstName"
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="newsletter-email"
            className="block text-sm font-medium text-text mb-1.5"
          >
            Email
          </label>
          <input
            type="email"
            id="newsletter-email"
            name="email"
            required
            autoComplete="email"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="newsletter-company">Company</label>
        <input
          type="text"
          id="newsletter-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="px-8 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Subscribing..." : "Subscribe"}
      </button>
    </form>
  );
}
