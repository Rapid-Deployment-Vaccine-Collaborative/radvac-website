import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { PageHeader } from "@/components/layout/PageHeader";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import type { WpPost } from "@/lib/wordpress/types";

export const metadata: Metadata = {
  title: "Updates — RaDVaC",
  description: "News, press releases, and updates from RaDVaC.",
  openGraph: {
    title: "Updates — RaDVaC",
    description: "News, press releases, and updates from RaDVaC.",
    url: "/press-release",
    type: "website",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function stripContinueReading(html: string): string {
  return html
    .replace(/<p[^>]*class=["'][^"']*link-more[^"']*["'][^>]*>[\s\S]*?<\/p>/gi, "")
    .replace(/<a[^>]*class=["'][^"']*more-link[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "");
}

function flattenExcerpt(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function UpdatesListPage() {
  let posts: WpPost[] = [];
  let fetchError: string | undefined;
  try {
    posts = await getAllPosts();
  } catch (err) {
    console.error("press-release: failed to fetch posts", err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  return (
    <>
      <PageHeader title="Updates" />

      <section className="pt-16 px-6 md:px-14">
        <div className="bg-white rounded-2xl shadow-sm py-12 px-6 sm:px-12 md:px-20">
          <div className="max-w-[900px] mx-auto">
            {fetchError ? (
              <CmsErrorBanner
                error={fetchError}
                endpoint={process.env.WP_GRAPHQL_URL}
              />
            ) : posts.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No updates yet.</p>
            ) : (
              <ul className="flex flex-col gap-10">
                {posts.map((post) => {
                  const img = post.featuredImage?.node;
                  return (
                    <li key={post.id}>
                      <Link
                        href={`/press-release/${post.slug}`}
                        className="block group"
                      >
                        {img?.sourceUrl && (
                          <div className="mb-4 overflow-hidden rounded">
                            <Image
                              src={img.sourceUrl}
                              alt={img.altText || post.title}
                              width={img.mediaDetails?.width ?? 1200}
                              height={img.mediaDetails?.height ?? 630}
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mb-2">
                          {formatDate(post.date)}
                        </p>
                        <h2
                          className="text-2xl font-semibold mb-3 group-hover:underline"
                          dangerouslySetInnerHTML={{ __html: sanitizeWpHtml(post.title) }}
                        />
                        {post.excerpt && (
                          <div
                            className="prose max-w-none text-gray-700 line-clamp-4"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeWpHtml(
                                flattenExcerpt(stripContinueReading(post.excerpt))
                              ),
                            }}
                          />
                        )}
                        <span className="inline-block mt-3 text-blue-700 group-hover:underline">
                          Read more →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
