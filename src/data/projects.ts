import { defineProjects } from "../lib/content.mjs";

export type ProjectImage = {
  src: string; alt: string; width: number; height: number; caption?: string;
};
export type Project = {
  slug: string;
  title: string;
  workingTitle: boolean;
  status: "In development" | "Upcoming" | "Coming soon" | "Available now";
  tone: "ochre" | "slate" | "clay" | "emerald";
  summary?: string;
  lede?: string;
  description?: string[];
  platforms?: string[];
  release?: string;
  cover?: ProjectImage;
  gallery?: ProjectImage[];
  trailer?: { label: string; href: string };
  links?: { label: string; href: string }[];
};

// Order controls the homepage and project cards.
// Only add announced facts. Artwork, media, platforms, and links are optional.
export const projects: Project[] = defineProjects([
  {
    slug: "byzantium", title: "Byzantium", workingTitle: false,
    status: "In development", tone: "ochre",
    summary: "Around the year 1000, Constantinople is the greatest city in the Christian world, but the Roman Empire is a shadow of its former self. Engulfed in internal struggle and looming threats from outside, the emperor himself has called upon you to serve. For Byzantium.",
    lede: "Set across the contested frontiers of the Eastern Roman Empire at the turn of the first millennium, Byzantium places you in command of campaigns where fortification, siegecraft, and battlefield discipline decide the survival of imperial territory.",
    description: [
      "Raise timber and stone fortifications, engineer siege weapons, and command disciplined battlefield formations from frontier strongholds to besieged city walls.",
      "Built on hyperoptimized custom engine technology to push hardware to its limits, Byzantium delivers large-scale physical realism while remaining accessible across a wide range of devices.",
    ],
    // Uncomment as channels and storefront pages go live:
    // trailer: { label: "Watch Trailer", href: "https://www.youtube.com/watch?v=..." },
    // links: [
    //   { label: "Wishlist on Steam", href: "https://store.steampowered.com/app/..." },
    //   { label: "Join Discord", href: "https://discord.gg/..." },
    // ],
  },
  {
    slug: "hexagonal", title: "Hexagonal", workingTitle: true,
    status: "Upcoming", tone: "slate",
  },
  {
    slug: "cubes", title: "Cubes", workingTitle: true,
    status: "Upcoming", tone: "clay",
  },
  {
    slug: "horizon", title: "Horizon", workingTitle: true,
    status: "Upcoming", tone: "emerald",
  },
]);
