import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPostBySlug,
  getCommentsForPost,
} from "@/lib/wordpress/queries";
import { rewriteWordPressUrls } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommentForm } from "./CommentForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const ogImage =
    post.seo?.opengraphImage?.sourceUrl ?? post.featuredImage?.node.sourceUrl;

  return {
    title: post.seo?.title || `${post.title} — RaDVaC`,
    description: post.seo?.metaDesc || `${post.title} — RaDVaC`,
    alternates: post.seo?.canonical ? { canonical: post.seo.canonical } : undefined,
    openGraph: {
      title: post.seo?.opengraphTitle || post.title,
      description: post.seo?.opengraphDescription || post.seo?.metaDesc || "",
      url: `/press-release/${post.slug}`,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.twitterTitle || post.seo?.title || post.title,
      description:
        post.seo?.twitterDescription || post.seo?.metaDesc || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  };
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
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getCommentsForPost(post.databaseId);
  const content = rewriteWordPressUrls(post.content);

  return (
    <>
      <PageHeader title={post.title} />

      <section className="py-16 px-6 md:px-14">
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

            {comments.length === 0 ? (
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
                        __html: rewriteWordPressUrls(c.content),
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
