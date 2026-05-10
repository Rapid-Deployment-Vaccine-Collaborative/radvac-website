import { fetchGraphQL } from "./client";
import type { WpPage, WpMenuItem, WpFaqPage, WpFaqSection } from "./types";

// ===== Page Queries =====

// SEO fields require BOTH `Yoast SEO` AND `Add WPGraphQL SEO` to be installed
// + activated on the WP instance. When the integration plugin isn't active, the
// `seo` field doesn't exist on the schema and the entire query fails. Re-enable
// by setting WP_GRAPHQL_SEO_ENABLED=true in the env.
const SEO_FRAGMENT = process.env.WP_GRAPHQL_SEO_ENABLED === "true"
  ? `
    seo {
      title
      metaDesc
      canonical
      opengraphTitle
      opengraphDescription
      opengraphImage { sourceUrl }
      twitterTitle
      twitterDescription
    }
  `
  : "";

const PAGE_FIELDS = `
  id
  databaseId
  title
  slug
  date
  modified
  content(format: RENDERED)
  featuredImage {
    node {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
  }
  ${SEO_FRAGMENT}
`;

export async function getPageBySlug(
  slug: string,
  isDraft = false
): Promise<WpPage | null> {
  const query = `
    query GetPageBySlug($slug: ID!) {
      page(id: $slug, idType: URI) {
        ${PAGE_FIELDS}
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ page: WpPage | null }>(
      query,
      { slug },
      { isDraft, revalidate: 3600 }
    );
    return data.page;
  } catch {
    console.error(`Failed to fetch page: ${slug}`);
    return null;
  }
}

export async function getAllPages(): Promise<WpPage[]> {
  const query = `
    query GetAllPages {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          ${PAGE_FIELDS}
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ pages: { nodes: WpPage[] } }>(query, undefined, {
      revalidate: 3600,
    });
    return data.pages.nodes;
  } catch {
    console.error("Failed to fetch all pages");
    return [];
  }
}

export async function getAllPageSlugs(): Promise<string[]> {
  const query = `
    query GetAllPageSlugs {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ pages: { nodes: { slug: string }[] } }>(
      query,
      undefined,
      { revalidate: 3600 }
    );
    return data.pages.nodes.map((p) => p.slug);
  } catch {
    console.error("Failed to fetch page slugs");
    return [];
  }
}

// ===== FAQ Queries =====

export async function getFaqPageContent(): Promise<WpFaqSection[]> {
  const query = `
    query GetFaqPage {
      page(id: "faq", idType: URI) {
        id
        faqPageContent {
          faqSections {
            label
            items {
              question
              answer
              defaultOpen
            }
          }
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ page: WpFaqPage | null }>(query, undefined, {
      revalidate: 3600,
    });
    return data.page?.faqPageContent?.faqSections ?? [];
  } catch {
    console.error("Failed to fetch FAQ page content");
    return [];
  }
}

// ===== Menu Queries =====

export async function getMenuItems(
  location: string = "PRIMARY"
): Promise<WpMenuItem[]> {
  const query = `
    query GetMenu($location: MenuLocationEnum!) {
      menuItems(where: { location: $location }, first: 50) {
        nodes {
          id
          label
          url
          path
          parentId
          childItems {
            nodes {
              id
              label
              url
              path
            }
          }
        }
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{
      menuItems: { nodes: WpMenuItem[] };
    }>(query, { location }, { revalidate: 3600 });
    return data.menuItems.nodes;
  } catch {
    console.error("Failed to fetch menu items");
    return [];
  }
}
