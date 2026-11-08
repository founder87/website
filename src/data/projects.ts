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
    status: "In development", tone: "clay",
    summary: "Around the year 1000, Constantinople is the greatest city in the Christian world, but the Roman Empire is a shadow of its former self. The emperor himself has called upon you to serve. For Byzantium.",
    description: [
      "Around the year 1000, Constantinople is the greatest city in the Christian world, but the Roman Empire is a shadow of its former self. Engulfed in internal struggle and looming threats from outside, the emperor himself has called upon you to serve. For Byzantium.",
      "Byzantium is the flagship initial release in development at Solivant Studios—bringing together grounded fortress construction, siege warfare, and disciplined battlefield formations across the Byzantine frontier.",
      "Powered by hyperoptimized custom engine architecture, Byzantium pushes hardware to its limits to deliver large-scale physical realism, structural destruction, and high-density formation combat while remaining accessible across a wide range of devices.",
    ],
    platforms: [],
  },
  {
    slug: "boomtown", title: "BoomTown", workingTitle: true,
    status: "Upcoming", tone: "ochre",
    summary: "Upcoming project (codename). Limited information is available while studio production focuses on Byzantium.",
    description: [
      "BoomTown is the internal codename for an upcoming project at Solivant Studios.",
      "Limited information is being shared at this stage while the studio’s primary development focus remains on our initial release, Byzantium.",
    ],
    platforms: [],
  },
  {
    slug: "the-grid", title: "The Grid", workingTitle: true,
    status: "Upcoming", tone: "sage",
    summary: "Upcoming project (codename) built around a hexagonal honeycomb grid. Limited information is available at this stage.",
    description: [
      "The Grid is the internal codename for an upcoming Solivant Studios project structured around an interlocking hexagonal comb.",
      "Details remain under wraps while primary development focuses on our initial release, Byzantium. Further information will be shared when the project is ready for reveal.",
    ],
    platforms: [],
  },
  {
    slug: "horizon", title: "Horizon", workingTitle: true,
    status: "Upcoming", tone: "silver",
    summary: "Upcoming project (codename). Limited information is available while studio production focuses on Byzantium.",
    description: [
      "Horizon is the internal codename for an upcoming project in the Solivant Studios slate.",
      "Limited information is available at this time. Official title, premise, and media will be shared once formally announced.",
    ],
    platforms: [],
  },
]);
