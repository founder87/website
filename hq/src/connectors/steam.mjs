// Steamworks Partner Financial API (IPartnerFinancialsService) connector.

function isoDateDaysAgo(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return d.toISOString().slice(0, 10).replace(/-/g, "/");
}

export async function fetchSteamMetrics(env) {
  const apiKey = String(env.STEAM_FINANCIAL_API_KEY || "").trim();
  if (!apiKey) {
    return {
      connected: false,
      provider: "Steamworks",
      setupHint: "Set STEAM_FINANCIAL_API_KEY once your Steamworks Financial Web API Group key is active.",
    };
  }

  try {
    const datesUrl = new URL("https://partner.steam-api.com/IPartnerFinancialsService/GetChangedDatesForPartner/v001/");
    datesUrl.searchParams.set("key", apiKey);
    datesUrl.searchParams.set("highwatermark", "0");

    const datesRes = await fetch(datesUrl);
    if (!datesRes.ok) {
      throw new Error(`Steamworks GetChangedDatesForPartner returned HTTP ${datesRes.status}.`);
    }
    const datesJson = await datesRes.json();
    const allDates = Array.isArray(datesJson?.response?.dates) ? datesJson.response.dates : [];
    const cutoff30 = isoDateDaysAgo(30);
    const cutoff7 = isoDateDaysAgo(7);
    const recentDates = allDates.filter(d => d >= cutoff30).slice(-31);

    let units30d = 0;
    let grossUsd30d = 0;
    let netUsd30d = 0;
    let returns30d = 0;
    let units7d = 0;
    let netUsd7d = 0;
    const byCountry = new Map();

    for (const date of recentDates) {
      let highwatermarkId = "0";
      for (let page = 0; page < 5; page++) {
        const salesUrl = new URL("https://partner.steam-api.com/IPartnerFinancialsService/GetDetailedSales/v001/");
        salesUrl.searchParams.set("key", apiKey);
        salesUrl.searchParams.set("date", date);
        salesUrl.searchParams.set("highwatermark_id", highwatermarkId);

        const salesRes = await fetch(salesUrl);
        if (!salesRes.ok) break;
        const salesJson = await salesRes.json();
        const results = salesJson?.response?.results || [];
        for (const row of results) {
          const netUnits = Number(row.net_units_sold || 0);
          const returnedUnits = Math.abs(Number(row.gross_units_returned || 0));
          const grossUsd = Number(row.gross_sales_usd || 0);
          const netUsd = Number(row.net_sales_usd || 0);
          const country = String(row.country_code || "UN");

          units30d += netUnits;
          returns30d += returnedUnits;
          grossUsd30d += grossUsd;
          netUsd30d += netUsd;
          if (date >= cutoff7) {
            units7d += netUnits;
            netUsd7d += netUsd;
          }
          byCountry.set(country, (byCountry.get(country) || 0) + netUsd);
        }
        const maxId = String(salesJson?.response?.max_id || "0");
        if (!results.length || maxId === highwatermarkId) break;
        highwatermarkId = maxId;
      }
    }

    const topCountries = [...byCountry.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, netUsd]) => ({ country, netUsd: Math.round(netUsd * 100) / 100 }));

    return {
      connected: true,
      provider: "Steamworks",
      days7: {
        netUnits: units7d,
        netUsd: Math.round(netUsd7d * 100) / 100,
      },
      days30: {
        netUnits: units30d,
        returns: returns30d,
        grossUsd: Math.round(grossUsd30d * 100) / 100,
        netUsd: Math.round(netUsd30d * 100) / 100,
      },
      topCountries,
    };
  } catch (error) {
    return {
      connected: false,
      provider: "Steamworks",
      error: error instanceof Error ? error.message : "Failed to query Steamworks Financial API.",
    };
  }
}
