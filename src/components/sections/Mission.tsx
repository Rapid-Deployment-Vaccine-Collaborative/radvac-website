import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import styles from "./Mission.module.css";

const MISSION_PAGE_SLUG = "mission";

export async function Mission() {
  let html: string | null = null;
  let fetchError: string | undefined;
  try {
    const page = await getPageBySlug(MISSION_PAGE_SLUG);
    html = page?.content?.trim() ? sanitizeWpHtml(page.content) : null;
  } catch (err) {
    console.error("Mission: failed to fetch WP content", err);
    fetchError = err instanceof Error ? err.message : String(err);
  }

  return (
    <section className="section" id="mission">
      <div className="sec-num">
        <strong>The Mission</strong>
      </div>
      {fetchError || !html ? (
        <div className={styles.mission}>
          <CmsErrorBanner
            error={fetchError}
            endpoint={process.env.WP_GRAPHQL_URL}
          />
        </div>
      ) : (
        <div
          className={styles.mission}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </section>
  );
}
