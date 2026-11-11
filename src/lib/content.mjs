const SOCIAL_PLATFORMS = Object.freeze({
  x: "X",
  youtube: "YouTube",
  discord: "Discord",
  steam: "Steam",
  instagram: "Instagram",
  bluesky: "Bluesky",
  reddit: "Reddit",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  github: "GitHub",
});

export function safeExternalUrl(value) {
  if (typeof value !== "string" || /[\s\\]/.test(value)) throw new Error("External links must be plain HTTPS URLs.");
  let url;
  try { url = new URL(value); } catch { throw new Error("External links must be valid HTTPS URLs."); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("External links must use HTTPS without credentials.");
  return value;
}

/** @param {Record<string, string | undefined>} [channels] */
export function defineSocials(channels = {}) {
  if (!channels || typeof channels !== "object" || Array.isArray(channels)) {
    throw new Error("Social channels must be a platform-to-URL object.");
  }
  const entries = [];
  for (const [platform, rawHref] of Object.entries(channels)) {
    if (!(platform in SOCIAL_PLATFORMS)) {
      throw new Error(`Unknown social platform "${platform}".`);
    }
    if (rawHref === undefined || rawHref === "") continue;
    if (typeof rawHref !== "string" || !rawHref.trim()) {
      throw new Error(`Social URL for "${platform}" must be an HTTPS URL or empty string.`);
    }
    const href = safeExternalUrl(rawHref.trim());
    entries.push({ platform, label: SOCIAL_PLATFORMS[platform], href });
  }
  return entries;
}

export function validateImage(image) {
  if (!image || !/^\/media\/projects\/[a-zA-Z0-9/_-]+\.(?:avif|webp|png|jpe?g)$/.test(image.src)) {
    throw new Error("Project images must be local raster files inside /media/projects/.");
  }
  if (!image.alt?.trim()) throw new Error("Project images need descriptive alternative text.");
  if (![image.width, image.height].every(value => Number.isInteger(value) && value > 0 && value <= 16000)) {
    throw new Error("Project images need valid intrinsic width and height.");
  }
  return image;
}

/** @template T @param {T[]} projects @returns {T[]} */
export function defineProjects(projects) {
  const slugs = new Set();
  for (const project of projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) throw new Error("Project slugs must be unique URL-safe names.");
    slugs.add(project.slug);
    if (!project.title?.trim() || typeof project.workingTitle !== "boolean") throw new Error("Projects need a title and workingTitle boolean.");
    if (!project.workingTitle && (!project.summary?.trim() || !project.description?.length || project.description.some(p => !p.trim()))) {
      throw new Error("Announced projects need a summary and description.");
    }
    if (project.lede !== undefined && (typeof project.lede !== "string" || !project.lede.trim())) {
      throw new Error("Project lede must be a non-empty string when provided.");
    }
    if (!["ochre", "slate", "clay", "emerald"].includes(project.tone)) throw new Error("Unknown project tone.");
    if (!["In development", "Upcoming", "Coming soon", "Available now"].includes(project.status)) throw new Error("Unknown project status.");
    if (project.platforms && (!Array.isArray(project.platforms) || project.platforms.some(p => typeof p !== "string" || !p.trim()))) throw new Error("Project platforms must be non-empty strings.");
    if (project.cover) validateImage(project.cover);
    for (const image of project.gallery || []) validateImage(image);
    for (const link of [...(project.links || []), ...(project.trailer ? [project.trailer] : [])]) {
      if (!link.label?.trim()) throw new Error("External links need a readable label.");
      safeExternalUrl(link.href);
    }
  }
  return projects;
}
