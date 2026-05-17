import { getPageBySlug } from "@/lib/wordpress/queries";
import { sanitizeWpHtml } from "@/lib/utils";
import styles from "./Mission.module.css";

const MISSION_PAGE_SLUG = "mission";

function FallbackContent() {
  return (
    <>
      <p className={styles.dropcap}>
        The Rapid Deployment Vaccine Collaborative is a 501(c)(3) nonprofit
        formed to enable rapid production and deployment of safe and effective
        pathogen countermeasures — vaccines, antivirals, and beyond — in the
        earliest days of an outbreak, when speed matters most and
        institutional response is slowest.
      </p>
      <p>
        We create proof-of-principle demonstrations of early-stage vaccines
        and antivirals, and we freely share methods and protocols for
        decentralized production and self-administration. Our two foundations
        are <em>self-production</em> and <em>self-administration</em>: the
        building blocks of distributed, democratic biosecurity infrastructure.
      </p>
      <p>
        Beginning in March 2020, in less than one month, we designed,
        produced, and self-administered the first of several progressive
        generations of nasal vaccines against SARS-CoV-2. We published every
        methods and protocol document online in a series of white papers
        under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>{" "}
        and the <a href="https://opencovidpledge.org/">Open COVID Pledge</a>.
      </p>
    </>
  );
}

export async function Mission() {
  const page = await getPageBySlug(MISSION_PAGE_SLUG);
  const html = page?.content?.trim()
    ? sanitizeWpHtml(page.content)
    : null;

  return (
    <section className="section" id="mission">
      <div className="sec-num">
        <strong>The Mission</strong>
      </div>
      {html ? (
        <div
          className={styles.mission}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className={styles.mission}>
          <FallbackContent />
        </div>
      )}
    </section>
  );
}
