import { defineSocials } from "../lib/content.mjs";

export type SocialPlatform =
  | "x"
  | "youtube"
  | "discord"
  | "steam"
  | "instagram"
  | "bluesky"
  | "reddit"
  | "tiktok"
  | "linkedin"
  | "github";

export type SocialLink = {
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const settings = __SITE_SETTINGS__;
export const site = {
  name: "Solivant Studios",
  motto: "Mundi sine fine",
  description: "Solivant Studios. Mundi sine fine. Developing our initial release Byzantium alongside upcoming projects Hexagonal, Cubes, and Horizon.",
  navigation: [
    { label: "Byzantium", href: "/projects/byzantium/" },
    { label: "Contact", href: "/contact/" },
  ],
  // Paste your full HTTPS profile URL into any slot below to publish it across the
  // footer, Contact page, Open Graph metadata, and Organization JSON-LD schema.
  // Leave blank ("") until the account is live.
  socials: defineSocials({
    x: "",         // e.g. "https://x.com/solivantstudios"
    youtube: "",   // e.g. "https://www.youtube.com/@solivantstudios"
    discord: "",   // e.g. "https://discord.gg/..."
    steam: "",     // e.g. "https://store.steampowered.com/developer/solivantstudios"
    instagram: "", // e.g. "https://www.instagram.com/solivantstudios"
    bluesky: "",   // e.g. "https://bsky.app/profile/solivantstudios.com"
    reddit: "",    // e.g. "https://www.reddit.com/r/..."
    tiktok: "",    // e.g. "https://www.tiktok.com/@solivantstudios"
    linkedin: "",  // e.g. "https://www.linkedin.com/company/solivant-studios"
  }) as SocialLink[],
} as const;
