const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL!;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1500;
const MAX_CONCURRENCY = 1;
const INTER_REQUEST_GAP_MS = 250;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// EasyWP rate-limits /graphql (429) when builds fire many parallel queries.
// Serialize requests through a small semaphore to stay under the threshold.
let inFlight = 0;
const queue: Array<() => void> = [];
async function acquireSlot(): Promise<void> {
  if (inFlight < MAX_CONCURRENCY) {
    inFlight++;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
  inFlight++;
}
function releaseSlot(): void {
  inFlight--;
  const next = queue.shift();
  if (next) next();
}

export async function fetchGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: {
    isDraft?: boolean;
    revalidate?: number;
  }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.isDraft && process.env.WP_AUTH_TOKEN) {
    // WP_AUTH_TOKEN holds base64("username:application-password")
    // for WordPress core Application Passwords (no plugin required).
    headers["Authorization"] = `Basic ${process.env.WP_AUTH_TOKEN}`;
  }

  await acquireSlot();
  let res: Response | null = null;
  try {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      res = await fetch(WP_GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
        next: {
          revalidate: options?.isDraft ? 0 : (options?.revalidate ?? 3600),
        },
      });

      if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 250;
        await sleep(delay);
        continue;
      }
      break;
    }
  } finally {
    // Small spacer before releasing so consecutive serialized requests
    // don't immediately hammer the upstream after a successful response.
    await sleep(INTER_REQUEST_GAP_MS);
    releaseSlot();
  }

  if (!res || !res.ok) {
    throw new Error(
      `GraphQL request failed: ${res?.status ?? "no response"} ${res?.statusText ?? ""}`.trim()
    );
  }

  const text = await res.text();
  if (!text) {
    throw new Error("GraphQL request returned an empty body");
  }
  let json: GraphQLResponse<T>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`GraphQL request returned non-JSON body: ${text.slice(0, 200)}`);
  }

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  return json.data;
}
