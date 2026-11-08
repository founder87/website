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
    slug: "byzantium", title: "Byzantium", workingTitle: false,
    status: "In development", tone: "clay",
    summary: "Fortress architecture, siegecraft, and formation warfare in the Byzantine world. The initial release from Solivant Studios.",
    description: [
      "Byzantium is the flagship initial release in development at Solivant Studios—bringing together grounded fortress construction, siege warfare, and disciplined battlefield formations in the Byzantine world.",
      "Raise timber and masonry defenses from palisades and watchtowers to fortified citadels, engineer siege engines, and hold the line in close-order clashes where terrain, structure, and formation cohesion decide the day.",
      "Official gameplay captures, technical deep dives, target platforms, and release window details will be published here as we prepare Byzantium for its formal reveal.",
    ],
    platforms: [],
  },
  {
    slug: "boomtown", title: "BoomTown", workingTitle: false,
    status: "In development", tone: "ochre",
    summary: "BoomTown is an original game in development at Solivant Studios.",
    description: [
      "BoomTown is a confirmed title in the Solivant Studios development slate, following our initial focus on Byzantium.",
      "Official artwork, gameplay details, platform support, and release timing will be published on this page as they are announced.",
    ],
    platforms: [],
  },
  {
    slug: "the-grid", title: "The Grid", workingTitle: false,
    status: "In development", tone: "sage",
    summary: "The Grid is an original game in development at Solivant Studios.",
    description: [
      "The Grid is a confirmed title in active development at Solivant Studios.",
      "Visuals, system details, platforms, and release milestones will be shared here when the project is ready for a closer look.",
    ],
    platforms: [],
  },
  {
    slug: "horizon", title: "Horizon", workingTitle: true,
    status: "In development", tone: "silver",
    summary: "Horizon is the working title of a project in development at Solivant Studios.",
    description: [
      "Horizon is the working title for the fourth project in the Solivant collection.",
      "The final title, artwork, and gameplay overview will be shared here once formally announced.",
    ],
    platforms: [],
  },
]);
