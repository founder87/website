export const settings = __SITE_SETTINGS__;
export const site = {
  name: "Solivant Studios",
  motto: "Mundi sine fine",
  description: "Solivant Studios. Mundi sine fine. Developing our initial release Byzantium alongside upcoming projects Cubes, Hexagonal, and Horizon.",
  navigation: [
    { label: "Byzantium", href: "/projects/byzantium/" },
    { label: "Projects", href: "/projects/" },
    { label: "Studio", href: "/studio/" },
    { label: "Contact", href: "/contact/" },
  ],
} as const;
