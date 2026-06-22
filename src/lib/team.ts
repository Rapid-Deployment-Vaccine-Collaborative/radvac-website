export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  x?: string;
  image?: string;
  /** Larger portrait used on the person page; falls back to `image`. */
  pageImage?: string;
  /**
   * If set, the bio for this member is pulled from WordPress at this URI
   * (e.g. "team/preston-estep") instead of using the static `bio` field.
   */
  wpUri?: string;
};

export const team: TeamMember[] = [
  {
    slug: "preston-estep",
    name: "Preston Estep, Ph.D.",
    role: "Chief Scientist",
    bio: "Preston Estep, Ph.D. is Founder and Chief Scientist of the Radvac project. Dr. Estep studied neuroscience at Cornell University as a Howard Hughes Medical Institute undergraduate scholar. He holds a Ph.D. in Genetics from Harvard University. Dr. Estep has been a cofounder and advisor to many startup companies and nonprofits across the frontiers of biotech and AI.",
    linkedin: "https://www.linkedin.com/in/preston-estep-76556b6",
    x: "https://x.com/PrestonWEstep",
    image: "/images/preston-narrow.png",
    pageImage: "/images/preston-page.jpg",
    wpUri: "team/preston-estep",
  },
  {
    slug: "alex-hoekstra",
    name: "Alex Hoekstra",
    role: "Director of Community",
    bio: "Alex Hoekstra is Director of Community and co-founder of the Radvac project. He has previously served as both a staff member and participatory research pioneer at the Harvard Personal Genome Project, and worked to advance accessibility and rationality across multiple fields of life sciences.",
    linkedin: "https://www.linkedin.com/in/alexhoekstra",
    x: "https://x.com/HoekstraTweets",
    image: "/images/alex-narrow.png",
    pageImage: "/images/alex-page.jpg",
    wpUri: "team/alex-hoekstra",
  },
  {
    slug: "ranjan-ahuja",
    name: "Ranjan Ahuja",
    role: "Director of Communications",
    bio: "Ranjan Ahuja is Director of Communications at Radvac. He is also a staff member (currently on leave) at the Harvard Personal Genome Project. He is committed to accelerating benefits to society through open source and open access science.",
    linkedin: "https://www.linkedin.com/in/rxahuja/",
    image: "/images/Ranjan-narrow.png",
    wpUri: "team/ranjan-ahuja",
  },
  {
    slug: "brian-delaney",
    name: "Brian M. Delaney",
    role: "AI Liaison",
    bio: "Brian M. Delaney is the AI Liaison at Radvac. He has founded and run several nonprofit and not-for-profit research organizations focused on health and longevity, with a particular emphasis on mental and neurological health.",
    linkedin: "https://www.linkedin.com/in/brian-manning-delaney/",
    x: "https://x.com/BrianMDelaney",
    image: "/images/brian-narrow.png",
    pageImage: "/images/brian-photo.png",
    wpUri: "team/brian-delaney",
  },
  {
    slug: "dan-elton",
    name: "Dan Elton, Ph.D.",
    role: "Scientist & Content Writer",
    bio: "Dan Elton, PhD is a scientist and content writer at Radvac working on AI projects.",
    linkedin: "https://www.linkedin.com/in/danielelton",
    x: "https://x.com/moreisdifferent",
    image: "/images/dan-narrow.png",
    wpUri: "team/dan-elton",
  },
];

export function getMemberBySlug(slug: string): TeamMember | undefined {
  return team.find((m) => m.slug === slug);
}
