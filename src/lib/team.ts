export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  linkedin: string;
  x?: string;
  image?: string;
};

export const team: TeamMember[] = [
  {
    slug: "preston-estep",
    name: "Preston Estep, Ph.D.",
    role: "Chief Scientist",
    bio: "Preston Estep, Ph.D. is Founder and Chief Scientist of the RaDVaC project. Dr. Estep studied neuroscience at Cornell University as a Howard Hughes Medical Institute undergraduate scholar. He holds a Ph.D. in Genetics from Harvard University. Dr. Estep has been a cofounder and advisor to many startup companies and nonprofits across the frontiers of biotech and AI.",
    linkedin: "https://www.linkedin.com/in/preston-estep-76556b6",
    x: "https://x.com/PrestonWEstep",
    image: "/images/preston-narrow.png",
  },
  {
    slug: "alex-hoekstra",
    name: "Alex Hoekstra",
    role: "Director of Community",
    bio: "Alex Hoekstra is Director of Community and co-founder of the RaDVaC project. He has previously served as both a staff member and participatory research pioneer at the Harvard Personal Genome Project, and worked to advance accessibility and rationality across multiple fields of life sciences.",
    linkedin: "https://www.linkedin.com/in/alexhoekstra",
    x: "https://x.com/HoekstraTweets",
  },
  {
    slug: "ranjan-ahuja",
    name: "Ranjan Ahuja",
    role: "Director of Communications",
    bio: "Ranjan Ahuja is Director of Communications at RaDVaC. He is also a staff member (currently on leave) at the Harvard Personal Genome Project. He is committed to accelerating benefits to society through open source and open access science.",
    linkedin: "https://www.linkedin.com/in/rxahuja/",
    image: "/images/Ranjan-narrow.png",
  },
  {
    slug: "brian-delaney",
    name: "Brian M. Delaney",
    role: "AI Liaison",
    bio: "Brian M. Delaney is the AI Liaison at RaDVaC. He has founded and run several nonprofit and not-for-profit research organizations focused on health and longevity, with a particular emphasis on mental and neurological health.",
    linkedin: "https://www.linkedin.com/in/brian-manning-delaney/",
    x: "https://x.com/BrianMDelaney",
    image: "/images/brian-narrow.png",
  },
  {
    slug: "dan-elton",
    name: "Dan Elton, Ph.D.",
    role: "Scientist & Content Writer",
    bio: "Dan Elton, PhD is a scientist and content writer at RaDVaC working on AI projects.",
    linkedin: "https://www.linkedin.com/in/danielelton",
    x: "https://x.com/moreisdifferent",
  },
];

export function getMemberBySlug(slug: string): TeamMember | undefined {
  return team.find((m) => m.slug === slug);
}
