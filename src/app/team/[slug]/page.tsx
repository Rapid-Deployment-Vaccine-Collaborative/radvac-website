import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollToTop } from "@/components/util/ScrollToTop";
import {
  LinkedInIcon,
  SilhouetteIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { getMemberBySlug } from "@/lib/team";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) return { title: "Not Found" };
  return {
    title: member.name,
    description: member.role,
  };
}

export default async function TeamMemberPage({ params }: PageProps) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);
  if (!member) notFound();

  let wpHtml: string | null = null;
  let wpFetchError: string | undefined;
  if (member.wpUri) {
    try {
      const wpPage = await getPageBySlug(member.wpUri);
      wpHtml = wpPage ? sanitizeWpHtml(wpPage.content) : null;
    } catch (err) {
      console.error(`team/${slug}: failed to fetch WP bio`, err);
      wpFetchError = err instanceof Error ? err.message : String(err);
    }
  }

  return (
    <>
      <ScrollToTop />
      <PageHeader title={member.name} />
      <section className="section">
        <div />
        <div className={styles.layout}>
          <div className={styles.portraitCol}>
            {member.pageImage || member.image ? (
              <div className={styles.portrait}>
                <Image
                  src={(member.pageImage || member.image) as string}
                  alt={member.name}
                  width={400}
                  height={534}
                  className={styles.portraitImg}
                />
              </div>
            ) : (
              <div
                className={`${styles.portrait} ${styles.portraitFallback}`}
                aria-hidden="true"
              >
                <span className={styles.silhouette}>
                  <SilhouetteIcon />
                </span>
              </div>
            )}
            <div className={styles.socials}>
              <a
                className={styles.linkedin}
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
              >
                <LinkedInIcon />
              </a>
              {member.x && (
                <a
                  className={styles.xLink}
                  href={member.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on X`}
                >
                  <XIcon />
                </a>
              )}
            </div>
          </div>
          <div className={styles.bioCol}>
            {wpFetchError ? (
              <CmsErrorBanner
                error={wpFetchError}
                endpoint={process.env.WP_GRAPHQL_URL}
              />
            ) : wpHtml ? (
              <div
                className={styles.bio}
                dangerouslySetInnerHTML={{ __html: wpHtml }}
              />
            ) : (
              <p className={styles.bio}>{member.bio}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
