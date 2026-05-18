import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import styles from "./Mission.module.css";

const MISSION_PAGE_SLUG = "mission";

export async function Mission() {
  let html: string | null = null;
  let fetchFailed = false;
  try {
    const page = await getPageBySlug(MISSION_PAGE_SLUG);
    html = page?.content?.trim() ? sanitizeWpHtml(page.content) : null;
  } catch (err) {
    console.error("Mission: failed to fetch WP content", err);
    fetchFailed = true;
  }

  return (
    <section className="section" id="mission">
      <div className="sec-num">
        <strong>The Mission</strong>
      </div>
      {fetchFailed || !html ? (
        <div className={styles.mission}>
          <CmsErrorBanner />
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
