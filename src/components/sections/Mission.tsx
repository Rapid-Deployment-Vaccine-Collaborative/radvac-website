import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import { CmsErrorBanner } from "@/components/CmsErrorBanner";
import styles from "./Mission.module.css";

const MISSION_PAGE_SLUG = "mission";

// Static copy shown only when the CMS cannot be reached at all (a thrown
// fetch error), so visitors still see the mission statement during a WP
// outage. Keep this in sync with the "mission" page content in WordPress.
function MissionFallback() {
  return (
    <>
      <p>
        The Rapid Deployment Vaccine Collaborative (Radvac) is a 501(c)(3)
        nonprofit organization formed to enable rapid production and
        deployment of safe and effective pathogen countermeasures (including
        low-cost vaccines; rapidly configurable antiviral therapies;
        broad-spectrum antiviral prophylactics; and the production capacity
        for each) in the earliest days of outbreaks. We create
        proof-of-principle demonstrations of early stage countermeasures, and
        freely share methods and protocols for decentralized production and
        deployment.
      </p>
      <p>
        We believe that the foundation of effective countermeasures is
        maximal access in terms of both speed and geography, including and
        especially in low-resource areas. Two key ways we aim to fulfill the
        promise of maximal access is through self-production and
        self-administration of biosecurity tools.
      </p>
      <p>
        Beginning in March 2020, in less than one month, we designed,
        produced, and self-administered the first of several progressive
        generations of nasal vaccines against SARS-CoV-2, and we shared all
        methods and protocols online in a series of white papers. We chose
        not to file patents or secured other intellectual property
        protections, and all information on our vaccine designs, production,
        self-administration, and testing has been freely shared on this
        website under open licenses (
        <a
          href="https://web.archive.org/web/20260728093341mp_/https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY 4.0
        </a>{" "}
        and{" "}
        <a
          href="https://web.archive.org/web/20260728093341mp_/https://opencovidpledge.org/licenses__trashed/v1-1-ocl-p/"
          target="_blank"
          rel="noopener noreferrer"
        >
          OCL-P v1.1
        </a>
        ) in partnership with the Creative Commons{" "}
        <a
          href="https://web.archive.org/web/20250524061056/https://opencovidpledge.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open COVID Pledge
        </a>
        . To coordinate research efforts, we have established a
        collaborative network via our{" "}
        <a
          href="https://web.archive.org/web/20260728093341mp_/https://radvac.org/researchers-map/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Researchers Map
        </a>
        , and other outreach activities.
      </p>
    </>
  );
}

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
      <h2 className="sec-num">
        <strong>Mission</strong>
      </h2>
      {fetchError ? (
        <div className={styles.mission}>
          <CmsErrorBanner
            error={fetchError}
            endpoint={process.env.WP_GRAPHQL_URL}
            fallback={<MissionFallback />}
          />
        </div>
      ) : !html ? (
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
