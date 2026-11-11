// Solivant Studios HQ · Client Controller (Interactive SVG Charts, Gemini Email Prep, and Connections Vault).

export const HQ_JS = `(() => {
  const csrf = document.documentElement.dataset.csrf || "";
  const isLocalHost = document.documentElement.dataset.local === "true";

  async function api(path, options = {}) {
    const headers = Object.assign({ accept: "application/json" }, options.headers || {});
    if (options.body) {
      headers["content-type"] = "application/json";
      if (csrf) headers["x-csrf-token"] = csrf;
    }
    const res = await fetch(path, {
      method: options.method || (options.body ? "POST" : "GET"),
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ("Request failed (" + res.status + ")"));
    return data;
  }

  const authError = document.getElementById("auth-error");
  function showAuthError(msg) {
    if (!authError) return;
    authError.textContent = msg;
    authError.hidden = !msg;
  }

  // --- First-Time Browser Setup (127.0.0.1 Only) ---
  const setupStep1 = document.getElementById("setup-step1-form");
  const setupStep2 = document.getElementById("setup-step2-form");
  let pendingSetupToken = "";

  if (setupStep1 && setupStep2) {
    setupStep1.addEventListener("submit", async event => {
      event.preventDefault();
      showAuthError("");
      const email = setupStep1.elements.email.value.trim();
      const password = setupStep1.elements.password.value;
      const confirm = setupStep1.elements.confirm.value;
      if (password.length < 12) {
        showAuthError("Please choose a password with at least 12 characters.");
        return;
      }
      if (password !== confirm) {
        showAuthError("Passwords do not match.");
        return;
      }
      const btn = setupStep1.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const res = await api("/api/local-setup/init", { body: { email, password } });
        pendingSetupToken = res.setupToken;
        document.getElementById("apple-passwords-link").href = res.otpauthUri;
        document.getElementById("setup-key-display").textContent = res.formattedSecret;
        setupStep1.hidden = true;
        setupStep2.hidden = false;
        setupStep2.elements.code.focus();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        btn.disabled = false;
      }
    });

    const copyKeyBtn = document.getElementById("copy-setup-key");
    if (copyKeyBtn) {
      copyKeyBtn.addEventListener("click", async () => {
        const raw = (document.getElementById("setup-key-display").textContent || "").replace(/\\s+/g, "");
        await navigator.clipboard.writeText(raw).catch(() => {});
        copyKeyBtn.textContent = "Copied!";
        setTimeout(() => { copyKeyBtn.textContent = "Copy Key for Authenticator App"; }, 2000);
      });
    }

    setupStep2.addEventListener("submit", async event => {
      event.preventDefault();
      showAuthError("");
      const btn = setupStep2.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const code = setupStep2.elements.code.value.trim();
        await api("/api/local-setup/complete", { body: { setupToken: pendingSetupToken, code } });
        window.location.reload();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  // --- Standard Login + 2FA Flow ---
  const loginForm = document.getElementById("login-form");
  const totpForm = document.getElementById("totp-form");
  let preAuthToken = "";

  if (loginForm) {
    loginForm.addEventListener("submit", async event => {
      event.preventDefault();
      showAuthError("");
      const btn = loginForm.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const email = loginForm.elements.email.value.trim();
        const password = loginForm.elements.password.value;
        const result = await api("/api/auth/login", { body: { email, password } });
        preAuthToken = result.preAuthToken;
        loginForm.hidden = true;
        totpForm.hidden = false;
        totpForm.elements.code.focus();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  if (totpForm) {
    totpForm.addEventListener("submit", async event => {
      event.preventDefault();
      showAuthError("");
      const btn = totpForm.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const code = totpForm.elements.code.value.trim();
        await api("/api/auth/verify-2fa", { body: { preAuthToken, code } });
        window.location.reload();
      } catch (err) {
        showAuthError(err.message);
      } finally {
        btn.disabled = false;
      }
    });
    const backBtn = document.getElementById("back-to-login");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        preAuthToken = "";
        totpForm.hidden = true;
        loginForm.hidden = false;
        showAuthError("");
      });
    }
  }

  // =========================================================================
  // Authenticated Command Deck
  // =========================================================================
  const dashboardRoot = document.getElementById("hq-dashboard");
  if (!dashboardRoot) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const fmtInt = n => Number(n || 0).toLocaleString("en-US");
  const fmtUsd = n => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtCompactUsd = n => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });

  // Deterministic preview simulation dataset so charts, visual modes, and email prep are explorable before launch keys are added
  function buildSimulatedSnapshot() {
    const today = Date.now();
    const gaSeries = [];
    const steamSeries = [];
    const appleSeries = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today - i * 86400000).toISOString().slice(0, 10);
      const wave = Math.sin((29 - i) * 0.34) * 0.25 + 1;
      const spike = (i === 9 || i === 8 || i === 2) ? 1.55 : 1;
      const sessions = Math.round((410 + (29 - i) * 19) * wave * spike);
      const views = Math.round(sessions * 2.35);
      const visitors = Math.round(sessions * 0.78);
      gaSeries.push({ date: d, sessions, pageViews: views, visitors });

      const units = Math.round((34 + (29 - i) * 2.1) * wave * spike);
      const gross = Math.round(units * 24.99 * 100) / 100;
      const net = Math.round(gross * 0.7 * 100) / 100;
      steamSeries.push({ date: d, netUnits: units, grossUsd: gross, netUsd: net });

      const dl = Math.round((52 + (29 - i) * 2.6) * wave * (i === 5 ? 1.45 : 1));
      const paid = Math.round(dl * 0.62);
      const proc = Math.round(paid * 6.99 * 100) / 100;
      appleSeries.push({ date: d, downloads: dl, paidUnits: paid, proceedsUsd: proc });
    }

    const sum = (arr, k) => arr.reduce((acc, r) => acc + (r[k] || 0), 0);
    const last7Ga = gaSeries.slice(-7);
    const last7Steam = steamSeries.slice(-7);
    const last7Apple = appleSeries.slice(-7);

    return {
      simulated: true,
      generatedAt: new Date().toISOString(),
      ga4: {
        connected: true,
        simulated: true,
        provider: "Google Analytics 4 (Preview)",
        activeNow: 38,
        days7: { visitors: sum(last7Ga, "visitors"), sessions: sum(last7Ga, "sessions"), pageViews: sum(last7Ga, "pageViews") },
        days30: { visitors: sum(gaSeries, "visitors"), sessions: sum(gaSeries, "sessions"), pageViews: sum(gaSeries, "pageViews") },
        dailySeries: gaSeries,
        topPages: [
          { path: "/", views: 24890, visitors: 15120 },
          { path: "/projects/byzantium/", views: 19420, visitors: 12840 },
          { path: "/contact/", views: 3180, visitors: 2490 },
          { path: "/support/", views: 1290, visitors: 980 },
        ],
        topSources: [
          { source: "store.steampowered.com", sessions: 8940 },
          { source: "(direct)", sessions: 6410 },
          { source: "youtube.com", sessions: 4820 },
          { source: "reddit.com", sessions: 3190 },
          { source: "x.com", sessions: 2150 },
        ],
        events: [
          { event: "spotlight_byzantium", count: 7840 },
          { event: "outbound_click", count: 4210 },
          { event: "contact_email_click", count: 312 },
          { event: "social_youtube", count: 1490 },
          { event: "social_discord", count: 1180 },
        ],
      },
      steam: {
        connected: true,
        simulated: true,
        provider: "Steamworks (Preview)",
        days7: { netUnits: sum(last7Steam, "netUnits"), netUsd: Math.round(sum(last7Steam, "netUsd") * 100) / 100 },
        days30: {
          netUnits: sum(steamSeries, "netUnits"),
          returns: 94,
          grossUsd: Math.round(sum(steamSeries, "grossUsd") * 100) / 100,
          netUsd: Math.round(sum(steamSeries, "netUsd") * 100) / 100,
        },
        dailySeries: steamSeries,
        topCountries: [
          { country: "US", netUsd: 16420.5 },
          { country: "DE", netUsd: 6180.0 },
          { country: "GB", netUsd: 4890.25 },
          { country: "FR", netUsd: 3410.8 },
          { country: "GR", netUsd: 2790.4 },
        ],
      },
      apple: {
        connected: true,
        simulated: true,
        provider: "App Store Connect (Preview)",
        days7: {
          downloads: sum(last7Apple, "downloads"),
          paidUnits: sum(last7Apple, "paidUnits"),
          proceedsUsd: Math.round(sum(last7Apple, "proceedsUsd") * 100) / 100,
        },
        dailySeries: appleSeries,
        byPlatform: [
          { device: "iPad", units: 1480 },
          { device: "Mac", units: 1120 },
          { device: "iPhone", units: 890 },
        ],
      },
      inbox: {
        connected: true,
        simulated: true,
        inboxAddress: "contact@solivantstudios.com",
        unreadCount: 3,
        totalInbox: 18,
        messages: [
          {
            id: "sim-press-1",
            simulated: true,
            unread: true,
            from: "Elena Vance <elena@pcstrategyweekly.example>",
            subject: "Byzantium feature inquiry - custom engine & siege physics",
            date: "Today, 09:14",
            snippet: "We caught wind of Byzantium and your custom engine work set around 1000 AD Constantinople. Would love to request a press kit...",
            body: "Hi Solivant Studios team,\\n\\nWe recently saw your Byzantium page and were immediately intrigued by a circa 1000 AD Eastern Roman frontier strategy title built on custom engine technology.\\n\\nAre you sharing a press kit or early screenshots yet, and can we get on your press list for the first gameplay reveal?\\n\\nBest,\\nElena Vance\\nSenior Editor, PC Strategy Weekly",
            category: "PRESS",
            priority: "HIGH",
            gist: "Senior editor at PC Strategy Weekly requesting press-list signup and asking if a Byzantium press kit or screenshots are ready.",
            draft: "Hi Elena,\\n\\nThank you for reaching out and for your interest in Byzantium. We have added you to our priority press list so you will receive our full press kit, first in-engine screenshots, and gameplay reveal details as soon as our preview window opens.\\n\\nBest regards,\\nSolivant Studios",
          },
          {
            id: "sim-part-2",
            simulated: true,
            unread: true,
            from: "Marcus Hale <m.hale@historicalshowcase.example>",
            subject: "Invitation: Autumn Strategy & Historical Games Showcase",
            date: "Today, 07:48",
            snippet: "Reaching out to invite Solivant Studios to submit a 60-second trailer slot for Byzantium in our upcoming showcase...",
            body: "Hello Solivant Studios,\\n\\nWe are curating our upcoming Historical & Grand Strategy Showcase on Steam and YouTube (featuring an official Steam event page). Given Byzantium's 1000 AD Constantinople setting, we would love to discuss a no-fee 60-second reveal or teaser slot if your timeline aligns.\\n\\nWarmly,\\nMarcus Hale",
            category: "PARTNERSHIP",
            priority: "HIGH",
            gist: "No-fee invitation to feature a 60-second Byzantium teaser in an upcoming Steam + YouTube Historical Strategy Showcase.",
            draft: "Hello Marcus,\\n\\nThank you for the invitation and for thinking of Byzantium for the showcase. Could you share the submission deadline and Steam event dates so we can align them against our current milestone schedule?\\n\\nBest regards,\\nSolivant Studios",
          },
          {
            id: "sim-sup-3",
            simulated: true,
            unread: true,
            from: "Nikos Papadopoulos <nikos.p@example.org>",
            subject: "Mac Apple Silicon & ultrawide question for Byzantium",
            date: "Yesterday",
            snippet: "Huge Byzantine history enthusiast here! Saw that your custom engine targets broad device reach. Will macOS Apple Silicon be...",
            body: "Greetings!\\n\\nAs someone who has waited years for a serious game set during the reign of Basil II around the year 1000, seeing Byzantium made my week. Will you share platform and Mac support details soon, and where can I follow updates?\\n\\nCheers,\\nNikos",
            category: "COMMUNITY",
            priority: "NORMAL",
            gist: "Enthusiastic Byzantine history fan asking when official platform support details and community channels will be announced.",
            draft: "Hello Nikos,\\n\\nThank you for the kind note. Broad device reach is a core pillar of our custom engine work on Byzantium, and we will share official platform specifications and community channels on solivantstudios.com as we approach our first preview.\\n\\nBest regards,\\nSolivant Studios",
          },
          {
            id: "sim-gen-4",
            simulated: true,
            unread: false,
            from: "claire.dubois@soundfoundry.example",
            subject: "Byzantine choral & acoustic instrumentation reel",
            date: "Nov 8",
            snippet: "Sharing our acoustic medieval strings and Byzantine liturgical vocal ensemble portfolio in case you collaborate externally...",
            body: "Dear Solivant Studios,\\n\\nSharing a brief portfolio of period-authentic Eastern Mediterranean acoustic recordings in case external audio collaboration is ever helpful for Byzantium.\\n\\nAll the best,\\nClaire",
            category: "GENERAL",
            priority: "LOW",
            gist: "External audio studio sharing a period-authentic Byzantine acoustic portfolio for future reference.",
            draft: "Hello Claire,\\n\\nThank you for sharing your ensemble's portfolio. We are keeping your work on file as development progresses and will reach out if an external audio need arises.\\n\\nBest regards,\\nSolivant Studios",
          },
        ],
      },
    };
  }

  const SIMULATED_BRIEF = [
    { label: "Pulse", body: "Website sessions climbed +24% over the past 7 days, with /projects/byzantium/ capturing 78% of spotlight click-throughs." },
    { label: "Revenue", body: "Preview simulation shows Steamworks leading 30d net revenue while iPad + Mac drive strong App Store proceeds." },
    { label: "Inbox", body: "3 unread priority threads prepped: PC Strategy Weekly press request, Steam Historical Showcase invite, and a community platform question." },
    { label: "Next Move", body: "Review the two HIGH-priority prepped replies (Elena Vance & Marcus Hale) in the Inbox Workbench below." },
  ];

  let liveData = null;
  let simMode = false;
  let userChoseMode = false;
  let selectedMetric = "combined"; // combined | traffic | steam | apple | inbox
  let selectedRange = 30;          // 7 | 14 | 30
  let selectedChartType = "area";  // area | bars | compare
  let selectedTone = "warm";
  let inboxFilter = "all";         // all | unread | prepped
  let activeMessageId = "";
  const preppedCache = new Map();  // messageId -> { category, priority, gist, draft }

  function activeSnapshot() {
    if (simMode || !liveData) return buildSimulatedSnapshot();
    return liveData;
  }

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  // --- Mini KPI Sparkline Renderer ---
  function renderSparkline(svg, values, strokeColor) {
    if (!svg) return;
    svg.textContent = "";
    const pts = values && values.length > 1 ? values : [0, 0, 0, 0, 0, 0, 0];
    const w = 160;
    const h = 26;
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const span = max - min || 1;
    const coords = pts.map((v, idx) => {
      const x = (idx / (pts.length - 1)) * w;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return [x, y];
    });
    const dLine = coords.map((c, i) => (i === 0 ? "M" : "L") + c[0].toFixed(1) + "," + c[1].toFixed(1)).join(" ");
    const dArea = dLine + \` L\${w},\${h} L0,\${h} Z\`;
    svg.setAttribute("viewBox", \`0 0 \${w} \${h}\`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.appendChild(svgEl("path", { d: dArea, fill: strokeColor, "fill-opacity": "0.14" }));
    svg.appendChild(svgEl("path", { d: dLine, fill: "none", stroke: strokeColor, "stroke-width": "1.6" }));
  }

  // --- Main Interactive Visual Telemetry Stage ---
  function getStageConfig(snap) {
    const { ga4, steam, apple, inbox } = snap;
    const gaDays = (ga4.dailySeries || []).slice(-selectedRange);
    const steamDays = (steam.dailySeries || []).slice(-selectedRange);
    const appleDays = (apple.dailySeries || []).slice(-selectedRange);

    if (selectedMetric === "traffic") {
      return {
        eyebrow: "Website & Byzantium Funnel · GA4",
        title: "Sessions & Page Views",
        color: "#d8a650",
        secondaryColor: "#7db4de",
        primaryLabel: "Sessions",
        secondaryLabel: "Page Views",
        formatPrimary: fmtInt,
        formatSecondary: fmtInt,
        points: gaDays.map(d => ({ date: d.date, primary: d.sessions, secondary: d.pageViews })),
        donutTitle: "Traffic Sources (30d)",
        slices: (ga4.topSources || []).map(s => ({ label: s.source, value: s.sessions, display: fmtInt(s.sessions) })),
        barsTitle: "Top Pages & Funnel Clicks",
        bars: [
          ...(ga4.topPages || []).slice(0, 4).map(p => ({ label: p.path, value: p.views, display: fmtInt(p.views) + " views" })),
          ...(ga4.events || []).slice(0, 3).map(e => ({ label: "✦ " + e.event, value: e.count, display: fmtInt(e.count) + " clicks" })),
        ],
      };
    }

    if (selectedMetric === "steam") {
      return {
        eyebrow: "Steamworks Financial Telemetry",
        title: "Daily Net Revenue & Units",
        color: "#7db4de",
        secondaryColor: "#d8a650",
        primaryLabel: "Net Revenue (USD)",
        secondaryLabel: "Net Units",
        formatPrimary: fmtUsd,
        formatSecondary: v => fmtInt(v) + " units",
        points: steamDays.map(d => ({ date: d.date, primary: d.netUsd, secondary: d.netUnits })),
        donutTitle: "Top Territories (Net USD)",
        slices: (steam.topCountries || []).map(c => ({ label: c.country, value: c.netUsd, display: fmtCompactUsd(c.netUsd) })),
        barsTitle: "Regional Net Revenue",
        bars: (steam.topCountries || []).map(c => ({ label: "Region · " + c.country, value: c.netUsd, display: fmtUsd(c.netUsd) })),
      };
    }

    if (selectedMetric === "apple") {
      return {
        eyebrow: "Apple App Store Connect · iOS, iPadOS & macOS",
        title: "Developer Proceeds & Downloads",
        color: "#52c48a",
        secondaryColor: "#d8a650",
        primaryLabel: "Proceeds (USD)",
        secondaryLabel: "Downloads",
        formatPrimary: fmtUsd,
        formatSecondary: v => fmtInt(v) + " dl",
        points: appleDays.map(d => ({ date: d.date, primary: d.proceedsUsd, secondary: d.downloads })),
        donutTitle: "Apple Platform Mix",
        slices: (apple.byPlatform || []).map(p => ({ label: p.device, value: p.units, display: fmtInt(p.units) + " units" })),
        barsTitle: "Downloads by Apple Device",
        bars: (apple.byPlatform || []).map(p => ({ label: p.device, value: p.units, display: fmtInt(p.units) + " downloads" })),
      };
    }

    if (selectedMetric === "inbox") {
      const msgs = inbox.messages || [];
      const counts = { PRESS: 0, PARTNERSHIP: 0, SUPPORT: 0, COMMUNITY: 0, GENERAL: 0 };
      for (const m of msgs) {
        const prep = preppedCache.get(m.id) || m;
        const cat = (prep.category || "GENERAL").toUpperCase();
        counts[cat] = (counts[cat] || 0) + 1;
      }
      const catRows = Object.entries(counts).filter(([, c]) => c > 0).map(([k, c]) => ({ label: k, value: c, display: c + " threads" }));
      return {
        eyebrow: "Google Workspace · contact@solivantstudios.com",
        title: "Studio Inquiry & Traffic Correlation",
        color: "#e08e68",
        secondaryColor: "#d8a650",
        primaryLabel: "Website Sessions",
        secondaryLabel: "Byzantium Views",
        formatPrimary: fmtInt,
        formatSecondary: fmtInt,
        points: gaDays.map(d => ({ date: d.date, primary: d.sessions, secondary: Math.round(d.pageViews * 0.42) })),
        donutTitle: "Inbox Triage Mix",
        slices: catRows,
        barsTitle: "Threads by Gemini Category",
        bars: catRows,
      };
    }

    // Default: Combined Multi-Channel View
    const len = Math.max(gaDays.length, steamDays.length, appleDays.length);
    const combinedPts = [];
    for (let i = 0; i < len; i++) {
      const g = gaDays[i] || { date: "", sessions: 0 };
      const s = steamDays[i] || { date: "", netUsd: 0 };
      const a = appleDays[i] || { date: "", proceedsUsd: 0 };
      combinedPts.push({
        date: g.date || s.date || a.date,
        primary: Math.round(((s.netUsd || 0) + (a.proceedsUsd || 0)) * 100) / 100,
        secondary: g.sessions || 0,
        steamUsd: s.netUsd || 0,
        appleUsd: a.proceedsUsd || 0,
        sessions: g.sessions || 0,
      });
    }
    const steam30 = steam.connected ? (steam.days30?.netUsd || 0) : 0;
    const apple7 = apple.connected ? (apple.days7?.proceedsUsd || 0) : 0;
    return {
      eyebrow: "Unified Studio Command Telemetry",
      title: "Combined Net Revenue & Website Funnel",
      color: "#d8a650",
      secondaryColor: "#52c48a",
      primaryLabel: "Combined Net USD",
      secondaryLabel: "Website Sessions",
      formatPrimary: fmtUsd,
      formatSecondary: v => fmtInt(v) + " sessions",
      points: combinedPts,
      donutTitle: "Revenue & Channel Split",
      slices: [
        { label: "Steamworks (30d)", value: steam30, display: fmtCompactUsd(steam30) },
        { label: "App Store (7d)", value: apple7, display: fmtCompactUsd(apple7) },
      ],
      barsTitle: "Byzantium Funnel & Channels",
      bars: [
        ...(ga4.topPages || []).slice(0, 2).map(p => ({ label: "Page · " + p.path, value: p.views, display: fmtInt(p.views) + " views" })),
        ...(steam.topCountries || []).slice(0, 2).map(c => ({ label: "Steam · " + c.country, value: c.netUsd, display: fmtCompactUsd(c.netUsd) })),
        ...(apple.byPlatform || []).slice(0, 2).map(d => ({ label: "Apple · " + d.device, value: d.units, display: fmtInt(d.units) + " dl" })),
      ],
    };
  }

  function renderMainStage() {
    const snap = activeSnapshot();
    const cfg = getStageConfig(snap);

    for (const c of document.querySelectorAll(".kpi-card[data-metric]")) {
      c.dataset.selected = String(c.dataset.metric === selectedMetric);
    }
    for (const b of document.querySelectorAll(".seg-btn[data-pull-visual]")) {
      b.setAttribute("aria-pressed", String(b.dataset.pullVisual === selectedMetric));
    }
    for (const b of document.querySelectorAll(".seg-btn[data-range]")) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.range) === selectedRange));
    }
    for (const b of document.querySelectorAll(".seg-btn[data-chart-type]")) {
      b.setAttribute("aria-pressed", String(b.dataset.chartType === selectedChartType));
    }

    document.getElementById("stage-eyebrow").textContent = cfg.eyebrow;
    document.getElementById("stage-title").textContent = cfg.title;

    const svg = document.getElementById("stage-svg");
    const readoutLeft = document.getElementById("readout-date");
    const readoutRight = document.getElementById("readout-values");
    const legend = document.getElementById("chart-legend");
    svg.textContent = "";
    legend.textContent = "";

    const pts = cfg.points.length ? cfg.points : [{ date: "No data yet", primary: 0, secondary: 0 }];
    const W = 860;
    const H = 250;
    const padL = 52;
    const padR = 16;
    const padT = 16;
    const padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Defs for vertical area glow
    const defs = svgEl("defs");
    const grad = svgEl("linearGradient", { id: "stageAreaGrad", x1: "0", y1: "0", x2: "0", y2: "1" });
    grad.appendChild(svgEl("stop", { offset: "0%", "stop-color": cfg.color, "stop-opacity": "0.34" }));
    grad.appendChild(svgEl("stop", { offset: "100%", "stop-color": cfg.color, "stop-opacity": "0.0" }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    const maxP = Math.max(...pts.map(p => p.primary), 1);
    const maxS = Math.max(...pts.map(p => p.secondary), 1);

    // Horizontal reference gridlines + Y labels
    for (let g = 0; g <= 4; g++) {
      const ratio = g / 4;
      const y = padT + plotH - ratio * plotH;
      svg.appendChild(svgEl("line", {
        x1: padL, y1: y, x2: W - padR, y2: y,
        stroke: "#ffffff", "stroke-opacity": g === 0 ? "0.16" : "0.06", "stroke-width": "1",
      }));
      const val = maxP * ratio;
      const lbl = svgEl("text", {
        x: padL - 8, y: y + 4,
        fill: "#8f867a", "font-size": "10", "font-family": "monospace", "text-anchor": "end",
      });
      lbl.textContent = val >= 1000 ? (Math.round(val / 100) / 10) + "k" : Math.round(val);
      svg.appendChild(lbl);
    }

    const xAt = idx => padL + (pts.length === 1 ? plotW / 2 : (idx / (pts.length - 1)) * plotW);
    const yPrimary = v => padT + plotH - (v / maxP) * plotH;
    const ySecondary = v => padT + plotH - (v / maxS) * plotH;

    // X-axis date ticks
    const tickStep = Math.max(1, Math.floor(pts.length / 5));
    for (let i = 0; i < pts.length; i += tickStep) {
      const tx = xAt(i);
      const t = svgEl("text", {
        x: tx, y: H - 8,
        fill: "#8f867a", "font-size": "10", "font-family": "monospace", "text-anchor": "middle",
      });
      t.textContent = String(pts[i].date || "").slice(5);
      svg.appendChild(t);
    }

    if (selectedChartType === "bars") {
      const barW = Math.max(4, Math.min(22, (plotW / pts.length) * 0.62));
      pts.forEach((p, idx) => {
        const cx = xAt(idx);
        const topY = yPrimary(p.primary);
        const h = Math.max(2, padT + plotH - topY);
        svg.appendChild(svgEl("rect", {
          x: cx - barW / 2, y: topY, width: barW, height: h,
          fill: cfg.color, "fill-opacity": "0.82",
        }));
      });
    } else if (selectedChartType === "compare") {
      const d1 = pts.map((p, i) => (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + "," + yPrimary(p.primary).toFixed(1)).join(" ");
      const d2 = pts.map((p, i) => (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + "," + ySecondary(p.secondary).toFixed(1)).join(" ");
      svg.appendChild(svgEl("path", { d: d2, fill: "none", stroke: cfg.secondaryColor, "stroke-width": "1.8", "stroke-dasharray": "4 3" }));
      svg.appendChild(svgEl("path", { d: d1, fill: "none", stroke: cfg.color, "stroke-width": "2.4" }));
    } else {
      // Smooth Area Curve
      const dLine = pts.map((p, i) => (i === 0 ? "M" : "L") + xAt(i).toFixed(1) + "," + yPrimary(p.primary).toFixed(1)).join(" ");
      const dArea = dLine + \` L\${xAt(pts.length - 1).toFixed(1)},\${padT + plotH} L\${xAt(0).toFixed(1)},\${padT + plotH} Z\`;
      svg.appendChild(svgEl("path", { d: dArea, fill: "url(#stageAreaGrad)" }));
      svg.appendChild(svgEl("path", { d: dLine, fill: "none", stroke: cfg.color, "stroke-width": "2.4" }));
      pts.forEach((p, i) => {
        if (pts.length <= 16 || i === pts.length - 1 || i % 3 === 0) {
          svg.appendChild(svgEl("circle", {
            cx: xAt(i), cy: yPrimary(p.primary), r: "3",
            fill: "#090807", stroke: cfg.color, "stroke-width": "1.8",
          }));
        }
      });
    }

    // Interactive Hover Crosshair
    const hoverLine = svgEl("line", {
      x1: 0, y1: padT, x2: 0, y2: padT + plotH,
      stroke: "#ecc374", "stroke-width": "1", "stroke-dasharray": "3 3", opacity: "0",
    });
    const hoverDot = svgEl("circle", {
      cx: 0, cy: 0, r: "5",
      fill: "#ecc374", stroke: "#090807", "stroke-width": "2", opacity: "0",
    });
    svg.append(hoverLine, hoverDot);

    function showPoint(idx) {
      const p = pts[idx];
      if (!p) return;
      readoutLeft.textContent = p.date || "Latest";
      readoutRight.textContent = cfg.primaryLabel + ": " + cfg.formatPrimary(p.primary) + "  ·  " + cfg.secondaryLabel + ": " + cfg.formatSecondary(p.secondary);
    }
    showPoint(pts.length - 1);

    svg.onmousemove = evt => {
      const rect = svg.getBoundingClientRect();
      const relX = ((evt.clientX - rect.left) / rect.width) * W;
      const clamped = Math.max(padL, Math.min(W - padR, relX));
      const idx = pts.length === 1 ? 0 : Math.round(((clamped - padL) / plotW) * (pts.length - 1));
      const cx = xAt(idx);
      const cy = yPrimary(pts[idx].primary);
      hoverLine.setAttribute("x1", cx);
      hoverLine.setAttribute("x2", cx);
      hoverLine.setAttribute("opacity", "0.85");
      hoverDot.setAttribute("cx", cx);
      hoverDot.setAttribute("cy", cy);
      hoverDot.setAttribute("opacity", "1");
      showPoint(idx);
    };
    svg.onmouseleave = () => {
      hoverLine.setAttribute("opacity", "0");
      hoverDot.setAttribute("opacity", "0");
      showPoint(pts.length - 1);
    };

    // Legend
    const addLegend = (label, swatchClass) => {
      const span = document.createElement("span");
      span.className = "legend-item";
      const sw = document.createElement("span");
      sw.className = "legend-swatch " + swatchClass;
      const txt = document.createElement("span");
      txt.textContent = label;
      span.append(sw, txt);
      legend.appendChild(span);
    };
    addLegend(cfg.primaryLabel, selectedMetric === "steam" ? "swatch--slate" : selectedMetric === "apple" ? "swatch--emerald" : "swatch--gold");
    if (selectedChartType === "compare") {
      addLegend(cfg.secondaryLabel, selectedMetric === "combined" ? "swatch--emerald" : "swatch--slate");
    }

    // Render Right-Side Donut + SVG Proportional Bars
    document.getElementById("donut-title").textContent = cfg.donutTitle;
    document.getElementById("bars-title").textContent = cfg.barsTitle;
    renderDonut(cfg.slices);
    renderProportionalBars(cfg.bars);
  }

  function renderDonut(slices) {
    const svg = document.getElementById("donut-svg");
    const meta = document.getElementById("donut-meta");
    svg.textContent = "";
    meta.textContent = "";
    const palette = ["#d8a650", "#7db4de", "#52c48a", "#e08e68", "#a688d4"];
    const valid = (slices || []).filter(s => s.value > 0);
    const total = valid.reduce((a, s) => a + s.value, 0);

    svg.appendChild(svgEl("circle", { cx: "56", cy: "56", r: "42", fill: "none", stroke: "#241e18", "stroke-width": "12" }));

    if (!total) {
      const empty = document.createElement("p");
      empty.className = "small muted";
      empty.textContent = "Connect data or switch to Simulation Preview to inspect distribution.";
      meta.appendChild(empty);
      return;
    }

    const circumference = 2 * Math.PI * 42;
    let offset = 0;
    valid.slice(0, 5).forEach((s, idx) => {
      const frac = s.value / total;
      const len = frac * circumference;
      const circle = svgEl("circle", {
        cx: "56", cy: "56", r: "42",
        fill: "none",
        stroke: palette[idx % palette.length],
        "stroke-width": "12",
        "stroke-dasharray": \`\${Math.max(1, len - 2)} \${circumference}\`,
        "stroke-dashoffset": String(-offset),
        transform: "rotate(-90 56 56)",
      });
      svg.appendChild(circle);
      offset += len;

      const row = document.createElement("div");
      row.className = "bar-item__top small";
      const left = document.createElement("span");
      left.textContent = s.label + " (" + Math.round(frac * 100) + "%)";
      const right = document.createElement("span");
      right.className = "mono";
      right.textContent = s.display;
      row.append(left, right);
      meta.appendChild(row);
    });
  }

  function renderProportionalBars(bars) {
    const ul = document.getElementById("breakdown-bars");
    ul.textContent = "";
    const items = (bars || []).slice(0, 6);
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "small muted";
      li.textContent = "No breakdown rows available.";
      ul.appendChild(li);
      return;
    }
    const maxVal = Math.max(...items.map(b => b.value), 1);
    const colors = ["#d8a650", "#7db4de", "#52c48a", "#e08e68", "#d8a650", "#7db4de"];
    items.forEach((b, idx) => {
      const li = document.createElement("li");
      li.className = "bar-item";
      const top = document.createElement("div");
      top.className = "bar-item__top";
      const lbl = document.createElement("span");
      lbl.textContent = b.label;
      const val = document.createElement("span");
      val.className = "mono";
      val.textContent = b.display;
      top.append(lbl, val);

      // CSP-clean SVG progress bar (no inline style attribute needed)
      const barSvg = svgEl("svg", { viewBox: "0 0 100 4", preserveAspectRatio: "none", width: "100%", height: "5" });
      barSvg.appendChild(svgEl("rect", { x: "0", y: "0", width: "100", height: "4", fill: "#1d1814" }));
      const pct = Math.max(3, Math.round((b.value / maxVal) * 100));
      barSvg.appendChild(svgEl("rect", { x: "0", y: "0", width: String(pct), height: "4", fill: colors[idx % colors.length] }));

      li.append(top, barSvg);
      ul.appendChild(li);
    });
  }

  // --- Render KPIs, Channels, and Inbox ---
  function setBadge(el, mode, text) {
    if (!el) return;
    el.textContent = text;
    el.className = "badge badge--" + mode;
  }

  function renderList(ul, items, renderRow, emptyText) {
    ul.textContent = "";
    if (!items || !items.length) {
      const li = document.createElement("li");
      li.className = "muted small";
      li.textContent = emptyText;
      ul.appendChild(li);
      return;
    }
    for (const item of items) {
      const li = document.createElement("li");
      const [left, right] = renderRow(item);
      const spanL = document.createElement("span");
      spanL.textContent = left;
      const spanR = document.createElement("span");
      spanR.className = "mono";
      spanR.textContent = right;
      li.append(spanL, spanR);
      ul.appendChild(li);
    }
  }

  function renderAllFromSnapshot() {
    const snap = activeSnapshot();
    const { ga4, steam, apple, inbox } = snap;
    const badgeMode = snap.simulated ? "sim" : "live";

    document.getElementById("brand-dot").dataset.sim = String(Boolean(snap.simulated));
    document.getElementById("mode-live").setAttribute("aria-pressed", String(!simMode));
    document.getElementById("mode-sim").setAttribute("aria-pressed", String(simMode));

    // KPIs + Sparklines
    document.getElementById("kpi-active").textContent = ga4.connected ? fmtInt(ga4.activeNow) : "Standby";
    document.getElementById("kpi-active-sub").textContent = snap.simulated ? "Preview simulation" : "solivantstudios.com live";
    renderSparkline(document.getElementById("spark-active"), (ga4.dailySeries || []).slice(-10).map(d => d.visitors), "#52c48a");

    document.getElementById("kpi-sessions").textContent = ga4.connected ? fmtInt(ga4.days30.sessions) : "Standby";
    document.getElementById("kpi-sessions-sub").textContent = ga4.connected
      ? fmtInt(ga4.days7.sessions) + " (7d) · " + fmtInt(ga4.days30.pageViews) + " views"
      : "Click Connections to link GA4";
    renderSparkline(document.getElementById("spark-sessions"), (ga4.dailySeries || []).slice(-14).map(d => d.sessions), "#d8a650");

    document.getElementById("kpi-steam").textContent = steam.connected ? fmtCompactUsd(steam.days30.netUsd) : "Standby";
    document.getElementById("kpi-steam-sub").textContent = steam.connected
      ? fmtInt(steam.days30.netUnits) + " net units (30d)"
      : "Awaiting Steamworks key";
    renderSparkline(document.getElementById("spark-steam"), (steam.dailySeries || []).slice(-14).map(d => d.netUsd), "#7db4de");

    document.getElementById("kpi-apple").textContent = apple.connected ? fmtCompactUsd(apple.days7.proceedsUsd) : "Standby";
    document.getElementById("kpi-apple-sub").textContent = apple.connected
      ? fmtInt(apple.days7.downloads) + " downloads (7d)"
      : "Awaiting App Store .p8";
    renderSparkline(document.getElementById("spark-apple"), (apple.dailySeries || []).slice(-14).map(d => d.proceedsUsd), "#52c48a");

    document.getElementById("kpi-inbox").textContent = inbox.connected ? fmtInt(inbox.unreadCount) + " Unread" : "Standby";
    document.getElementById("kpi-inbox-sub").textContent = inbox.connected
      ? inbox.inboxAddress + " (" + fmtInt(inbox.totalInbox) + " total)"
      : "Awaiting Gmail OAuth";
    renderSparkline(document.getElementById("spark-inbox"), [2, 4, 3, 5, 2, 6, 4, 3], "#e08e68");

    // Channel Summary Cards
    setBadge(document.getElementById("ga4-badge"), ga4.connected ? badgeMode : "standby", ga4.connected ? (snap.simulated ? "Preview" : "Live") : "Standby");
    renderList(
      document.getElementById("ga4-pages"),
      (ga4.topPages || []).slice(0, 4),
      p => [p.path, fmtInt(p.views) + " views"],
      ga4.setupHint || "Connect GA4 to view top pages.",
    );

    setBadge(document.getElementById("steam-badge"), steam.connected ? badgeMode : "standby", steam.connected ? (snap.simulated ? "Preview" : "Live") : "Standby");
    renderList(
      document.getElementById("steam-list"),
      steam.connected
        ? [
            { l: "7-Day Net Revenue", v: fmtUsd(steam.days7.netUsd) + " (" + fmtInt(steam.days7.netUnits) + "u)" },
            { l: "30-Day Gross Sales", v: fmtUsd(steam.days30.grossUsd) },
            { l: "30-Day Net Revenue", v: fmtUsd(steam.days30.netUsd) },
            { l: "30-Day Returns", v: fmtInt(steam.days30.returns) + " units" },
          ]
        : [],
      r => [r.l, r.v],
      steam.setupHint || "Connect Steamworks key when sales go live.",
    );

    setBadge(document.getElementById("apple-badge"), apple.connected ? badgeMode : "standby", apple.connected ? (snap.simulated ? "Preview" : "Live") : "Standby");
    renderList(
      document.getElementById("apple-list"),
      apple.connected
        ? [
            { l: "7-Day Downloads", v: fmtInt(apple.days7.downloads) },
            { l: "7-Day Paid Units", v: fmtInt(apple.days7.paidUnits) },
            { l: "7-Day Proceeds (USD)", v: fmtUsd(apple.days7.proceedsUsd) },
          ]
        : [],
      r => [r.l, r.v],
      apple.setupHint || "Connect App Store .p8 key when iOS/macOS launches.",
    );

    renderInboxList();
    renderMainStage();
  }

  // --- Inbox Workbench & Gemini Prep ---
  function categoryBadgeClass(cat) {
    const c = String(cat || "").toUpperCase();
    if (c === "PRESS") return "badge badge--press";
    if (c === "SUPPORT") return "badge badge--support";
    if (c === "PARTNERSHIP") return "badge badge--partnership";
    return "badge";
  }

  function renderInboxList() {
    const snap = activeSnapshot();
    const { inbox } = snap;
    setBadge(
      document.getElementById("inbox-badge"),
      inbox.connected ? (snap.simulated ? "sim" : "live") : "standby",
      inbox.connected ? (snap.simulated ? "Preview Inbox" : "Live Gmail") : "Standby",
    );

    const ul = document.getElementById("inbox-list");
    ul.textContent = "";

    let messages = inbox.connected ? (inbox.messages || []) : [];
    if (inboxFilter === "unread") messages = messages.filter(m => m.unread);
    if (inboxFilter === "prepped") messages = messages.filter(m => preppedCache.has(m.id) || m.draft);

    if (!messages.length) {
      const li = document.createElement("li");
      li.className = "small muted";
      li.textContent = inbox.connected ? "No emails match this filter." : (inbox.setupHint || "Connect Gmail in Connections.");
      ul.appendChild(li);
      return;
    }

    for (const msg of messages) {
      const prep = preppedCache.get(msg.id) || msg;
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inbox-item";
      btn.dataset.unread = String(Boolean(msg.unread));
      btn.dataset.active = String(msg.id === activeMessageId);

      const top = document.createElement("div");
      top.className = "inbox-item__top";
      const fromSpan = document.createElement("span");
      fromSpan.textContent = String(msg.from || "").replace(/<[^>]+>/g, "").trim() || msg.from;
      const dateSpan = document.createElement("span");
      dateSpan.textContent = msg.date ? String(msg.date).slice(0, 18) : "";
      top.append(fromSpan, dateSpan);

      const subj = document.createElement("div");
      subj.className = "inbox-item__subject";
      subj.textContent = msg.subject;

      const tags = document.createElement("div");
      tags.className = "inbox-item__tags";
      if (prep.category) {
        const catEl = document.createElement("span");
        catEl.className = categoryBadgeClass(prep.category);
        catEl.textContent = prep.category;
        tags.appendChild(catEl);
      }
      if (prep.priority === "HIGH") {
        const priEl = document.createElement("span");
        priEl.className = "badge badge--high";
        priEl.textContent = "High Priority";
        tags.appendChild(priEl);
      }
      if (prep.draft) {
        const rdy = document.createElement("span");
        rdy.className = "badge badge--live";
        rdy.textContent = "✦ Reply Prepped";
        tags.appendChild(rdy);
      }

      btn.append(top, subj);
      if (tags.childNodes.length) btn.appendChild(tags);

      if (prep.gist) {
        const gist = document.createElement("div");
        gist.className = "inbox-item__gist";
        gist.textContent = "✦ " + prep.gist;
        btn.appendChild(gist);
      } else {
        const snip = document.createElement("div");
        snip.className = "small muted";
        snip.textContent = msg.snippet || "";
        btn.appendChild(snip);
      }

      btn.addEventListener("click", () => selectMessage(msg));
      li.appendChild(btn);
      ul.appendChild(li);
    }

    if (!activeMessageId && messages[0]) {
      selectMessage(messages[0]);
    }
  }

  async function selectMessage(msg) {
    activeMessageId = msg.id;
    renderInboxList();

    const metaEl = document.getElementById("thread-meta");
    const gistEl = document.getElementById("thread-gist");
    const bodyEl = document.getElementById("thread-body");
    const textarea = document.getElementById("reply-textarea");
    const status = document.getElementById("reply-status");
    status.textContent = "";

    const prep = preppedCache.get(msg.id) || msg;
    metaEl.textContent = "From: " + msg.from + "  ·  " + msg.subject;

    if (prep.gist) {
      gistEl.textContent = "✦ Gemini Brief: " + prep.gist;
      gistEl.hidden = false;
    } else {
      gistEl.hidden = true;
    }

    textarea.value = prep.draft || "";

    if (msg.body) {
      bodyEl.textContent = msg.body;
      return;
    }
    bodyEl.textContent = "Loading full thread...";
    try {
      const full = await api("/api/inbox/message?id=" + encodeURIComponent(msg.id));
      msg.body = full.body || full.snippet || "";
      bodyEl.textContent = msg.body || "(Empty message)";
    } catch (err) {
      bodyEl.textContent = err.message;
    }
  }

  function findActiveMessageObject() {
    const msgs = activeSnapshot().inbox.messages || [];
    return msgs.find(m => m.id === activeMessageId) || null;
  }

  function buildPreviewDraftVariant(msg, tone, refineAction, existingText) {
    const senderFirst = (String(msg.from || "").replace(/<[^>]+>/g, "").trim().split(/\\s+/)[0]) || "there";
    let base = existingText || msg.draft || "";
    if (!refineAction) {
      if (tone === "decline") {
        base = "Hi " + senderFirst + ",\\n\\nThank you for reaching out and thinking of Solivant Studios. Our schedule around Byzantium is fully committed right now so we will pass for this cycle, but we appreciate you getting in touch.\\n\\nBest regards,\\nSolivant Studios";
      } else if (tone === "exec") {
        base = "Hi " + senderFirst + ",\\n\\nReceived with thanks. We have noted your request on our Byzantium schedule and will follow up directly when our next preview milestone locks.\\n\\nSolivant Studios";
      } else if (tone === "press") {
        base = "Hi " + senderFirst + ",\\n\\nThank you for your coverage interest in Byzantium. Set circa 1000 AD across Constantinople and the Eastern Roman frontier on our custom engine, we have added you to our priority press list for the upcoming press kit and gameplay reveal.\\n\\nBest regards,\\nSolivant Studios";
      } else if (tone === "support") {
        base = "Hello " + senderFirst + ",\\n\\nThank you for writing in to Solivant Studios Support. Could you share your device model and OS version so we can log your note accurately with our engineering team?\\n\\nWarmly,\\nSolivant Studios";
      } else {
        base = msg.draft || base;
      }
    } else if (refineAction === "tighten") {
      const firstPara = (base.split("\\n\\n")[1] || base.split("\\n\\n")[0] || "").split(".")[0] + ".";
      base = "Hi " + senderFirst + ",\\n\\n" + firstPara + "\\n\\nSolivant Studios";
    } else if (refineAction === "warmer") {
      base = "Hi " + senderFirst + ",\\n\\nThank you so much for the thoughtful note - hearing enthusiasm like yours genuinely means a great deal to our team.\\n\\n" + (base.split("\\n\\n")[1] || "") + "\\n\\nWarmest regards,\\nSolivant Studios";
    } else if (refineAction === "factcheck") {
      base = (msg.draft || base);
    }
    return base.trim();
  }

  async function runReplyPrep(refineAction = "") {
    const msg = findActiveMessageObject();
    if (!msg) return;
    const isSim = Boolean(simMode || activeSnapshot().simulated || msg.simulated);
    const status = document.getElementById("reply-status");
    const textarea = document.getElementById("reply-textarea");
    const guidance = document.getElementById("reply-guidance").value.trim();
    status.textContent = "✦ Gemini is preparing your reply...";
    try {
      const res = await api("/api/gemini/draft-reply", {
        body: {
          messageId: isSim ? undefined : msg.id,
          inlineMessage: isSim ? msg : undefined,
          guidance,
          tone: selectedTone,
          refineAction,
          currentDraft: textarea.value,
        },
      });
      if (!res.connected) {
        if (isSim) {
          const variant = buildPreviewDraftVariant(msg, selectedTone, refineAction, textarea.value);
          textarea.value = variant;
          preppedCache.set(msg.id, {
            category: msg.category || "GENERAL",
            priority: msg.priority || "NORMAL",
            gist: msg.gist || "",
            draft: variant,
          });
          renderInboxList();
          status.textContent = "✦ Preview draft updated (" + selectedTone.toUpperCase() + "). Add GEMINI_API_KEY in Connections for live AI generation.";
        } else {
          status.textContent = res.setupHint || "Add GEMINI_API_KEY in Connections.";
        }
        return;
      }
      preppedCache.set(msg.id, {
        category: res.category || msg.category || "GENERAL",
        priority: res.priority || msg.priority || "NORMAL",
        gist: res.gist || msg.gist || "",
        draft: res.draft || "",
      });
      textarea.value = res.draft || "";
      if (res.gist) {
        const gistEl = document.getElementById("thread-gist");
        gistEl.textContent = "✦ Gemini Brief: " + res.gist;
        gistEl.hidden = false;
      }
      renderInboxList();
      status.textContent = "✦ Draft ready. Review or tweak above before clicking Approve & Send.";
    } catch (err) {
      status.textContent = err.message;
    }
  }

  async function prepAllUnreadEmails() {
    const snap = activeSnapshot();
    const msgs = (snap.inbox.messages || []).filter(m => m.unread);
    const status = document.getElementById("reply-status");
    if (!msgs.length) {
      status.textContent = "No unread emails waiting in inbox.";
      return;
    }
    status.textContent = "✦ Gemini is triaging and prepping " + msgs.length + " unread emails...";
    try {
      const res = await api("/api/gemini/prep-inbox", { body: { messages: msgs } });
      if (!res.connected) {
        if (snap.simulated) {
          for (const m of msgs) {
            preppedCache.set(m.id, { category: m.category, priority: m.priority, gist: m.gist, draft: m.draft });
          }
          renderInboxList();
          status.textContent = "✦ Preview triage complete for " + msgs.length + " unread threads (add GEMINI_API_KEY in Connections for live AI triage).";
        } else {
          status.textContent = res.setupHint || "Add GEMINI_API_KEY in Connections.";
        }
        return;
      }
      for (const item of res.items || []) {
        preppedCache.set(item.id, item);
      }
      renderInboxList();
      if (activeMessageId && preppedCache.has(activeMessageId)) {
        document.getElementById("reply-textarea").value = preppedCache.get(activeMessageId).draft || "";
      }
      status.textContent = "✦ Prepped " + (res.items || []).length + " emails with category tags and ready-to-review replies.";
    } catch (err) {
      status.textContent = err.message;
    }
  }

  // --- Executive Brief Renderer ---
  function renderStructuredBrief(text, fallbackCards) {
    const grid = document.getElementById("brief-grid");
    const raw = document.getElementById("brief-raw");
    grid.textContent = "";

    if (fallbackCards) {
      raw.hidden = true;
      grid.hidden = false;
      for (const c of fallbackCards) {
        const div = document.createElement("div");
        div.className = "brief-card";
        const lbl = document.createElement("div");
        lbl.className = "brief-card__label";
        lbl.textContent = c.label;
        const b = document.createElement("div");
        b.className = "brief-card__body";
        b.textContent = c.body;
        div.append(lbl, b);
        grid.appendChild(div);
      }
      return;
    }

    const parsed = [];
    for (const line of String(text || "").split(/\\r?\\n/)) {
      const m = line.match(/^[-*•]?\\s*(PULSE|REVENUE|INBOX|NEXT MOVE)\\s*:\\s*(.+)$/i);
      if (m) parsed.push({ label: m[1].toUpperCase(), body: m[2].trim() });
    }
    if (parsed.length >= 3) {
      renderStructuredBrief("", parsed);
    } else {
      grid.hidden = true;
      raw.hidden = false;
      raw.textContent = text;
    }
  }

  async function loadBrief(fresh = false) {
    const badgeEl = document.getElementById("gemini-badge");
    const snap = activeSnapshot();
    try {
      const res = await api("/api/gemini/brief" + (fresh ? "?fresh=1" : ""), {
        body: { snapshotOverride: snap.simulated ? snap : undefined },
      });
      if (res.connected) {
        setBadge(badgeEl, "live", "Gemini Live");
        renderStructuredBrief(res.summary, null);
      } else if (snap.simulated) {
        setBadge(badgeEl, "sim", "Preview Brief · Add GEMINI_API_KEY for Live AI");
        renderStructuredBrief("", SIMULATED_BRIEF);
      } else {
        setBadge(badgeEl, "standby", "Standby");
        renderStructuredBrief(res.error || res.setupHint || "", null);
      }
    } catch (err) {
      setBadge(badgeEl, "standby", "Error");
      renderStructuredBrief(err.message, null);
    }
  }

  async function loadLiveOverview(fresh = false) {
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) refreshBtn.disabled = true;
    try {
      const res = await api("/api/overview" + (fresh ? "?fresh=1" : ""));
      liveData = res;
      const anyLive = Boolean(res.ga4?.connected || res.steam?.connected || res.apple?.connected || res.inbox?.connected);
      if (!userChoseMode) {
        simMode = !anyLive;
      }
      updateConnectionCount(res);
      renderAllFromSnapshot();
      await loadBrief(fresh);
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  function updateConnectionCount(res) {
    const count = [res.geminiConnected, res.ga4?.connected, res.inbox?.connected, res.steam?.connected, res.apple?.connected].filter(Boolean).length;
    const btn = document.getElementById("open-connections-btn");
    if (btn) btn.textContent = "Connections (" + count + "/5)";
    setBadge(document.getElementById("conn-gemini-status"), res.geminiConnected ? "live" : "standby", res.geminiConnected ? "Connected" : "Standby");
    setBadge(document.getElementById("conn-ga4-status"), res.ga4?.connected ? "live" : "standby", res.ga4?.connected ? "Connected" : "Standby");
    setBadge(document.getElementById("conn-gmail-status"), res.inbox?.connected ? "live" : "standby", res.inbox?.connected ? "Connected" : "Standby");
    setBadge(document.getElementById("conn-steam-status"), res.steam?.connected ? "live" : "standby", res.steam?.connected ? "Connected" : "Standby");
    setBadge(document.getElementById("conn-apple-status"), res.apple?.connected ? "live" : "standby", res.apple?.connected ? "Connected" : "Standby");
  }

  // --- Studio Analyst Chat ---
  const chatForm = document.getElementById("chat-form");
  const chatLog = document.getElementById("chat-log");
  const chatHistory = [];

  function appendChat(role, text) {
    const div = document.createElement("div");
    div.className = "chat-bubble " + (role === "user" ? "chat-bubble--user" : "chat-bubble--model");
    div.textContent = text;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  async function sendAnalystPrompt(questionText) {
    const q = String(questionText || "").trim();
    if (!q) return;
    appendChat("user", q);
    const snap = activeSnapshot();
    try {
      const res = await api("/api/gemini/chat", {
        body: {
          history: chatHistory,
          question: q,
          snapshotOverride: snap.simulated ? snap : undefined,
        },
      });
      if (!res.connected) {
        if (snap.simulated) {
          appendChat(
            "model",
            "✦ Preview Brief:\\n• Byzantium (/projects/byzantium/) holds 19,420 views (78% spotlight CTR), led by Steam, Direct, and YouTube referrals.\\n• 30d simulated Steamworks net is $37,890 alongside $4,285 in 7d App Store proceeds (iPad + Mac leading).\\n• Priority inbox actions: reply to Elena Vance (PC Strategy Weekly) and Marcus Hale (Historical Showcase).\\n\\n(Paste your GEMINI_API_KEY in Connections at top right to unlock live free-form Gemini reasoning.)",
          );
        } else {
          appendChat("model", res.setupHint || "Add GEMINI_API_KEY in Connections.");
        }
        return;
      }
      appendChat("model", res.answer);
      chatHistory.push({ role: "user", text: q }, { role: "model", text: res.answer });
    } catch (err) {
      appendChat("model", err.message);
    }
  }

  if (chatForm) {
    chatForm.addEventListener("submit", async event => {
      event.preventDefault();
      const input = chatForm.elements.question;
      const q = input.value.trim();
      if (!q) return;
      input.value = "";
      const btn = chatForm.querySelector("button[type=submit]");
      btn.disabled = true;
      await sendAnalystPrompt(q);
      btn.disabled = false;
    });
  }

  // --- Wire All Interactive Buttons, KPI Cards, Chart Toggles, and Presets ---
  for (const card of document.querySelectorAll(".kpi-card[data-metric]")) {
    card.addEventListener("click", () => {
      selectedMetric = card.dataset.metric;
      for (const c of document.querySelectorAll(".kpi-card[data-metric]")) {
        c.dataset.selected = String(c === card);
      }
      renderMainStage();
      document.getElementById("visual-stage").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  for (const btn of document.querySelectorAll("[data-pull-visual]")) {
    btn.addEventListener("click", () => {
      selectedMetric = btn.dataset.pullVisual;
      for (const c of document.querySelectorAll(".kpi-card[data-metric]")) {
        c.dataset.selected = String(c.dataset.metric === selectedMetric);
      }
      renderMainStage();
      document.getElementById("visual-stage").scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  for (const btn of document.querySelectorAll("[data-range]")) {
    btn.addEventListener("click", () => {
      selectedRange = Number(btn.dataset.range);
      for (const b of document.querySelectorAll("[data-range]")) b.setAttribute("aria-pressed", String(b === btn));
      renderMainStage();
    });
  }

  for (const btn of document.querySelectorAll("[data-chart-type]")) {
    btn.addEventListener("click", () => {
      selectedChartType = btn.dataset.chartType;
      for (const b of document.querySelectorAll("[data-chart-type]")) b.setAttribute("aria-pressed", String(b === btn));
      renderMainStage();
    });
  }

  document.getElementById("mode-live").addEventListener("click", () => {
    userChoseMode = true;
    simMode = false;
    activeMessageId = "";
    renderAllFromSnapshot();
    loadBrief(false);
  });
  document.getElementById("mode-sim").addEventListener("click", () => {
    userChoseMode = true;
    simMode = true;
    activeMessageId = "";
    renderAllFromSnapshot();
    loadBrief(false);
  });

  // Top Gemini Command Chips
  document.getElementById("chip-summarize").addEventListener("click", () => loadBrief(true));
  document.getElementById("chip-prep-emails").addEventListener("click", () => {
    document.getElementById("inbox-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    prepAllUnreadEmails();
  });
  document.getElementById("chip-funnel").addEventListener("click", () => {
    selectedMetric = "traffic";
    renderMainStage();
    document.getElementById("analyst-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    sendAnalystPrompt("Break down our Byzantium page funnel, top traffic sources, and which click events are converting best.");
  });
  document.getElementById("chip-storefronts").addEventListener("click", () => {
    selectedMetric = "combined";
    selectedChartType = "compare";
    renderMainStage();
    document.getElementById("analyst-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    sendAnalystPrompt("Compare Steamworks net revenue and regional demand against Apple App Store proceeds and device mix.");
  });

  for (const promptBtn of document.querySelectorAll("[data-quick-ask]")) {
    promptBtn.addEventListener("click", () => sendAnalystPrompt(promptBtn.dataset.quickAsk));
  }

  // Inbox Filters, Tone Presets, and Refinements
  for (const btn of document.querySelectorAll("[data-inbox-filter]")) {
    btn.addEventListener("click", () => {
      inboxFilter = btn.dataset.inboxFilter;
      for (const b of document.querySelectorAll("[data-inbox-filter]")) b.setAttribute("aria-pressed", String(b === btn));
      renderInboxList();
    });
  }

  for (const btn of document.querySelectorAll("[data-tone-preset]")) {
    btn.addEventListener("click", () => {
      selectedTone = btn.dataset.tonePreset;
      for (const b of document.querySelectorAll("[data-tone-preset]")) b.setAttribute("aria-pressed", String(b === btn));
      runReplyPrep("");
    });
  }

  document.getElementById("draft-reply-btn").addEventListener("click", () => runReplyPrep(""));
  document.getElementById("refine-tighten-btn").addEventListener("click", () => runReplyPrep("tighten"));
  document.getElementById("refine-warmer-btn").addEventListener("click", () => runReplyPrep("warmer"));
  document.getElementById("refine-factcheck-btn").addEventListener("click", () => runReplyPrep("factcheck"));
  document.getElementById("prep-all-btn").addEventListener("click", () => prepAllUnreadEmails());

  document.getElementById("send-reply-btn").addEventListener("click", async () => {
    const msg = findActiveMessageObject();
    if (!msg) return;
    const status = document.getElementById("reply-status");
    const bodyText = document.getElementById("reply-textarea").value.trim();
    if (!bodyText) {
      status.textContent = "Write or prep a reply before sending.";
      return;
    }
    if (msg.simulated) {
      status.textContent = "Preview mode: connect Gmail OAuth in Connections to send real emails from contact@solivantstudios.com.";
      return;
    }
    if (!window.confirm("Approve and send this reply from contact@solivantstudios.com?")) return;
    try {
      status.textContent = "Sending via Google Workspace...";
      await api("/api/inbox/send", { body: { messageId: msg.id, bodyText } });
      status.textContent = "✓ Sent from contact@solivantstudios.com.";
    } catch (err) {
      status.textContent = err.message;
    }
  });

  // Connections Modal
  const modal = document.getElementById("connections-modal");
  document.getElementById("open-connections-btn").addEventListener("click", () => { modal.hidden = false; });
  document.getElementById("close-connections-btn").addEventListener("click", () => { modal.hidden = true; });
  modal.addEventListener("click", evt => { if (evt.target === modal) modal.hidden = true; });

  const connForm = document.getElementById("connections-form");
  if (connForm && isLocalHost) {
    connForm.addEventListener("submit", async evt => {
      evt.preventDefault();
      const status = document.getElementById("conn-save-status");
      status.textContent = "Saving keys to gitignored hq/.dev.vars...";
      const updates = {};
      for (const el of connForm.querySelectorAll("input[name], textarea[name]")) {
        if (el.value.trim()) updates[el.name] = el.value.trim();
      }
      try {
        await api("/api/local-config", { body: { updates } });
        connForm.reset();
        status.textContent = "✓ Saved! Refreshing live connectors...";
        await loadLiveOverview(true);
        setTimeout(() => { modal.hidden = true; status.textContent = ""; }, 900);
      } catch (err) {
        status.textContent = err.message;
      }
    });
  }

  document.getElementById("refresh-btn").addEventListener("click", () => loadLiveOverview(true));
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await api("/api/auth/logout", { body: {} }).catch(() => {});
    window.location.reload();
  });

  loadLiveOverview(false);
})();
`;
