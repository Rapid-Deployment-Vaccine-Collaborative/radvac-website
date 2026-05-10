// WordPress GraphQL types

export interface WpPage {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  modified: string;
  content: string;
  featuredImage?: {
    node: WpMediaItem;
  };
  seo?: WpSeo;
  editorBlocks?: WpBlock[];
}

export interface WpPost {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  date: string;
  modified: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    node: WpMediaItem;
  };
  seo?: WpSeo;
  editorBlocks?: WpBlock[];
  categories?: {
    nodes: WpCategory[];
  };
}

export interface WpMediaItem {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

export interface WpSeo {
  title: string;
  metaDesc: string;
  canonical?: string;
  opengraphTitle?: string;
  opengraphDescription?: string;
  opengraphImage?: {
    sourceUrl: string;
  };
  twitterTitle?: string;
  twitterDescription?: string;
}

export interface WpCategory {
  id: string;
  name: string;
  slug: string;
}

export interface WpMenuItem {
  id: string;
  label: string;
  url: string;
  path: string;
  parentId: string | null;
  childItems?: {
    nodes: WpMenuItem[];
  };
}

// FAQ types (ACF-backed; field group `faq_page_content` on the /faq page)

export interface WpFaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean | null;
}

export interface WpFaqSection {
  label: string;
  items: WpFaqItem[] | null;
}

export interface WpFaqPageContent {
  faqSections: WpFaqSection[] | null;
}

export interface WpFaqPage {
  id: string;
  faqPageContent: WpFaqPageContent | null;
}

// Block types from WPGraphQL Content Blocks
export interface WpBlock {
  name: string;
  renderedHtml?: string;
  attributes?: Record<string, unknown>;
  innerBlocks?: WpBlock[];
}

export interface CoreParagraphAttributes {
  content: string;
  align?: string;
  className?: string;
}

export interface CoreHeadingAttributes {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  textAlign?: string;
  className?: string;
}

export interface CoreListAttributes {
  ordered: boolean;
  values: string;
  className?: string;
}

export interface CoreImageAttributes {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  className?: string;
  sizeSlug?: string;
}

export interface CoreHtmlAttributes {
  content: string;
}

export interface CoreGroupAttributes {
  tagName?: string;
  className?: string;
  layout?: {
    type: string;
  };
}

export interface CoreColumnsAttributes {
  className?: string;
}

export interface CoreColumnAttributes {
  width?: string;
  className?: string;
}
