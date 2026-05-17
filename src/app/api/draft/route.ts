import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug");

  // Validate the secret
  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!slug) {
    return new Response("Missing slug parameter", { status: 400 });
  }

  // Restrict to WP-style paths: segments of [a-z0-9_-] joined by /.
  // Rejects schemes, hosts, protocol-relative (//host), backslashes, etc.
  if (!/^[a-z0-9_-]+(?:\/[a-z0-9_-]+)*$/i.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  // Enable draft mode
  const draft = await draftMode();
  draft.enable();

  // Redirect to the page
  redirect(`/${slug}`);
}
