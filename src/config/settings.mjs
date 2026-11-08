const DEFAULT_ORIGIN = "https://solivantstudios.com";

/** Build-time public configuration. No secrets or hosting credentials belong here. */
export function readSettings(env = {}) {
  let url;
  try { url = new URL(env.SITE_URL || DEFAULT_ORIGIN); } catch { throw new Error("SITE_URL must be a valid HTTPS origin."); }
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.");
  }
  const contactEmail = env.CONTACT_EMAIL || "";
  if (contactEmail && !/^[a-zA-Z0-9.!#$%&'*+\/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(contactEmail)) {
    throw new Error("CONTACT_EMAIL must be a plain email address (not a mailto URL).");
  }
  if (contactEmail.length > 254) throw new Error("CONTACT_EMAIL is too long.");
  const gaMeasurementId = env.GA_MEASUREMENT_ID || "";
  if (gaMeasurementId && !/^(?:G|GTM)-[A-Z0-9]{4,16}$/.test(gaMeasurementId)) {
    throw new Error("GA_MEASUREMENT_ID must be a valid GA4 or GTM ID (e.g. G-XXXXXXXXXX or GTM-XXXXXXXX).");
  }
  if (env.SITE_INDEXABLE && !["true", "false"].includes(env.SITE_INDEXABLE)) {
    throw new Error("SITE_INDEXABLE must be true or false.");
  }
  const isPreview = Boolean(env.CONTEXT && env.CONTEXT !== "production");
  return Object.freeze({
    origin: url.origin,
    indexable: env.SITE_INDEXABLE === "true" && !isPreview,
    contactEmail,
    gaMeasurementId: !isPreview ? gaMeasurementId : "",
  });
}
