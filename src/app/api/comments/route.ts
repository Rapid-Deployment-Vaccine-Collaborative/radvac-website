import { NextResponse } from "next/server";

interface CommentPayload {
  postId?: unknown;
  author_name?: unknown;
  author_email?: unknown;
  content?: unknown;
}

const MAX_CONTENT_LENGTH = 5000;
const MAX_NAME_LENGTH = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getWpBaseUrl(): string | null {
  if (process.env.WP_BASE_URL) return process.env.WP_BASE_URL.replace(/\/$/, "");
  if (process.env.WP_GRAPHQL_URL) {
    return process.env.WP_GRAPHQL_URL.replace(/\/graphql\/?$/, "");
  }
  return null;
}

export async function POST(request: Request) {
  let body: CommentPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const postId = Number(body.postId);
  const authorName = typeof body.author_name === "string" ? body.author_name.trim() : "";
  const authorEmail = typeof body.author_email === "string" ? body.author_email.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!Number.isFinite(postId) || postId <= 0) {
    return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
  }
  if (!authorName || authorName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(authorEmail)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!content) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: `Comment must be ${MAX_CONTENT_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  const wpBase = getWpBaseUrl();
  if (!wpBase) {
    console.error("[comments] WP_BASE_URL not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    const wpRes = await fetch(`${wpBase}/wp-json/wp/v2/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: postId,
        author_name: authorName,
        author_email: authorEmail,
        content,
      }),
    });

    const wpBody = await wpRes.json().catch(() => null);

    if (!wpRes.ok) {
      const message =
        (wpBody && typeof wpBody.message === "string" && wpBody.message) ||
        `WordPress rejected the comment (${wpRes.status})`;
      return NextResponse.json({ error: message }, { status: wpRes.status });
    }

    return NextResponse.json(
      {
        ok: true,
        status: wpBody?.status ?? "hold",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[comments] forward failed:", err);
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 502 });
  }
}
