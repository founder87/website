import { signJwtRS256 } from "../crypto.mjs";

let cachedToken = { accessToken: "", expiresAtMs: 0, keyEmail: "" };

async function getGoogleServiceToken(clientEmail, privateKey, scope) {
  const nowMs = Date.now();
  if (cachedToken.accessToken && cachedToken.keyEmail === clientEmail && cachedToken.expiresAtMs - 60_000 > nowMs) {
    return cachedToken.accessToken;
  }
  const nowSec = Math.floor(nowMs / 1000);
  const assertion = await signJwtRS256(
    {
      iss: clientEmail,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      iat: nowSec,
      exp: nowSec + 3600,
    },
    privateKey,
  );
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth token exchange failed (${res.status}).`);
  }
  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    expiresAtMs: nowMs + Number(data.expires_in || 3600) * 1000,
    keyEmail: clientEmail,
  };
  return cachedToken.accessToken;
}

async function gaPost(propertyId, endpoint, accessToken, body) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:${endpoint}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    throw new Error(`GA4 ${endpoint} returned HTTP ${res.status}.`);
  }
  return res.json();
}

export async function fetchGa4Metrics(env) {
  const propertyId = String(env.GA4_PROPERTY_ID || "").trim();
  const clientEmail = String(env.GOOGLE_CLIENT_EMAIL || "").trim();
  const privateKey = String(env.GOOGLE_PRIVATE_KEY || "").trim();

  if (!propertyId || !clientEmail || !privateKey) {
    return {
      connected: false,
      provider: "Google Analytics 4",
      setupHint: "Set GA4_PROPERTY_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY secrets to stream live website analytics.",
    };
  }

  try {
    const token = await getGoogleServiceToken(
      clientEmail,
      privateKey,
      "https://www.googleapis.com/auth/analytics.readonly",
    );

    const [realtime, summary30d, summary7d, topPages, topSources, keyEvents] = await Promise.all([
      gaPost(propertyId, "runRealtimeReport", token, {
        metrics: [{ name: "activeUsers" }],
      }).catch(() => ({ rows: [] })),
      gaPost(propertyId, "runReport", token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }),
      gaPost(propertyId, "runReport", token, {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
      }),
      gaPost(propertyId, "runReport", token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        limit: 6,
      }),
      gaPost(propertyId, "runReport", token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        limit: 6,
      }),
      gaPost(propertyId, "runReport", token, {
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "spotlight_byzantium",
                "project_click",
                "contact_email_click",
                "outbound_click",
                "social_x",
                "social_discord",
                "social_youtube",
                "social_steam",
              ],
            },
          },
        },
        limit: 8,
      }).catch(() => ({ rows: [] })),
    ]);

    const num = (row, idx) => Number(row?.metricValues?.[idx]?.value || 0);
    const row30 = summary30d.rows?.[0];
    const row7 = summary7d.rows?.[0];

    return {
      connected: true,
      provider: "Google Analytics 4",
      propertyId,
      activeNow: num(realtime.rows?.[0], 0),
      days7: {
        visitors: num(row7, 0),
        sessions: num(row7, 1),
        pageViews: num(row7, 2),
      },
      days30: {
        visitors: num(row30, 0),
        sessions: num(row30, 1),
        pageViews: num(row30, 2),
      },
      topPages: (topPages.rows || []).map(r => ({
        path: r.dimensionValues?.[0]?.value || "/",
        views: num(r, 0),
        visitors: num(r, 1),
      })),
      topSources: (topSources.rows || []).map(r => ({
        source: r.dimensionValues?.[0]?.value || "(direct)",
        sessions: num(r, 0),
      })),
      events: (keyEvents.rows || []).map(r => ({
        event: r.dimensionValues?.[0]?.value || "event",
        count: num(r, 0),
      })),
    };
  } catch (error) {
    return {
      connected: false,
      provider: "Google Analytics 4",
      error: error instanceof Error ? error.message : "Failed to query GA4.",
    };
  }
}
