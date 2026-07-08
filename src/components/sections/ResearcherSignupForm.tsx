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
  website: string;
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
  website: "",
};

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
  const [done, setDone] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
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
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error. Please try again.");
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

      {/* Honeypot — hidden from humans, bots tend to fill it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={data.website}
          onChange={(e) => update("website", e.target.value)}
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

      {error ? <div className={styles.error}>{error}</div> : null}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
