import { defineProjects } from "../lib/content.mjs";

export type ProjectImage = {
  src: string; alt: string; width: number; height: number; caption?: string;
};
export type Project = {
  slug: string;
  title: string;
  workingTitle: boolean;
  status: "In development" | "Coming soon" | "Available now";
  tone: "ochre" | "sage" | "silver" | "clay";
  summary: string;
  description: string[];
  platforms: string[];
  release?: string;
  cover?: ProjectImage;
  gallery?: ProjectImage[];
  trailer?: { label: string; href: string };
  links?: { label: string; href: string }[];
};

// Order controls the homepage, index, and next-project navigation.
// Only add announced facts. Artwork, media, platforms, and links are optional.
export const projects: Project[] = defineProjects([
  {
    slug: "boomtown", title: "BoomTown", workingTitle: false,
    status: "In development", tone: "ochre",
    summary: "A game in development at Solivant Studios.",
    description: ["BoomTown is in development. Artwork, gameplay details, and release information will be shared here as they are announced."],
    platforms: [],
  },
  {
    slug: "the-grid", title: "The Grid", workingTitle: false,
    status: "In development", tone: "sage",
    summary: "A game in development at Solivant Studios.",
    description: ["The Grid is in development. Artwork, gameplay details, and release information will be shared here as they are announced."],
    platforms: [],
  },
  {
    slug: "horizon", title: "Horizon", workingTitle: true,
    status: "In development", tone: "silver",
    summary: "A Solivant Studios project. Working title.",
    description: ["Horizon is the working title of a project in development at Solivant Studios. Further details have not been announced."],
    platforms: [],
  },
  {
    slug: "bastion", title: "Bastion", workingTitle: true,
    status: "In development", tone: "clay",
    summary: "A Solivant Studios project. Working title.",
    description: ["Bastion is the working title of a project in development at Solivant Studios. Further details have not been announced."],
    platforms: [],
  },
]);
