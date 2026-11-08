export function safeExternalUrl(value) {
  if (typeof value !== "string" || /[\s\\]/.test(value)) throw new Error("External links must be plain HTTPS URLs.");
  let url;
  try { url = new URL(value); } catch { throw new Error("External links must be valid HTTPS URLs."); }
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("External links must use HTTPS without credentials.");
  return value;
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
    if (!project.title?.trim() || !project.summary?.trim() || !project.description?.length || project.description.some(p => !p.trim())) throw new Error("Projects need a title, summary, and description.");
    if (!["ochre", "sage", "silver", "clay"].includes(project.tone)) throw new Error("Unknown project tone.");
    if (!["In development", "Upcoming", "Coming soon", "Available now"].includes(project.status)) throw new Error("Unknown project status.");
    if (typeof project.workingTitle !== "boolean" || !Array.isArray(project.platforms) || project.platforms.some(p => typeof p !== "string" || !p.trim())) throw new Error("Projects need title status and a platform list.");
    if (project.cover) validateImage(project.cover);
    for (const image of project.gallery || []) validateImage(image);
    for (const link of [...(project.links || []), ...(project.trailer ? [project.trailer] : [])]) {
      if (!link.label?.trim()) throw new Error("External links need a readable label.");
      safeExternalUrl(link.href);
    }
  }
  return projects;
}
