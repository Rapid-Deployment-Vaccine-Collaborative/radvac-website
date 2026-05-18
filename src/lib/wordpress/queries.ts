import { fetchGraphQL } from "./client";
import type {
  WpPage,
  WpPost,
  WpComment,
  WpMenuItem,
  WpFaqPage,
  WpFaqSection,
} from "./types";

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

// Query functions intentionally do not catch errors from `fetchGraphQL`.
// A thrown error means "the CMS is unreachable"; a returned `null` / `[]`
// means "the CMS responded but the content doesn't exist." Callers
// distinguish the two so users see a clear "CMS unavailable" message
// instead of a misleading 404 or silent static fallback.

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

  const data = await fetchGraphQL<{ page: WpPage | null }>(
    query,
    { slug },
    { isDraft, revalidate: 3600 }
  );
  return data.page;
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

  const data = await fetchGraphQL<{ pages: { nodes: WpPage[] } }>(query, undefined, {
    revalidate: 3600,
  });
  return data.pages.nodes;
}

export async function getAllPageSlugs(): Promise<string[]> {
  const query = `
    query GetAllPageSlugs {
      pages(first: 100, where: { status: PUBLISH }) {
        nodes {
          uri
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ pages: { nodes: { uri: string }[] } }>(
    query,
    undefined,
    { revalidate: 3600 }
  );
  return data.pages.nodes.map((p) => p.uri.replace(/^\/|\/$/g, ""));
}

// ===== Post Queries =====

const POST_FIELDS = `
  id
  databaseId
  title
  slug
  date
  modified
  content(format: RENDERED)
  excerpt(format: RENDERED)
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
  categories {
    nodes {
      id
      name
      slug
    }
  }
  author {
    node {
      name
    }
  }
  ${SEO_FRAGMENT}
`;

export async function getAllPosts(first = 20): Promise<WpPost[]> {
  const query = `
    query GetAllPosts($first: Int!) {
      posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
        nodes {
          ${POST_FIELDS}
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: WpPost[] } }>(
    query,
    { first },
    { revalidate: 3600 }
  );
  return data.posts.nodes;
}

export async function getPostBySlug(
  slug: string,
  isDraft = false
): Promise<WpPost | null> {
  const query = `
    query GetPostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        ${POST_FIELDS}
      }
    }
  `;

  const data = await fetchGraphQL<{ post: WpPost | null }>(
    query,
    { slug },
    { isDraft, revalidate: 3600 }
  );
  return data.post;
}

export async function getAllPostSlugs(): Promise<string[]> {
  const query = `
    query GetAllPostSlugs {
      posts(first: 200, where: { status: PUBLISH }) {
        nodes {
          slug
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(
    query,
    undefined,
    { revalidate: 3600 }
  );
  return data.posts.nodes.map((p) => p.slug);
}

export async function getCommentsForPost(
  postDatabaseId: number
): Promise<WpComment[]> {
  const query = `
    query GetCommentsForPost($id: ID!) {
      comments(
        where: { contentId: $id, parent: 0, order: ASC, orderby: COMMENT_DATE }
        first: 100
      ) {
        nodes {
          id
          databaseId
          date
          content
          author {
            node {
              name
            }
          }
        }
      }
    }
  `;

  const data = await fetchGraphQL<{ comments: { nodes: WpComment[] } }>(
    query,
    { id: String(postDatabaseId) },
    { revalidate: 60 }
  );
  return data.comments.nodes;
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

  const data = await fetchGraphQL<{ page: WpFaqPage | null }>(query, undefined, {
    revalidate: 3600,
  });
  return data.page?.faqPageContent?.faqSections ?? [];
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

  const data = await fetchGraphQL<{
    menuItems: { nodes: WpMenuItem[] };
  }>(query, { location }, { revalidate: 3600 });
  return data.menuItems.nodes;
}
