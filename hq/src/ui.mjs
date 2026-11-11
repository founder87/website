// Solivant Studios HQ · Server-Rendered HTML Shells (strictly CSP-clean: zero inline scripts or style attributes).

export { HQ_CSS } from "./styles.mjs";
export { HQ_JS } from "./client.mjs";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderLocalOnboardingPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Set Up Studio HQ | Solivant Studios</title>
    <link rel="stylesheet" href="/assets/hq.css" />
  </head>
  <body>
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="setup-title">
        <p class="eyebrow">Solivant Studios · First-Time Setup</p>
        <h1 id="setup-title">Create Your Login</h1>
        <p class="muted">Set your Studio HQ email, password, and two-factor verification right here in your browser.</p>
        <div id="auth-error" class="alert" role="alert" hidden></div>

        <form id="setup-step1-form" autocomplete="off">
          <div class="field">
            <label for="setup-email">Your Studio Email</label>
            <input id="setup-email" name="email" type="email" required value="contact@solivantstudios.com" />
          </div>
          <div class="field">
            <label for="setup-password">Choose a Password (12+ characters)</label>
            <input id="setup-password" name="password" type="password" minlength="12" required placeholder="At least 12 characters" />
          </div>
          <div class="field">
            <label for="setup-confirm">Confirm Password</label>
            <input id="setup-confirm" name="confirm" type="password" minlength="12" required placeholder="Re-enter password" />
          </div>
          <div class="auth-actions">
            <button class="btn" type="submit">Next: Set Up 2FA →</button>
          </div>
        </form>

        <form id="setup-step2-form" hidden autocomplete="off">
          <div class="field">
            <label>Step 1 · Add 2FA to Your Mac or Phone</label>
            <a id="apple-passwords-link" class="btn" href="#">Open in Apple Passwords (1-Click)</a>
            <p class="small muted">Or copy this key into Google Authenticator / 1Password:</p>
            <div id="setup-key-display" class="setup-key-box"></div>
            <button id="copy-setup-key" class="btn btn--outline" type="button">Copy Key for Authenticator App</button>
          </div>
          <div class="field">
            <label for="setup-code">Step 2 · Enter the 6-Digit Code Shown</label>
            <input id="setup-code" name="code" class="otp-input" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required placeholder="000000" />
          </div>
          <div class="auth-actions">
            <button class="btn" type="submit">Finish &amp; Open Studio HQ →</button>
          </div>
        </form>
      </section>
    </main>
    <script src="/assets/hq.js" defer></script>
  </body>
</html>`;
}

export function renderLoginPage({ configured = true } = {}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Studio HQ Login | Solivant Studios</title>
    <link rel="stylesheet" href="/assets/hq.css" />
  </head>
  <body>
    <main class="auth-shell">
      <section class="auth-card" aria-labelledby="auth-title">
        <p class="eyebrow">Solivant Studios · Private HQ</p>
        <h1 id="auth-title">Command Sign-In</h1>
        <p class="muted">Protected by password and two-factor authenticator verification.</p>
        ${
          !configured
            ? `<div class="alert">HQ credentials are not configured yet. Run <code>npm run hq:setup</code> locally and set <code>HQ_ADMIN_EMAIL</code>, <code>HQ_PASSWORD_HASH</code>, <code>HQ_TOTP_SECRET</code>, and <code>HQ_SESSION_SECRET</code>.</div>`
            : ""
        }
        <div id="auth-error" class="alert" role="alert" hidden></div>

        <form id="login-form" autocomplete="on">
          <div class="field">
            <label for="email">Studio Email</label>
            <input id="email" name="email" type="email" autocomplete="username" required placeholder="contact@solivantstudios.com" />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <div class="auth-actions">
            <button class="btn" type="submit" ${!configured ? "disabled" : ""}>Continue to 2FA →</button>
          </div>
        </form>

        <form id="totp-form" hidden autocomplete="off">
          <div class="field">
            <label for="code">6-Digit Authenticator Code</label>
            <input id="code" name="code" class="otp-input" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required placeholder="000000" />
          </div>
          <div class="auth-actions">
            <button class="btn" type="submit">Verify &amp; Enter HQ</button>
            <button id="back-to-login" class="btn btn--outline" type="button">← Back</button>
          </div>
        </form>
      </section>
    </main>
    <script src="/assets/hq.js" defer></script>
  </body>
</html>`;
}

export function renderDashboardPage({ adminEmail, csrfToken, isLocal = false }) {
  return `<!doctype html>
<html lang="en" data-csrf="${escapeHtml(csrfToken)}" data-local="${isLocal ? "true" : "false"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Studio HQ | Solivant Studios</title>
    <link rel="stylesheet" href="/assets/hq.css" />
  </head>
  <body>
    <header class="hq-header">
      <div class="hq-header__inner">
        <div class="hq-brand">
          <span id="brand-dot" class="hq-brand__dot" data-sim="false" aria-hidden="true"></span>
          <div>
            <p class="eyebrow">Solivant Studios · Private Command</p>
            <h1>Studio HQ</h1>
          </div>
        </div>
        <div class="hq-toolbar">
          <div class="seg-group" role="group" aria-label="Telemetry data source">
            <button id="mode-live" class="seg-btn" type="button" aria-pressed="true">Live</button>
            <button id="mode-sim" class="seg-btn" type="button" aria-pressed="false">Preview Sim</button>
          </div>
          <button id="open-connections-btn" class="btn btn--ghost btn--sm" type="button">Connections (0/5)</button>
          <button id="refresh-btn" class="btn btn--outline btn--sm" type="button">Sync</button>
          <span class="small muted mono">${escapeHtml(adminEmail)}</span>
          <button id="logout-btn" class="btn btn--outline btn--sm" type="button">Sign Out</button>
        </div>
      </div>
    </header>

    <main id="hq-dashboard" class="hq-main">
      <!-- Gemini Chief-of-Staff Command Deck -->
      <section class="gemini-deck" aria-labelledby="brief-heading">
        <div class="gemini-deck__top">
          <div class="gemini-deck__title">
            <span class="gemini-deck__spark" aria-hidden="true">✦</span>
            <div>
              <p class="eyebrow">Gemini Chief of Staff</p>
              <h2 id="brief-heading">Daily Studio Brief</h2>
            </div>
            <span id="gemini-badge" class="badge badge--standby">Checking</span>
          </div>
          <div class="gemini-deck__chips">
            <button id="chip-summarize" class="btn btn--ghost btn--sm" type="button">✦ Summarize Today</button>
            <button id="chip-prep-emails" class="btn btn--ghost btn--sm" type="button">✦ Prep Unread Emails</button>
            <button id="chip-funnel" class="btn btn--outline btn--sm" type="button">Analyze Byzantium Funnel</button>
            <button id="chip-storefronts" class="btn btn--outline btn--sm" type="button">Compare Storefronts</button>
          </div>
        </div>
        <div id="brief-grid" class="brief-grid"></div>
        <div id="brief-raw" class="brief-raw" hidden>Synthesizing studio telemetry...</div>
      </section>

      <!-- 5 Interactive KPI Cards with Sparklines (click any card to pull up its visual stage) -->
      <section class="kpi-grid" aria-label="Key studio metrics">
        <button class="kpi-card" type="button" data-metric="combined" data-selected="true">
          <div class="kpi-card__head">
            <span class="eyebrow">Active Right Now</span>
            <span class="kpi-card__delta">Unified ↗</span>
          </div>
          <p id="kpi-active" class="kpi-card__value">...</p>
          <p id="kpi-active-sub" class="kpi-card__sub">solivantstudios.com live</p>
          <svg id="spark-active" class="kpi-spark" aria-hidden="true"></svg>
        </button>

        <button class="kpi-card" type="button" data-metric="traffic" data-selected="false">
          <div class="kpi-card__head">
            <span class="eyebrow">Website Funnel (30d)</span>
            <span class="kpi-card__delta">Graph ↗</span>
          </div>
          <p id="kpi-sessions" class="kpi-card__value">...</p>
          <p id="kpi-sessions-sub" class="kpi-card__sub">Loading GA4...</p>
          <svg id="spark-sessions" class="kpi-spark" aria-hidden="true"></svg>
        </button>

        <button class="kpi-card" type="button" data-metric="steam" data-selected="false">
          <div class="kpi-card__head">
            <span class="eyebrow">Steamworks Net (30d)</span>
            <span class="kpi-card__delta">Graph ↗</span>
          </div>
          <p id="kpi-steam" class="kpi-card__value">...</p>
          <p id="kpi-steam-sub" class="kpi-card__sub">Steamworks API</p>
          <svg id="spark-steam" class="kpi-spark" aria-hidden="true"></svg>
        </button>

        <button class="kpi-card" type="button" data-metric="apple" data-selected="false">
          <div class="kpi-card__head">
            <span class="eyebrow">App Store (7d)</span>
            <span class="kpi-card__delta">Graph ↗</span>
          </div>
          <p id="kpi-apple" class="kpi-card__value">...</p>
          <p id="kpi-apple-sub" class="kpi-card__sub">iOS, iPadOS &amp; macOS</p>
          <svg id="spark-apple" class="kpi-spark" aria-hidden="true"></svg>
        </button>

        <button class="kpi-card" type="button" data-metric="inbox" data-selected="false">
          <div class="kpi-card__head">
            <span class="eyebrow">Studio Inbox</span>
            <span class="kpi-card__delta">Triage ↗</span>
          </div>
          <p id="kpi-inbox" class="kpi-card__value">...</p>
          <p id="kpi-inbox-sub" class="kpi-card__sub">contact@solivantstudios.com</p>
          <svg id="spark-inbox" class="kpi-spark" aria-hidden="true"></svg>
        </button>
      </section>

      <!-- Full-Width Interactive Visual Telemetry Stage -->
      <section id="visual-stage" class="stage-panel" aria-labelledby="stage-title">
        <div class="stage-head">
          <div>
            <p id="stage-eyebrow" class="eyebrow">Unified Studio Command Telemetry</p>
            <h2 id="stage-title">Combined Net Revenue &amp; Website Funnel</h2>
          </div>
          <div class="stage-controls">
            <div class="seg-group" role="group" aria-label="Select telemetry channel">
              <button class="seg-btn" type="button" data-pull-visual="combined" aria-pressed="true">Unified</button>
              <button class="seg-btn" type="button" data-pull-visual="traffic" aria-pressed="false">GA4</button>
              <button class="seg-btn" type="button" data-pull-visual="steam" aria-pressed="false">Steam</button>
              <button class="seg-btn" type="button" data-pull-visual="apple" aria-pressed="false">Apple</button>
              <button class="seg-btn" type="button" data-pull-visual="inbox" aria-pressed="false">Inbox</button>
            </div>
            <div class="seg-group" role="group" aria-label="Time window">
              <button class="seg-btn" type="button" data-range="7" aria-pressed="false">7D</button>
              <button class="seg-btn" type="button" data-range="14" aria-pressed="false">14D</button>
              <button class="seg-btn" type="button" data-range="30" aria-pressed="true">30D</button>
            </div>
            <div class="seg-group" role="group" aria-label="Visual chart style">
              <button class="seg-btn" type="button" data-chart-type="area" aria-pressed="true">Area</button>
              <button class="seg-btn" type="button" data-chart-type="bars" aria-pressed="false">Columns</button>
              <button class="seg-btn" type="button" data-chart-type="compare" aria-pressed="false">Compare</button>
            </div>
          </div>
        </div>

        <div class="stage-body">
          <div class="chart-wrap">
            <div class="chart-readout">
              <span id="readout-date">Latest</span>
              <span id="readout-values">Hover across the chart to inspect daily metrics</span>
            </div>
            <svg id="stage-svg" class="chart-svg" viewBox="0 0 860 250" role="img" aria-label="Interactive studio telemetry chart"></svg>
            <div id="chart-legend" class="chart-legend"></div>
          </div>

          <div class="breakdown-wrap">
            <p id="donut-title" class="eyebrow">Channel Distribution</p>
            <div class="donut-row">
              <svg id="donut-svg" class="donut-svg" viewBox="0 0 112 112" aria-hidden="true"></svg>
              <div id="donut-meta" class="donut-meta"></div>
            </div>
            <p id="bars-title" class="eyebrow">Top Breakdown</p>
            <ul id="breakdown-bars" class="bar-list"></ul>
          </div>
        </div>
      </section>

      <!-- Operations Workspace: Gemini Email Prep Studio + Studio Analyst -->
      <section class="ops-grid">
        <article id="inbox-panel" class="panel panel--gold" aria-labelledby="inbox-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">Google Workspace · Gemini Triage &amp; Reply Prep</p>
              <h2 id="inbox-heading">contact@solivantstudios.com</h2>
            </div>
            <div class="hq-toolbar">
              <span id="inbox-badge" class="badge">...</span>
              <div class="seg-group" role="group" aria-label="Filter inbox">
                <button class="seg-btn" type="button" data-inbox-filter="all" aria-pressed="true">All</button>
                <button class="seg-btn" type="button" data-inbox-filter="unread" aria-pressed="false">Unread</button>
                <button class="seg-btn" type="button" data-inbox-filter="prepped" aria-pressed="false">Prepped</button>
              </div>
              <button id="prep-all-btn" class="btn btn--ghost btn--sm" type="button">✦ Prep All Unread</button>
            </div>
          </div>

          <div class="inbox-workbench">
            <ul id="inbox-list" class="inbox-list"></ul>

            <div class="composer-pane">
              <p id="thread-meta" class="small mono">Select an email thread on the left to inspect and prep a reply.</p>
              <div id="thread-gist" class="gist-callout" hidden></div>
              <div id="thread-body" class="thread-body">Choose a thread to read the full incoming message and review Gemini's prepped draft.</div>

              <div class="field">
                <label>Gemini Tone Preset</label>
                <div class="seg-group" role="group" aria-label="Reply tone preset">
                  <button class="seg-btn" type="button" data-tone-preset="warm" aria-pressed="true">Warm</button>
                  <button class="seg-btn" type="button" data-tone-preset="press" aria-pressed="false">Press</button>
                  <button class="seg-btn" type="button" data-tone-preset="support" aria-pressed="false">Support</button>
                  <button class="seg-btn" type="button" data-tone-preset="decline" aria-pressed="false">Decline</button>
                  <button class="seg-btn" type="button" data-tone-preset="exec" aria-pressed="false">Brief</button>
                </div>
              </div>

              <div class="field">
                <label for="reply-guidance">Optional Direction for Gemini</label>
                <input id="reply-guidance" type="text" placeholder="e.g. Confirm press list signup and ask for event dates" />
              </div>

              <div class="preset-bar">
                <button id="draft-reply-btn" class="btn btn--ghost btn--sm" type="button">✦ Prep / Rewrite</button>
                <button id="refine-tighten-btn" class="btn btn--outline btn--sm" type="button">Tighten 30%</button>
                <button id="refine-warmer-btn" class="btn btn--outline btn--sm" type="button">Make Warmer</button>
                <button id="refine-factcheck-btn" class="btn btn--outline btn--sm" type="button">Fact-Check</button>
              </div>

              <div class="field">
                <label for="reply-textarea">Prepped Reply (Human Approval Always Required)</label>
                <textarea id="reply-textarea" rows="6" placeholder="Gemini's prepped reply appears here for your review..."></textarea>
              </div>

              <div class="hq-toolbar">
                <button id="send-reply-btn" class="btn" type="button">Approve &amp; Send Reply</button>
                <span id="reply-status" class="small muted"></span>
              </div>
            </div>
          </div>
        </article>

        <article id="analyst-panel" class="panel" aria-labelledby="analyst-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">Gemini Studio Intelligence</p>
              <h2 id="analyst-heading">Ask Studio Analyst</h2>
            </div>
          </div>

          <div class="chat-prompts">
            <button class="btn btn--outline btn--sm" type="button" data-quick-ask="Summarize today's priorities across traffic, revenue, and unread emails.">Today's Priorities</button>
            <button class="btn btn--outline btn--sm" type="button" data-quick-ask="Which traffic sources and click events are driving the strongest interest in Byzantium?">Byzantium Funnel</button>
            <button class="btn btn--outline btn--sm" type="button" data-quick-ask="Which inbox threads should I answer first and what angle do you recommend?">Inbox Triage</button>
            <button class="btn btn--outline btn--sm" type="button" data-quick-ask="Draft a crisp weekly founder update from our 7-day and 30-day numbers.">Weekly Memo</button>
          </div>

          <div id="chat-log" class="chat-log">
            <div class="chat-bubble chat-bubble--model">✦ Chief-of-Staff Analyst online. Ask anything across your website funnel, Byzantium interest, Steamworks revenue, App Store proceeds, or contact@solivantstudios.com correspondence.</div>
          </div>

          <form id="chat-form" class="chat-form">
            <input name="question" type="text" placeholder="Ask Gemini to analyze stats, compare channels, or prep notes..." required />
            <button class="btn" type="submit">Ask</button>
          </form>
        </article>
      </section>

      <!-- 3-Column Channel Summary Cards with One-Click Visual Pull-Up -->
      <section class="channel-grid">
        <article class="panel" aria-labelledby="ga4-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">solivantstudios.com</p>
              <h2 id="ga4-heading">Website &amp; Byzantium (GA4)</h2>
            </div>
            <div class="hq-toolbar">
              <span id="ga4-badge" class="badge">...</span>
              <button class="btn btn--ghost btn--sm" type="button" data-pull-visual="traffic">Pull Visual ↗</button>
            </div>
          </div>
          <ul id="ga4-pages" class="data-list"></ul>
        </article>

        <article class="panel" aria-labelledby="steam-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">PC Storefront</p>
              <h2 id="steam-heading">Steamworks Sales</h2>
            </div>
            <div class="hq-toolbar">
              <span id="steam-badge" class="badge">...</span>
              <button class="btn btn--ghost btn--sm" type="button" data-pull-visual="steam">Pull Visual ↗</button>
            </div>
          </div>
          <ul id="steam-list" class="data-list"></ul>
        </article>

        <article class="panel" aria-labelledby="apple-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">iOS · iPadOS · macOS</p>
              <h2 id="apple-heading">App Store Proceeds</h2>
            </div>
            <div class="hq-toolbar">
              <span id="apple-badge" class="badge">...</span>
              <button class="btn btn--ghost btn--sm" type="button" data-pull-visual="apple">Pull Visual ↗</button>
            </div>
          </div>
          <ul id="apple-list" class="data-list"></ul>
        </article>
      </section>
    </main>

    <!-- Connections Vault Modal -->
    <div id="connections-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="conn-title" hidden>
      <div class="modal-card">
        <div class="panel__head">
          <div>
            <p class="eyebrow">Private Studio Credentials</p>
            <h2 id="conn-title">API Connections Vault</h2>
          </div>
          <button id="close-connections-btn" class="btn btn--outline btn--sm" type="button">Close ✕</button>
        </div>

        <p class="small muted">
          ${
            isLocal
              ? "Paste any API key below to activate live data immediately. Keys are stored only in your local gitignored hq/.dev.vars file (0600 permissions) and never committed to Git."
              : "On Cloudflare Workers, configure secrets with npx wrangler secret put <KEY_NAME> inside hq/."
          }
        </p>

        ${
          isLocal
            ? `<form id="connections-form" autocomplete="off" class="conn-form">
          <div class="conn-group">
            <div class="conn-group__head">
              <strong>1. Gemini AI (Briefs, Email Prep &amp; Studio Analyst)</strong>
              <span id="conn-gemini-status" class="badge">Standby</span>
            </div>
            <div class="field">
              <label for="cfg-gemini">GEMINI_API_KEY (from Google AI Studio)</label>
              <input id="cfg-gemini" name="GEMINI_API_KEY" type="password" placeholder="AIza..." />
            </div>
          </div>

          <div class="conn-group">
            <div class="conn-group__head">
              <strong>2. Google Analytics 4 (Website &amp; Byzantium Funnel)</strong>
              <span id="conn-ga4-status" class="badge">Standby</span>
            </div>
            <div class="field">
              <label for="cfg-ga4-prop">GA4_PROPERTY_ID (numeric Property ID)</label>
              <input id="cfg-ga4-prop" name="GA4_PROPERTY_ID" type="text" placeholder="e.g. 482910384" />
            </div>
            <div class="field">
              <label for="cfg-ga4-email">GOOGLE_CLIENT_EMAIL (Service Account Email)</label>
              <input id="cfg-ga4-email" name="GOOGLE_CLIENT_EMAIL" type="email" placeholder="hq-reader@project.iam.gserviceaccount.com" />
            </div>
            <div class="field">
              <label for="cfg-ga4-key">GOOGLE_PRIVATE_KEY (PEM Private Key)</label>
              <textarea id="cfg-ga4-key" name="GOOGLE_PRIVATE_KEY" rows="2" placeholder="-----BEGIN PRIVATE KEY----- ..."></textarea>
            </div>
          </div>

          <div class="conn-group">
            <div class="conn-group__head">
              <strong>3. Google Workspace Gmail (contact@solivantstudios.com)</strong>
              <span id="conn-gmail-status" class="badge">Standby</span>
            </div>
            <div class="field">
              <label for="cfg-gmail-id">GMAIL_CLIENT_ID</label>
              <input id="cfg-gmail-id" name="GMAIL_CLIENT_ID" type="text" placeholder="...apps.googleusercontent.com" />
            </div>
            <div class="field">
              <label for="cfg-gmail-sec">GMAIL_CLIENT_SECRET</label>
              <input id="cfg-gmail-sec" name="GMAIL_CLIENT_SECRET" type="password" placeholder="GOCSPX-..." />
            </div>
            <div class="field">
              <label for="cfg-gmail-ref">GMAIL_REFRESH_TOKEN</label>
              <input id="cfg-gmail-ref" name="GMAIL_REFRESH_TOKEN" type="password" placeholder="1//04..." />
            </div>
          </div>

          <div class="conn-group">
            <div class="conn-group__head">
              <strong>4. Steamworks Partner Financial API</strong>
              <span id="conn-steam-status" class="badge">Standby</span>
            </div>
            <div class="field">
              <label for="cfg-steam">STEAM_FINANCIAL_API_KEY</label>
              <input id="cfg-steam" name="STEAM_FINANCIAL_API_KEY" type="password" placeholder="Steamworks Financial Web API Key" />
            </div>
          </div>

          <div class="conn-group">
            <div class="conn-group__head">
              <strong>5. Apple App Store Connect (iOS, iPadOS &amp; macOS)</strong>
              <span id="conn-apple-status" class="badge">Standby</span>
            </div>
            <div class="field">
              <label for="cfg-apple-iss">APPLE_ISSUER_ID</label>
              <input id="cfg-apple-iss" name="APPLE_ISSUER_ID" type="text" placeholder="UUID from App Store Connect" />
            </div>
            <div class="field">
              <label for="cfg-apple-kid">APPLE_KEY_ID &amp; APPLE_VENDOR_NUMBER</label>
              <div class="chat-form">
                <input id="cfg-apple-kid" name="APPLE_KEY_ID" type="text" placeholder="Key ID (e.g. 2X9R4HXF34)" />
                <input name="APPLE_VENDOR_NUMBER" type="text" placeholder="Vendor # (e.g. 88123456)" />
              </div>
            </div>
            <div class="field">
              <label for="cfg-apple-p8">APPLE_PRIVATE_KEY (.p8 contents)</label>
              <textarea id="cfg-apple-p8" name="APPLE_PRIVATE_KEY" rows="2" placeholder="-----BEGIN PRIVATE KEY----- ..."></textarea>
            </div>
          </div>

          <div class="hq-toolbar">
            <button class="btn" type="submit">Save Filled Keys &amp; Reconnect</button>
            <span id="conn-save-status" class="small muted"></span>
          </div>
        </form>`
            : `<div class="conn-group">
          <div class="conn-group__head"><strong>Gemini AI</strong><span id="conn-gemini-status" class="badge">Standby</span></div>
          <div class="conn-group__head"><strong>Google Analytics 4</strong><span id="conn-ga4-status" class="badge">Standby</span></div>
          <div class="conn-group__head"><strong>Google Workspace Gmail</strong><span id="conn-gmail-status" class="badge">Standby</span></div>
          <div class="conn-group__head"><strong>Steamworks Sales</strong><span id="conn-steam-status" class="badge">Standby</span></div>
          <div class="conn-group__head"><strong>Apple App Store Connect</strong><span id="conn-apple-status" class="badge">Standby</span></div>
        </div>`
        }
      </div>
    </div>

    <script src="/assets/hq.js" defer></script>
  </body>
</html>`;
}
