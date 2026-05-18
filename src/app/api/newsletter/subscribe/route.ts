import { NextResponse } from "next/server";
import { createHash } from "crypto";

interface SubscribeBody {
  email?: string;
  firstName?: string;
  company?: string; // honeypot
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

    const data: SubscribeBody = await request.json();

    // Honeypot — silently accept and drop bot submissions
    if (data.company && data.company.trim() !== "") {
      return NextResponse.json({ success: true });
    }

    const email = (data.email ?? "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const server = process.env.MAILCHIMP_SERVER_PREFIX;
    if (!apiKey || !audienceId || !server) {
      console.error("Mailchimp env vars not configured");
      return NextResponse.json(
        { error: "Newsletter service is not configured." },
        { status: 500 }
      );
    }

    const subscriberHash = createHash("md5").update(email).digest("hex");
    const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${subscriberHash}`;
    const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

    const firstName = (data.firstName ?? "").trim().slice(0, 80);

    const mcBody: Record<string, unknown> = {
      email_address: email,
      status_if_new: "pending",
      status: "pending",
    };
    if (firstName) {
      mcBody.merge_fields = { FNAME: firstName };
    }

    const mcRes = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(mcBody),
    });

    if (!mcRes.ok) {
      const detail = await mcRes.text().catch(() => "");
      console.error("Mailchimp subscribe failed:", mcRes.status, detail);
      return NextResponse.json(
        { error: "Could not subscribe at this time. Please try again later." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json(
      { error: "Failed to process submission." },
      { status: 500 }
    );
  }
}
