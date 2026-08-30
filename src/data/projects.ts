export type Project = {
  slug: string;
  workingTitle: string;
  publicTitle: string;
  status: "In development";
  summary: string;
  description: string;
  platforms: string[];
  heroImage?: string;
  gallery?: string[];
  trailerUrl?: string;
  externalLinks?: Array<{
    label: string;
    href: string;
  }>;
};

export const projects: Project[] = [
  {
    slug: "boomtown",
    workingTitle: "BoomTown",
    publicTitle: "Project BoomTown",
    status: "In development",
    summary: "Details will be announced as development progresses.",
    description:
      "Project BoomTown is a working title. Its final name, description, platforms, and release information have not yet been announced.",
    platforms: [],
  },
  {
    slug: "horizon",
    workingTitle: "Horizon",
    publicTitle: "Project Horizon",
    status: "In development",
    summary: "Details will be announced as development progresses.",
    description:
      "Project Horizon is a working title. Its final name, description, platforms, and release information have not yet been announced.",
    platforms: [],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
