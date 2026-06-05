import Image from "next/image";
import Link from "next/link";
import { team } from "@/lib/team";
import {
  LinkedInIcon,
  SilhouetteIcon,
  XIcon,
} from "@/components/icons/SocialIcons";
import styles from "./Team.module.css";

export function Team() {
  return (
    <section className="section" id="team">
      <div className="sec-num">
        <strong>Team</strong>
      </div>
      <div>
        <div className={styles.team}>
          {team.map((m) => (
            <div key={m.slug} className={styles.member}>
              <div className={styles.identity}>
                <h3 className={styles.name}>{m.name}</h3>
                <div className={styles.role}>{m.role}</div>
                <div className={styles.socials}>
                  <a
                    className={styles.linkedin}
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                  >
                    <LinkedInIcon />
                  </a>
                  {m.x && (
                    <a
                      className={styles.xLink}
                      href={m.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on X`}
                    >
                      <XIcon />
                    </a>
                  )}
                </div>
                <Link href={`/team/${m.slug}`} className={styles.bioLink}>
                  Read bio →
                </Link>
              </div>
              {m.image ? (
                <div className={styles.portrait}>
                  <Image
                    src={m.image}
                    alt={m.name}
                    width={200}
                    height={267}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
