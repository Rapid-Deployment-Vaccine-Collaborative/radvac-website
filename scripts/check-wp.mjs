#!/usr/bin/env node
// Pre-build healthcheck: report whether the WordPress GraphQL endpoint is
// reachable before `next build` runs. A downed WP backend makes statically
// generated pages emit fallback/error content instead of CMS content, so we
// want that surfaced loudly in the build log.
//
// By default this WARNS but does not fail the build: the site must remain
// buildable and deployable while WP (or its database) is down. Set
// WP_HEALTHCHECK_STRICT=1 to turn failures back into a hard build error.
// Set SKIP_WP_HEALTHCHECK=1 to skip the probe entirely (avoids the timeout
// wait during a known outage).

// Load .env.local / .env the same way `next build` does. Without this, a
// standalone node script sees none of the local env files and reports a
// false "WP_GRAPHQL_URL is not set" on developer machines.
try {
  // @next/env ships as CJS, so the named export arrives under `.default`
  // when imported from an ESM script. Accept either shape.
  const mod = await import("@next/env");
  const loadEnvConfig = mod.loadEnvConfig ?? mod.default?.loadEnvConfig;
  if (typeof loadEnvConfig === "function") {
    loadEnvConfig(process.cwd());
  }
} catch {
  // @next/env unavailable (shouldn't happen alongside next) — fall back to
  // whatever is already in process.env, e.g. Vercel's injected vars.
}

const strict = process.env.WP_HEALTHCHECK_STRICT === "1";

function degraded(message) {
  if (strict) {
    console.error(`[check-wp] ${message}`);
    console.error(
      "[check-wp] Failing the build because WP_HEALTHCHECK_STRICT=1."
    );
    process.exit(1);
  }
  console.warn("");
  console.warn(
    "  ============================================================"
  );
  console.warn("  [check-wp] WARNING: WordPress CMS is NOT reachable.");
  console.warn(`  ${message}`);
  console.warn("");
  console.warn("  The build will CONTINUE, but any statically generated");
  console.warn("  page will bake in fallback/error content instead of CMS");
  console.warn("  content until it revalidates (ISR: 1 hour) or you");
  console.warn("  redeploy once WP is back up.");
  console.warn(
    "  ============================================================"
  );
  console.warn("");
  process.exit(0);
}

if (process.env.SKIP_WP_HEALTHCHECK === "1") {
  console.log("[check-wp] skipped via SKIP_WP_HEALTHCHECK=1");
  process.exit(0);
}

const url = process.env.WP_GRAPHQL_URL;
if (!url) {
  degraded("WP_GRAPHQL_URL is not set.");
}

const TIMEOUT_MS = 15_000;

try {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ generalSettings { title } }" }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    degraded(
      `WP GraphQL healthcheck failed: HTTP ${res.status} ${res.statusText} at ${url}`
    );
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    degraded(
      `WP GraphQL returned non-JSON body (first 200 chars): ${text.slice(0, 200)}`
    );
  }

  if (json.errors) {
    degraded(
      `WP GraphQL returned errors: ${JSON.stringify(json.errors).slice(0, 300)}`
    );
  }

  const title = json?.data?.generalSettings?.title;
  console.log(`[check-wp] OK (site: ${title ?? "<unknown>"})`);
} catch (err) {
  degraded(`WP GraphQL healthcheck threw: ${err.message}`);
}
