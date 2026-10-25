import { NextResponse } from "next/server";
import { Resend } from "resend";

interface ResearcherSignup {
  identifier: string;
  email: string;
  city: string;
  state: string;
  country: string;
  scienceDegree?: "Yes" | "No" | "";
  labSkills?: "Yes" | "No" | "";
  labSpace?: "Yes" | "No" | "";
  otherInfo?: string;
  securityQuestion: string;
  acceptance: boolean;
  wantsDiscord?: boolean;
  // Honeypot. `website` is the legacy field name, kept so cached old clients
  // are still filtered.
  hp_extra?: string;
  website?: string;
}

type SignupPayload = {
  identifier: string;
  email: string;
  city: string;
  state: string;
  country: string;
  scienceDegree: string;
  labSkills: string;
  labSpace: string;
  otherInfo: string;
  securityQuestion: string;
  wantsDiscord: boolean;
  lat?: number;
  lng?: number;
};

const NOTIFY_TO = "info@radvac.org";
const WP_TIMEOUT_MS = 10_000;
const MAX_SHORT = 200;
const MAX_LONG = 5000;

const FIELD_LABELS: Record<string, string> = {
  identifier: "identifier",
  email: "email address",
  city: "city",
  state: "state or province",
  country: "country",
  securityQuestion: "security question",
};

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
}

function yn(v: unknown): string {
  return v === "Yes" || v === "No" ? v : "";
}

async function geocode(
  city: string,
  state: string,
  country: string
): Promise<{ lat: number; lng: number } | null> {
  const query = [city, state, country].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Radvac-website/1.0 (info@radvac.org)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data.length) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    return isFinite(lat) && isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

async function saveToWordPress(payload: SignupPayload): Promise<void> {
  const wpGraphqlUrl = process.env.WP_GRAPHQL_URL;
  const secret = process.env.RADVAC_SIGNUP_SECRET;
  if (!wpGraphqlUrl || !secret) {
    throw new Error("WP_GRAPHQL_URL or RADVAC_SIGNUP_SECRET is not set");
  }
  const wpBase = wpGraphqlUrl.replace(/\/graphql\/?$/, "");
  const res = await fetch(`${wpBase}/wp-json/radvac/v1/researcher-signup`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Radvac-Signup-Secret": secret,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(WP_TIMEOUT_MS),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(
      `WP signup endpoint returned ${res.status}: ${(await res.text()).slice(0, 500)}`
    );
  }
}

async function notifyByEmail(payload: SignupPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  const dash = (v: string) => (v ? v : "-");
  const coords =
    payload.lat !== undefined && payload.lng !== undefined
      ? `${payload.lat}, ${payload.lng}`
      : "Not yet geocoded";
  const text = [
    "New Researchers Map signup from radvac.org",
    "",
    `Identifier: ${payload.identifier}`,
    `Email: ${payload.email}`,
    `Location: ${payload.city}, ${payload.state}, ${payload.country}`,
    `Coordinates: ${coords}`,
    `Science degree: ${dash(payload.scienceDegree)}`,
    `Lab skills: ${dash(payload.labSkills)}`,
    `Lab space/materials: ${dash(payload.labSpace)}`,
    `Other info: ${dash(payload.otherInfo)}`,
    `Security answer (removal verification): ${payload.securityQuestion}`,
    `Wants Discord invite: ${payload.wantsDiscord ? "Yes" : "No"}`,
    `Submitted at: ${new Date().toISOString()}`,
  ].join("\n");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "Radvac Website <noreply@radvac.org>",
    to: [NOTIFY_TO],
    replyTo: payload.email,
    subject: `[radvac.org researchers map] ${payload.identifier} — ${payload.city}, ${payload.country}`,
    text,
  });
  if (error) {
    throw new Error(`Resend send failed: ${JSON.stringify(error)}`);
  }
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (rateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions from your network. Please try again later." },
        { status: 429 }
      );
    }

    const data: ResearcherSignup = await request.json();

    // Honeypot — silently accept and drop bot submissions
    const honeypot = `${data.hp_extra ?? ""}${data.website ?? ""}`;
    if (honeypot.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const required: (keyof ResearcherSignup)[] = [
      "identifier",
      "email",
      "city",
      "state",
      "country",
      "securityQuestion",
    ];
    for (const f of required) {
      if (!data[f] || String(data[f]).trim() === "") {
        return NextResponse.json(
          { error: `Please fill in your ${FIELD_LABELS[f] ?? f}.` },
          { status: 400 }
        );
      }
      if (String(data[f]).length > MAX_SHORT) {
        return NextResponse.json(
          { error: `Your ${FIELD_LABELS[f] ?? f} is too long.` },
          { status: 400 }
        );
      }
    }
    if (data.otherInfo && String(data.otherInfo).length > MAX_LONG) {
      return NextResponse.json(
        { error: "The \"anything else\" field is too long." },
        { status: 400 }
      );
    }

    if (!data.acceptance) {
      return NextResponse.json(
        { error: "Please tick the box confirming your information will be public." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(data.email).trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanCity = String(data.city).trim();
    const cleanState = String(data.state).trim();
    const cleanCountry = String(data.country).trim();

    // Geocode coordinates asynchronously via Nominatim so they can be saved in WP
    const geo = await geocode(cleanCity, cleanState, cleanCountry);

    const payload: SignupPayload = {
      identifier: String(data.identifier).trim(),
      email: String(data.email).trim(),
      city: cleanCity,
      state: cleanState,
      country: cleanCountry,
      scienceDegree: yn(data.scienceDegree),
      labSkills: yn(data.labSkills),
      labSpace: yn(data.labSpace),
      otherInfo: String(data.otherInfo ?? "").trim(),
      securityQuestion: String(data.securityQuestion).trim(),
      wantsDiscord: Boolean(data.wantsDiscord),
      lat: geo?.lat,
      lng: geo?.lng,
    };

    // Store in WP and email the team in parallel. Succeed if either works so
    // that a misconfiguration on one side never loses a signup.
    const [wp, mail] = await Promise.allSettled([
      saveToWordPress(payload),
      notifyByEmail(payload),
    ]);
    if (wp.status === "rejected") {
      console.error("Researcher signup: WP save failed:", wp.reason);
    }
    if (mail.status === "rejected") {
      console.error("Researcher signup: email notify failed:", mail.reason);
    }
    if (wp.status === "rejected" && mail.status === "rejected") {
      return NextResponse.json(
        {
          error:
            "We couldn't save your submission. Please email your details to info@radvac.org instead.",
          fallback: true,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Researcher signup error:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't process your submission. Please email your details to info@radvac.org instead.",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
