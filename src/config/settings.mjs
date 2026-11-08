const DEFAULT_ORIGIN = "https://solivantstudios.com";

/** Build-time public configuration. No secrets or hosting credentials belong here. */
export function readSettings(env = {}) {
  let url;
  try { url = new URL(env.SITE_URL || DEFAULT_ORIGIN); } catch { throw new Error("SITE_URL must be a valid HTTPS origin."); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.");
  }
  const provider = env.CONTACT_PROVIDER || "disabled";
  if (!["disabled", "netlify"].includes(provider)) throw new Error("CONTACT_PROVIDER must be disabled or netlify.");
  const contactEmail = env.CONTACT_EMAIL || "";
  if (contactEmail && !/^[a-zA-Z0-9.!#$%&'*+\/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(contactEmail)) {
    throw new Error("CONTACT_EMAIL must be a plain email address (not a mailto URL).");
  }
  if (contactEmail.length > 254) throw new Error("CONTACT_EMAIL is too long.");
  for (const name of ["SITE_INDEXABLE", "CONTACT_PRIVACY_REVIEWED"]) {
    if (env[name] && !["true", "false"].includes(env[name])) throw new Error(name + " must be true or false.");
  }
  const isProductionNetlify = env.NETLIFY === "true" && env.CONTEXT === "production";
  if (provider === "netlify" && isProductionNetlify && env.CONTACT_PRIVACY_REVIEWED !== "true") {
    throw new Error("Review contact/privacy copy, then set CONTACT_PRIVACY_REVIEWED=true before enabling the production form.");
  }
  const isPreview = Boolean(env.CONTEXT && env.CONTEXT !== "production");
  return Object.freeze({
    origin: url.origin,
    indexable: env.SITE_INDEXABLE === "true" && !isPreview,
    contactEmail,
    contactEnabled: provider === "netlify" && isProductionNetlify,
    contactProvider: provider,
  });
}
