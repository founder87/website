// Apple App Store Connect Sales & Trends API connector (iOS, iPadOS, macOS) with daily series.
import { signJwtES256 } from "../crypto.mjs";

function formatReportDate(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return d.toISOString().slice(0, 10);
}

async function gunzipText(response) {
  if (!response.body) return "";
  const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export function parseAppleSummaryTsv(tsvText) {
  const lines = String(tsvText || "").trim().split(/\r?\n/);
  if (lines.length < 2) return { downloads: 0, paidUnits: 0, proceedsByCurrency: {}, byPlatform: {} };
  const headers = lines[0].split("\t").map(h => h.trim());
  const idxProductType = headers.indexOf("Product Type Identifier");
  const idxUnits = headers.indexOf("Units");
  const idxProceeds = headers.indexOf("Developer Proceeds");
  const idxProceedsCurrency = headers.indexOf("Currency of Proceeds");
  const idxDevice = headers.indexOf("Device");

  let downloads = 0;
  let paidUnits = 0;
  const proceedsByCurrency = {};
  const byPlatform = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split("\t");
    if (cols.length < headers.length) continue;
    const productType = (cols[idxProductType] || "").trim();
    const units = Number(cols[idxUnits] || 0);
    const unitProceeds = Number(cols[idxProceeds] || 0);
    const currency = (cols[idxProceedsCurrency] || "USD").trim() || "USD";
    const device = idxDevice >= 0 ? (cols[idxDevice] || "iOS").trim() || "iOS" : "iOS";

    const isUpdate = productType.startsWith("7");
    if (!isUpdate) {
      downloads += units;
      byPlatform[device] = (byPlatform[device] || 0) + units;
    }
    if (unitProceeds > 0) {
      paidUnits += units;
      proceedsByCurrency[currency] = Math.round(((proceedsByCurrency[currency] || 0) + units * unitProceeds) * 100) / 100;
    }
  }
  return { downloads, paidUnits, proceedsByCurrency, byPlatform };
}

export async function fetchAppleMetrics(env) {
  const issuerId = String(env.APPLE_ISSUER_ID || "").trim();
  const keyId = String(env.APPLE_KEY_ID || "").trim();
  const privateKey = String(env.APPLE_PRIVATE_KEY || "").trim();
  const vendorNumber = String(env.APPLE_VENDOR_NUMBER || "").trim();

  if (!issuerId || !keyId || !privateKey || !vendorNumber) {
    return {
      connected: false,
      provider: "Apple App Store Connect",
      setupHint: "Connect APPLE_ISSUER_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY (.p8), and APPLE_VENDOR_NUMBER in Connections.",
    };
  }

  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const token = await signJwtES256(
      {
        iss: issuerId,
        iat: nowSec,
        exp: nowSec + 900,
        aud: "appstoreconnect-v1",
      },
      privateKey,
      keyId,
    );

    const days = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    const dailyReports = await Promise.all(
      days.map(async daysAgo => {
        const reportDate = formatReportDate(daysAgo);
        const url = new URL("https://api.appstoreconnect.apple.com/v1/salesReports");
        url.searchParams.set("filter[frequency]", "DAILY");
        url.searchParams.set("filter[reportSubType]", "SUMMARY");
        url.searchParams.set("filter[reportType]", "SALES");
        url.searchParams.set("filter[vendorNumber]", vendorNumber);
        url.searchParams.set("filter[reportDate]", reportDate);

        const res = await fetch(url, {
          headers: {
            authorization: `Bearer ${token}`,
            accept: "application/a-gzip",
          },
        });
        if (res.status === 404) return { reportDate, downloads: 0, paidUnits: 0, proceedsByCurrency: {}, byPlatform: {} };
        if (!res.ok) throw new Error(`App Store Connect salesReports returned HTTP ${res.status}.`);
        const tsv = await gunzipText(res);
        return { reportDate, ...parseAppleSummaryTsv(tsv) };
      }),
    );

    let downloads7d = 0;
    let paidUnits7d = 0;
    const proceeds7d = {};
    const platforms = {};
    const recent7 = dailyReports.slice(-7);

    for (const r of recent7) {
      downloads7d += r.downloads;
      paidUnits7d += r.paidUnits;
      for (const [cur, val] of Object.entries(r.proceedsByCurrency)) {
        proceeds7d[cur] = Math.round(((proceeds7d[cur] || 0) + val) * 100) / 100;
      }
      for (const [dev, count] of Object.entries(r.byPlatform || {})) {
        platforms[dev] = (platforms[dev] || 0) + count;
      }
    }

    return {
      connected: true,
      provider: "Apple App Store Connect",
      vendorNumber,
      days7: {
        downloads: downloads7d,
        paidUnits: paidUnits7d,
        proceedsUsd: proceeds7d.USD || 0,
        proceedsByCurrency: proceeds7d,
      },
      dailySeries: dailyReports.map(r => ({
        date: r.reportDate,
        downloads: r.downloads,
        paidUnits: r.paidUnits,
        proceedsUsd: r.proceedsByCurrency.USD || 0,
      })),
      byPlatform: Object.entries(platforms).map(([device, units]) => ({ device, units })),
    };
  } catch (error) {
    return {
      connected: false,
      provider: "Apple App Store Connect",
      error: error instanceof Error ? error.message : "Failed to query App Store Connect API.",
    };
  }
}
