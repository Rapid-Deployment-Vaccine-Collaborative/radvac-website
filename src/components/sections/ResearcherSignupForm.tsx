"use client";

import { useState } from "react";
import styles from "./ResearcherSignupForm.module.css";

type YN = "Yes" | "No" | "";

interface FormState {
  identifier: string;
  email: string;
  city: string;
  state: string;
  country: string;
  scienceDegree: YN;
  labSkills: YN;
  labSpace: YN;
  otherInfo: string;
  securityQuestion: string;
  acceptance: boolean;
  wantsDiscord: boolean;
  hp_extra: string;
}

const initial: FormState = {
  identifier: "",
  email: "",
  city: "",
  state: "",
  country: "",
  scienceDegree: "",
  labSkills: "",
  labSpace: "",
  otherInfo: "",
  securityQuestion: "",
  acceptance: false,
  wantsDiscord: false,
  hp_extra: "",
};

const REQUIRED: [keyof FormState, string][] = [
  ["identifier", "an identifier"],
  ["email", "your email address"],
  ["city", "your city"],
  ["state", "your state or province"],
  ["country", "your country"],
  ["securityQuestion", "the security question"],
];

function validate(d: FormState): string | null {
  for (const [key, label] of REQUIRED) {
    if (String(d[key]).trim() === "") return `Please fill in ${label}.`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) {
    return "Please enter a valid email address.";
  }
  if (!d.acceptance) {
    return "Please tick the box confirming your information will be public.";
  }
  return null;
}

/** Pre-filled email so a signup is never lost if the backend is down. */
function mailtoFallback(d: FormState): string {
  const body = [
    `Identifier: ${d.identifier}`,
    `Email: ${d.email}`,
    `Location: ${d.city}, ${d.state}, ${d.country}`,
    `Science degree: ${d.scienceDegree || "-"}`,
    `Lab skills: ${d.labSkills || "-"}`,
    `Lab space/materials: ${d.labSpace || "-"}`,
    `Other info: ${d.otherInfo || "-"}`,
    `Security answer: ${d.securityQuestion}`,
    `Wants Discord invite: ${d.wantsDiscord ? "Yes" : "No"}`,
  ].join("\n");
  return `mailto:info@radvac.org?subject=${encodeURIComponent(
    "Researchers Map signup"
  )}&body=${encodeURIComponent(body)}`;
}

function YesNo({
  name,
  value,
  onChange,
}: {
  name: keyof FormState;
  value: YN;
  onChange: (v: YN) => void;
}) {
  return (
    <div className={styles.radioRow}>
      <label>
        <input
          type="radio"
          name={name}
          checked={value === "Yes"}
          onChange={() => onChange("Yes")}
        />
        Yes
      </label>
      <label>
        <input
          type="radio"
          name={name}
          checked={value === "No"}
          onChange={() => onChange("No")}
        />
        No
      </label>
    </div>
  );
}

export default function ResearcherSignupForm() {
  const [data, setData] = useState<FormState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setShowFallback(false);
    const invalid = validate(data);
    if (invalid) {
      setError(invalid);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/researcher-signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Submission failed.");
        setShowFallback(res.status >= 500 || Boolean(body.fallback));
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
      setShowFallback(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className={styles.success}>
        <strong>Thanks — your submission has been received.</strong>
        <p style={{ margin: "6px 0 0", fontSize: 13 }}>
          Updates to the map take a couple of days to appear. If you need to
          remove your information later, email{" "}
          <a href="mailto:info@radvac.org">info@radvac.org</a>.
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="identifier">
          Identifier <span className={styles.hint}>(does not have to be your name)</span>
        </label>
        <input
          id="identifier"
          required
          value={data.identifier}
          onChange={(e) => update("identifier", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="city">City where you are located</label>
        <input
          id="city"
          required
          value={data.city}
          onChange={(e) => update("city", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="state">State or province</label>
        <input
          id="state"
          required
          value={data.state}
          onChange={(e) => update("state", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="country">Country</label>
        <input
          id="country"
          required
          value={data.country}
          onChange={(e) => update("country", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>
          Do you hold a science degree? <span className={styles.hint}>(optional)</span>
        </label>
        <YesNo
          name="scienceDegree"
          value={data.scienceDegree}
          onChange={(v) => update("scienceDegree", v)}
        />
      </div>

      <div className={styles.field}>
        <label>
          Do you have basic lab skills? <span className={styles.hint}>(optional)</span>
        </label>
        <YesNo
          name="labSkills"
          value={data.labSkills}
          onChange={(v) => update("labSkills", v)}
        />
      </div>

      <div className={styles.field}>
        <label>
          Do you have lab space and/or materials?{" "}
          <span className={styles.hint}>(optional)</span>
        </label>
        <YesNo
          name="labSpace"
          value={data.labSpace}
          onChange={(v) => update("labSpace", v)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="otherInfo">Anything else you would like to add?</label>
        <textarea
          id="otherInfo"
          value={data.otherInfo}
          onChange={(e) => update("otherInfo", e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="securityQuestion">
          Security question: what is your favorite food?{" "}
          <span className={styles.hint}>
            (used only to verify removal requests; not shown publicly)
          </span>
        </label>
        <input
          id="securityQuestion"
          required
          value={data.securityQuestion}
          onChange={(e) => update("securityQuestion", e.target.value)}
        />
      </div>

      {/* Honeypot — hidden from humans, bots tend to fill it. Deliberately
          given a name browser autofill won't recognise (it used to be
          "website", which autofill could fill and silently drop real signups). */}
      <div aria-hidden="true" style={{ display: "none" }}>
        <label htmlFor="hp_extra">Leave this empty</label>
        <input
          id="hp_extra"
          name="hp_extra"
          tabIndex={-1}
          autoComplete="new-password"
          value={data.hp_extra}
          onChange={(e) => update("hp_extra", e.target.value)}
        />
      </div>

      <label className={styles.accept}>
        <input
          type="checkbox"
          checked={data.wantsDiscord}
          onChange={(e) => update("wantsDiscord", e.target.checked)}
        />
        <span>I would like to receive a link to the RaDVaC Discord server.</span>
      </label>

      <label className={styles.accept}>
        <input
          type="checkbox"
          checked={data.acceptance}
          onChange={(e) => update("acceptance", e.target.checked)}
          required
        />
        <span>
          I understand the information I provide will be publicly visible and
          this is acceptable to me. I can request removal by emailing{" "}
          <a href="mailto:info@radvac.org">info@radvac.org</a>.
        </span>
      </label>

      {error ? (
        <div className={styles.error} role="alert">
          {error}
          {showFallback ? (
            <>
              {" "}
              <a href={mailtoFallback(data)}>
                Click here to send your details by email instead.
              </a>
            </>
          ) : null}
        </div>
      ) : null}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
