import styles from "./Team.module.css";

const members = [
  {
    name: "Preston Estep, Ph.D.",
    role: "Founder and Chief Scientist",
    bio: "Preston Estep, Ph.D. is Founder and Chief Scientist  RaDVaC project. Dr. Estep studied neuroscience at Cornell University as a Howard Hughes Medical Institute undergraduate scholar. He holds a Ph.D. in Genetics from Harvard University. Dr. Estep has been a cofounder and advisor to many startup companies and nonprofits across the frontiers of biotech and AI.",
    linkedin: "https://www.linkedin.com/in/preston-estep-76556b6",
  },
  {
    name: "Alex Hoekstra",
    role: "Director of Community, co-founder",
    bio: "Alex Hoekstra is Director of Community and co-founder of the RaDVaC project. He has previously served as both a staff member and participatory research pioneer at the Harvard Personal Genome Project, and worked to advance accessibility and rationality across multiple fields of life sciences.",
    linkedin: "https://www.linkedin.com/in/alexhoekstra",
  },
  {
    name: "Ranjan Ahuja",
    role: "Director of Communications",
    bio: "Ranjan Ahuja is Director of Communications at RaDVaC. He is also a staff member (currently on leave) at the Harvard Personal Genome Project. He is committed to accelerating benefits to society through open source and open access science.",
    linkedin: "https://www.linkedin.com/in/rxahuja/",
  },
  {
    name: "Brian M. Delaney",
    role: "AI Liaison",
    bio: "Brian M. Delaney is the AI Liaison at RaDVaC. He has founded and run several nonprofit and not-for-profit research organizations focused on health and longevity, with a particular emphasis on mental and neurological health.",
    linkedin: "https://www.linkedin.com/in/brian-manning-delaney/",
  },
  {
    name: "Dan Elton, Ph.D.",
    role: "Scientist & Content Writer",
    bio: "Dan Elton, PhD is a scientist and content writer at RaDVaC working on AI projects.",
    linkedin: "https://www.linkedin.com/in/danielelton",
  },
];

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function SilhouettePlaceholder() {
  return (
    <div className={styles.portrait} aria-hidden="true">
      <svg
        viewBox="0 0 80 96"
        className={styles.silhouette}
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="40" cy="32" r="16" />
        <path d="M8 96c0-17.7 14.3-32 32-32s32 14.3 32 32z" />
      </svg>
    </div>
  );
}

export function Team() {
  return (
    <section className="section" id="team">
      <div className="sec-num">
        <strong>The Team</strong>
      </div>
      <div>
        <div className={styles.team}>
          {members.map((m) => (
            <div key={m.name} className={styles.member}>
              <div className={styles.header}>
                <div className={styles.identity}>
                  <h3 className={styles.name}>{m.name}</h3>
                  <div className={styles.role}>{m.role}</div>
                  <a
                    className={styles.linkedin}
                    href={m.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${m.name} on LinkedIn`}
                  >
                    <LinkedInIcon />
                  </a>
                </div>
                <SilhouettePlaceholder />
              </div>
              <p className={styles.bio}>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
