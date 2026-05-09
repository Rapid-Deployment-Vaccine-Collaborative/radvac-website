const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL!;

interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
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

  const res = await fetch(WP_GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: options?.isDraft ? 0 : (options?.revalidate ?? 3600),
    },
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors) {
    console.error("GraphQL errors:", json.errors);
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  return json.data;
}
