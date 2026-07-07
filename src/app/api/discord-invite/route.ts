import { NextResponse } from "next/server";

interface DiscordInvitePayload {
  token: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
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
        { error: "Too many attempts from your network. Please try again later." },
        { status: 429 }
      );
    }

    const data: DiscordInvitePayload = await request.json();

    if (!data.token) {
      return NextResponse.json(
        { error: "Missing verification token" },
        { status: 400 }
      );
    }

    const secret = process.env.TURNSTILE_SECRET_KEY;
    const inviteUrl = process.env.DISCORD_INVITE_URL;
    if (!secret || !inviteUrl) {
      console.error(
        "TURNSTILE_SECRET_KEY or DISCORD_INVITE_URL is not set"
      );
      return NextResponse.json(
        { error: "Verification is not configured" },
        { status: 500 }
      );
    }

    const body = new URLSearchParams({
      secret,
      response: data.token,
    });
    if (ip !== "unknown") {
      body.set("remoteip", ip);
    }

    const verifyRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );
    const verify: TurnstileVerifyResponse = await verifyRes.json();

    if (!verify.success) {
      return NextResponse.json(
        { error: "Verification failed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ url: inviteUrl });
  } catch (err) {
    console.error("Discord invite verification error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
