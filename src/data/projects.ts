import { defineProjects } from "../lib/content.mjs";

export type ProjectImage = {
  src: string; alt: string; width: number; height: number; caption?: string;
};
export type Project = {
  slug: string;
  title: string;
  workingTitle: boolean;
  status: "In development" | "Upcoming" | "Coming soon" | "Available now";
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
    status: "In development", tone: "ochre",
    summary: "Around the year 1000, Constantinople is the greatest city in the Christian world, but the Roman Empire is a shadow of its former self. The emperor himself has called upon you to serve. For Byzantium.",
    description: [
      "Around the year 1000, Constantinople is the greatest city in the Christian world, but the Roman Empire is a shadow of its former self. Engulfed in internal struggle and looming threats from outside, the emperor himself has called upon you to serve. For Byzantium.",
      "Raise timber and stone fortifications, engineer siege weapons, and command disciplined battlefield formations across the Byzantine frontier.",
      "Built on hyperoptimized custom engine technology to push hardware to its limits, Byzantium delivers large-scale physical realism while remaining accessible across a wide range of devices.",
    ],
    platforms: [],
  },
  {
    slug: "hexagonal", title: "Hexagonal", workingTitle: true,
    status: "Upcoming", tone: "sage",
    summary: "Upcoming codenamed project at Solivant Studios.",
    description: [
      "Hexagonal is an upcoming codenamed project at Solivant Studios. Details remain limited while production focuses on Byzantium.",
    ],
    platforms: [],
  },
  {
    slug: "cubes", title: "Cubes", workingTitle: true,
    status: "Upcoming", tone: "clay",
    summary: "Upcoming codenamed project at Solivant Studios.",
    description: [
      "Cubes is an upcoming codenamed project at Solivant Studios. Details remain limited while production focuses on Byzantium.",
    ],
    platforms: [],
  },
  {
    slug: "horizon", title: "Horizon", workingTitle: true,
    status: "Upcoming", tone: "silver",
    summary: "Upcoming codenamed project at Solivant Studios.",
    description: [
      "Horizon is an upcoming codenamed project at Solivant Studios. Details remain limited while production focuses on Byzantium.",
    ],
    platforms: [],
  },
]);
