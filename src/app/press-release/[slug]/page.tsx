import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPostBySlug,
  getCommentsForPost,
} from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import {
  cmsUnavailableMetadata,
  notFoundMetadata,
  wpContentMetadata,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/seo";
import { PageHeader } from "@/components/layout/PageHeader";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import { JsonLd } from "@/components/JsonLd";
import { CommentForm } from "./CommentForm";
import type { WpPost, WpComment } from "@/lib/wordpress/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: WpPost | null = null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return cmsUnavailableMetadata("Update");
  }

  if (!post) {
    return notFoundMetadata("Post Not Found");
  }

  return wpContentMetadata(post, {
    path: `/press-release/${post.slug}`,
    ogType: "article",
    article: {
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: post.author?.node?.name ? [post.author.node.name] : undefined,
    },
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  let post: WpPost | null = null;
  let fetchError: string | undefined;
  try {
    post = await getPostBySlug(slug);
  } catch (err) {
    console.error(`press-release/${slug}: failed to fetch WP post`, err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  if (fetchError) {
    return (
      <>
        <PageHeader title="Update" />
        <CmsErrorBanner
          error={fetchError}
          endpoint={process.env.WP_GRAPHQL_URL}
        />
      </>
    );
  }

  if (!post) {
    notFound();
  }

  let comments: WpComment[] = [];
  let commentsError: string | undefined;
  try {
    comments = await getCommentsForPost(post.databaseId);
  } catch (err) {
    console.error(`press-release/${slug}: failed to fetch comments`, err);
    commentsError = err instanceof Error ? err.message : String(err);
  }

  const content = sanitizeWpHtml(post.content);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title.replace(/<[^>]+>/g, ""),
    url: `${SITE_URL}/press-release/${post.slug}`,
    datePublished: post.date,
    dateModified: post.modified,
    ...(post.featuredImage?.node.sourceUrl
      ? { image: [post.featuredImage.node.sourceUrl] }
      : {}),
    ...(post.author?.node?.name
      ? { author: { "@type": "Person", name: post.author.node.name } }
      : {}),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return (
    <>
      <JsonLd data={articleJsonLd} />
      <PageHeader title={post.title} />

      <section className="pt-16 px-6 md:px-14">
        <div className="bg-white rounded-2xl shadow-sm py-12 px-6 sm:px-12 md:px-20">
          <div className="max-w-[760px] mx-auto">
          <p className="text-base text-gray-500 mb-6">
            <Link
              href="/press-release"
              className="text-blue-700 hover:underline"
            >
              ← All updates
            </Link>
            <span className="mx-2">·</span>
            {formatDate(post.date)}
            {post.author?.node?.name && (
              <>
                <span className="mx-2">·</span>
                by {post.author.node.name}
              </>
            )}
          </p>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <hr className="my-12 border-gray-200" />

          <section aria-labelledby="comments-heading">
            <h2
              id="comments-heading"
              className="text-2xl font-semibold mb-6"
            >
              Comments ({comments.length})
            </h2>

            {commentsError ? (
              <CmsErrorBanner
                error={commentsError}
                endpoint={process.env.WP_GRAPHQL_URL}
              />
            ) : comments.length === 0 ? (
              <p className="text-gray-600 mb-8">
                No comments yet. Be the first to leave one.
              </p>
            ) : (
              <ul className="flex flex-col gap-6 mb-12">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="border-l-4 border-gray-200 pl-4 py-1"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      <strong className="text-gray-900">
                        {c.author?.node?.name ?? "Anonymous"}
                      </strong>
                      <span className="mx-2">·</span>
                      {formatDate(c.date)}
                    </p>
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeWpHtml(c.content),
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            <h3 className="text-xl font-semibold mb-4">Leave a comment</h3>
            <CommentForm postId={post.databaseId} />
          </section>
        </div>
        </div>
      </section>
    </>
  );
}
