#!/usr/bin/env node
// Pre-build healthcheck: verify the WordPress GraphQL endpoint is reachable
// before `next build` runs. Without this, a downed WP backend causes static
// page generation to silently emit pages with no CMS content. Set
// SKIP_WP_HEALTHCHECK=1 to bypass (e.g. for code-only emergency deploys).

if (process.env.SKIP_WP_HEALTHCHECK === "1") {
  console.log("[check-wp] skipped via SKIP_WP_HEALTHCHECK=1");
  process.exit(0);
}

const url = process.env.WP_GRAPHQL_URL;
if (!url) {
  console.error("[check-wp] WP_GRAPHQL_URL is not set");
  process.exit(1);
}

const TIMEOUT_MS = 15_000;

try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: "{ generalSettings { title } }" }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!res.ok) {
    console.error(
      `[check-wp] WP GraphQL healthcheck failed: HTTP ${res.status} ${res.statusText} at ${url}`
    );
    process.exit(1);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(
      `[check-wp] WP GraphQL returned non-JSON body (first 200 chars): ${text.slice(0, 200)}`
    );
    process.exit(1);
  }

  if (json.errors) {
    console.error("[check-wp] WP GraphQL returned errors:", json.errors);
    process.exit(1);
  }

  const title = json?.data?.generalSettings?.title;
  console.log(`[check-wp] OK (site: ${title ?? "<unknown>"})`);
} catch (err) {
  console.error(`[check-wp] WP GraphQL healthcheck threw: ${err.message}`);
  process.exit(1);
}
