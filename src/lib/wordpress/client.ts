const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL!;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

  let res: Response | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    res = await fetch(WP_GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: options?.isDraft ? 0 : (options?.revalidate ?? 3600),
      },
    });

    // Retry on rate-limit / transient upstream errors. EasyWP throttles
    // /graphql during builds when many static pages fetch in parallel.
    if ((res.status === 429 || res.status === 503) && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY_MS * 2 ** attempt + Math.random() * 250;
      await sleep(delay);
      continue;
    }
    break;
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
