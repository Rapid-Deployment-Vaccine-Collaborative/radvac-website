import { NextResponse } from "next/server";

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
  website?: string;
}

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
    if (data.website && data.website.trim() !== "") {
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
          { error: `Missing required field: ${f}` },
          { status: 400 }
        );
      }
    }

    if (!data.acceptance) {
      return NextResponse.json(
        { error: "You must accept the public-visibility notice." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const wpGraphqlUrl = process.env.WP_GRAPHQL_URL;
    const secret = process.env.RADVAC_SIGNUP_SECRET;
    if (!wpGraphqlUrl || !secret) {
      console.error("WP_GRAPHQL_URL or RADVAC_SIGNUP_SECRET is not set");
      return NextResponse.json(
        { error: "Signup service is not configured" },
        { status: 500 }
      );
    }

    const wpBase = wpGraphqlUrl.replace(/\/graphql\/?$/, "");
    const res = await fetch(`${wpBase}/wp-json/radvac/v1/researcher-signup`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Radvac-Signup-Secret": secret,
      },
      body: JSON.stringify({
        identifier: data.identifier,
        email: data.email,
        city: data.city,
        state: data.state,
        country: data.country,
        scienceDegree: data.scienceDegree || "",
        labSkills: data.labSkills || "",
        labSpace: data.labSpace || "",
        otherInfo: data.otherInfo || "",
        securityQuestion: data.securityQuestion,
        wantsDiscord: Boolean(data.wantsDiscord),
      }),
    });

    if (!res.ok) {
      console.error("WP signup endpoint failed:", res.status, await res.text());
      return NextResponse.json(
        { error: "Failed to save submission" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Researcher signup error:", err);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
