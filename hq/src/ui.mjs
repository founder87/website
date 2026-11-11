// Solivant Studios HQ UI assets (served from same-origin /assets/* so CSP requires zero unsafe-inline).

export const HQ_CSS = `@font-face {
  font-family: "Cinzel";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("https://solivantstudios.com/fonts/cinzel-latin-400.woff2") format("woff2");
}
:root {
  color-scheme: dark;
  --bg: #090807;
  --surface: #12100e;
  --surface-alt: #181512;
  --text: #f3efe6;
  --muted: #a69e92;
  --gold: #d8a650;
  --gold-bright: #e8bc6a;
  --emerald: #52c48a;
  --danger: #e07a68;
  --line: #29221b;
  --serif: "Cinzel", "Trajan Pro", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --mono: ui-monospace, "SFMono-Regular", Consolas, monospace;
}
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 85% 50% at 50% -8%, rgba(92, 54, 22, 0.32), transparent 72%),
    radial-gradient(ellipse 55% 40% at 85% 15%, rgba(216, 166, 80, 0.08), transparent 65%);
  color: var(--text);
  font: 400 .95rem/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, p { margin: 0; }
h1, h2, h3 { font-family: var(--serif); font-weight: 400; letter-spacing: .02em; }
[hidden] { display: none !important; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }

.eyebrow {
  color: var(--gold);
  font: 500 .66rem/1.4 var(--mono);
  text-transform: uppercase;
  letter-spacing: .16em;
}
.muted { color: var(--muted); }
.small { font-size: .82rem; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .55rem;
  min-height: 2.6rem;
  padding: .55rem 1.15rem;
  border: 1px solid var(--gold);
  background: var(--gold);
  color: #090807;
  font: 600 .74rem/1 -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
  letter-spacing: .1em;
  cursor: pointer;
  transition: background .2s, border-color .2s, color .2s;
}
.btn:hover:not(:disabled) { background: var(--gold-bright); border-color: var(--gold-bright); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn--outline {
  background: transparent;
  border-color: var(--line);
  color: var(--text);
}
.btn--outline:hover:not(:disabled) {
  border-color: var(--gold);
  color: var(--gold);
  background: rgba(216, 166, 80, 0.08);
}

/* Auth Gate */
.auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}
.auth-card {
  width: min(100%, 27rem);
  padding: 2.25rem 2rem;
  background: var(--surface);
  border: 1px solid rgba(216, 166, 80, 0.3);
}
.auth-card h1 { font-size: 1.75rem; margin-top: .5rem; }
.auth-card > p.muted { margin-top: .45rem; font-size: .88rem; }
.field { display: grid; gap: .4rem; margin-top: 1.15rem; }
.field label {
  font: 500 .66rem/1.4 var(--mono);
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--muted);
}
.field input, textarea {
  width: 100%;
  padding: .7rem .85rem;
  background: #0b0a08;
  border: 1px solid var(--line);
  color: var(--text);
  font: inherit;
}
.field input:focus, textarea:focus { border-color: var(--gold); outline: none; }
.otp-input {
  font: 500 1.4rem/1.2 var(--mono) !important;
  letter-spacing: .32em;
  text-align: center;
}
.auth-actions { margin-top: 1.4rem; display: grid; gap: .65rem; }
.alert {
  margin-top: 1rem;
  padding: .7rem .85rem;
  border: 1px solid rgba(224, 122, 104, 0.45);
  background: rgba(224, 122, 104, 0.1);
  color: #f3c4ba;
  font-size: .83rem;
}

/* HQ Dashboard */
.hq-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(9, 8, 7, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(216, 166, 80, 0.16);
}
.hq-header__inner {
  max-width: 84rem;
  margin: 0 auto;
  padding: .9rem clamp(1.25rem, 3vw, 2.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.hq-brand { display: flex; align-items: baseline; gap: .9rem; }
.hq-brand h1 { font-size: 1.25rem; text-transform: uppercase; }
.hq-toolbar { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }

.hq-main {
  max-width: 84rem;
  margin: 0 auto;
  padding: 2rem clamp(1.25rem, 3vw, 2.5rem) 4rem;
  display: grid;
  gap: 1.75rem;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1.4rem 1.5rem;
}
.panel--gold { border-color: rgba(216, 166, 80, 0.34); }
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: .85rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1rem;
}
.panel__head h2 { font-size: 1.1rem; text-transform: uppercase; }
.panel > p.muted { margin-bottom: .95rem; }

.badge {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .22rem .55rem;
  font: 500 .62rem/1.3 var(--mono);
  text-transform: uppercase;
  letter-spacing: .12em;
  border: 1px solid var(--line);
  color: var(--muted);
}
.badge--live { border-color: rgba(82, 196, 138, 0.4); color: #bfead3; background: rgba(82, 196, 138, 0.08); }
.badge--standby { border-color: rgba(216, 166, 80, 0.3); color: var(--gold); }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
}
.kpi {
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1.15rem 1.25rem;
}
.kpi__value {
  font: 400 clamp(1.45rem, 2.2vw, 2rem)/1.15 var(--serif);
  margin-top: .45rem;
  color: var(--text);
}
.kpi__sub { font-size: .76rem; color: var(--muted); margin-top: .25rem; }

.grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
.grid-2 { display: grid; grid-template-columns: 1.15fr .85fr; gap: 1.25rem; align-items: start; }

.data-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .5rem; }
.data-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-block: .4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: .86rem;
}
.data-list li:last-child { border-bottom: 0; }
.mono { font-family: var(--mono); font-size: .8rem; }

.brief-copy {
  white-space: pre-wrap;
  color: var(--text);
  font-size: .93rem;
  line-height: 1.65;
}

/* Inbox & Reply Composer */
.inbox-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .45rem; max-height: 24rem; overflow-y: auto; }
.inbox-item {
  width: 100%;
  text-align: left;
  padding: .75rem .9rem;
  background: var(--surface-alt);
  border: 1px solid var(--line);
  color: var(--text);
  cursor: pointer;
  display: grid;
  gap: .2rem;
}
.inbox-item:hover, .inbox-item[data-active="true"] { border-color: var(--gold); }
.inbox-item__top { display: flex; justify-content: space-between; gap: .75rem; font-size: .76rem; color: var(--muted); }
.inbox-item__subject { font-weight: 600; font-size: .88rem; }
.inbox-item[data-unread="true"] .inbox-item__subject { color: var(--gold-bright); }

.thread-reader {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
  display: grid;
  gap: .85rem;
}
.thread-body {
  max-height: 14rem;
  overflow-y: auto;
  padding: .85rem;
  background: #0b0a08;
  border: 1px solid var(--line);
  white-space: pre-wrap;
  font-size: .84rem;
  color: var(--muted);
}

/* Gemini Chat */
.chat-log {
  display: grid;
  gap: .75rem;
  max-height: 22rem;
  overflow-y: auto;
  padding-right: .25rem;
  margin-bottom: .9rem;
}
.chat-bubble {
  padding: .75rem .95rem;
  border: 1px solid var(--line);
  background: #0c0b09;
  white-space: pre-wrap;
  font-size: .87rem;
}
.chat-bubble--user { border-color: rgba(216, 166, 80, 0.35); background: rgba(216, 166, 80, 0.06); }
.chat-form { display: flex; gap: .6rem; }
.chat-form input {
  flex: 1;
  padding: .65rem .85rem;
  background: #0b0a08;
  border: 1px solid var(--line);
  color: var(--text);
  font: inherit;
}
.chat-form input:focus { border-color: var(--gold); outline: none; }

@media (max-width: 68rem) {
  .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-3, .grid-2 { grid-template-columns: 1fr; }
}
@media (max-width: 36rem) {
  .kpi-grid { grid-template-columns: 1fr; }
  .chat-form { flex-direction: column; }
}
`;

export const HQ_JS = `(() => {
  const csrf = document.documentElement.dataset.csrf || "";

  async function api(path, options = {}) {
    const headers = Object.assign({ "accept": "application/json" }, options.headers || {});
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

  // --- Login + 2FA Flow ---
  const loginForm = document.getElementById("login-form");
  const totpForm = document.getElementById("totp-form");
  const authError = document.getElementById("auth-error");
  let preAuthToken = "";

  function showAuthError(msg) {
    if (!authError) return;
    authError.textContent = msg;
    authError.hidden = !msg;
  }

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

  // --- Authenticated HQ Dashboard ---
  const dashboardRoot = document.getElementById("hq-dashboard");
  if (!dashboardRoot) return;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await api("/api/auth/logout", { body: {} }).catch(() => {});
      window.location.reload();
    });
  }

  const fmtInt = n => Number(n || 0).toLocaleString("en-US");
  const fmtUsd = n => "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function setStatusBadge(el, connected) {
    if (!el) return;
    el.textContent = connected ? "Live" : "Standby";
    el.className = "badge " + (connected ? "badge--live" : "badge--standby");
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

  let activeMessageId = "";

  async function loadSnapshot(fresh = false) {
    const refreshBtn = document.getElementById("refresh-btn");
    if (refreshBtn) refreshBtn.disabled = true;
    try {
      const data = await api("/api/overview" + (fresh ? "?fresh=1" : ""));
      const { ga4, steam, apple, inbox } = data;

      // KPIs
      document.getElementById("kpi-active").textContent = ga4.connected ? fmtInt(ga4.activeNow) : "Standby";
      document.getElementById("kpi-sessions").textContent = ga4.connected ? fmtInt(ga4.days30.sessions) : "Standby";
      document.getElementById("kpi-sessions-sub").textContent = ga4.connected
        ? fmtInt(ga4.days7.sessions) + " sessions (7d) · " + fmtInt(ga4.days30.pageViews) + " views (30d)"
        : "Awaiting GA4 credentials";

      document.getElementById("kpi-steam").textContent = steam.connected ? fmtUsd(steam.days30.netUsd) : "Standby";
      document.getElementById("kpi-steam-sub").textContent = steam.connected
        ? fmtInt(steam.days30.netUnits) + " net units (30d)"
        : "Awaiting Steamworks API key";

      document.getElementById("kpi-apple").textContent = apple.connected ? fmtUsd(apple.days7.proceedsUsd) : "Standby";
      document.getElementById("kpi-apple-sub").textContent = apple.connected
        ? fmtInt(apple.days7.downloads) + " downloads (7d)"
        : "Awaiting App Store .p8 key";

      document.getElementById("kpi-inbox").textContent = inbox.connected ? fmtInt(inbox.unreadCount) : "Standby";
      document.getElementById("kpi-inbox-sub").textContent = inbox.connected
        ? inbox.inboxAddress + " (" + fmtInt(inbox.totalInbox) + " in inbox)"
        : "Awaiting Gmail OAuth token";

      // GA4 Panel
      setStatusBadge(document.getElementById("ga4-badge"), ga4.connected);
      const ga4Hint = document.getElementById("ga4-hint");
      ga4Hint.textContent = ga4.connected ? "" : (ga4.error || ga4.setupHint || "");
      ga4Hint.hidden = Boolean(ga4.connected);
      renderList(
        document.getElementById("ga4-pages"),
        ga4.topPages,
        p => [p.path, fmtInt(p.views) + " views"],
        "No page data yet.",
      );
      renderList(
        document.getElementById("ga4-events"),
        ga4.events,
        e => [e.event, fmtInt(e.count)],
        "No tracked click events recorded yet.",
      );

      // Steam Panel
      setStatusBadge(document.getElementById("steam-badge"), steam.connected);
      const steamHint = document.getElementById("steam-hint");
      steamHint.textContent = steam.connected ? "" : (steam.error || steam.setupHint || "");
      steamHint.hidden = Boolean(steam.connected);
      renderList(
        document.getElementById("steam-list"),
        steam.connected
          ? [
              { label: "7-Day Net Revenue", value: fmtUsd(steam.days7.netUsd) + " (" + fmtInt(steam.days7.netUnits) + " units)" },
              { label: "30-Day Gross Sales", value: fmtUsd(steam.days30.grossUsd) },
              { label: "30-Day Net Revenue", value: fmtUsd(steam.days30.netUsd) },
              { label: "30-Day Returns", value: fmtInt(steam.days30.returns) + " units" },
              ...(steam.topCountries || []).map(c => ({ label: "Region · " + c.country, value: fmtUsd(c.netUsd) })),
            ]
          : [],
        row => [row.label, row.value],
        "Plug in STEAM_FINANCIAL_API_KEY when Byzantium store sales go live.",
      );

      // Apple Panel
      setStatusBadge(document.getElementById("apple-badge"), apple.connected);
      const appleHint = document.getElementById("apple-hint");
      appleHint.textContent = apple.connected ? "" : (apple.error || apple.setupHint || "");
      appleHint.hidden = Boolean(apple.connected);
      renderList(
        document.getElementById("apple-list"),
        apple.connected
          ? [
              { label: "7-Day Downloads (iOS / macOS)", value: fmtInt(apple.days7.downloads) },
              { label: "7-Day Paid Units", value: fmtInt(apple.days7.paidUnits) },
              { label: "7-Day Developer Proceeds (USD)", value: fmtUsd(apple.days7.proceedsUsd) },
            ]
          : [],
        row => [row.label, row.value],
        "Plug in App Store Connect .p8 credentials when iOS/macOS builds launch.",
      );

      // Inbox Panel
      setStatusBadge(document.getElementById("inbox-badge"), inbox.connected);
      const inboxHint = document.getElementById("inbox-hint");
      inboxHint.textContent = inbox.connected ? "" : (inbox.error || inbox.setupHint || "");
      inboxHint.hidden = Boolean(inbox.connected);
      const inboxUl = document.getElementById("inbox-list");
      inboxUl.textContent = "";
      if (inbox.connected && inbox.messages?.length) {
        for (const msg of inbox.messages) {
          const li = document.createElement("li");
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "inbox-item";
          btn.dataset.unread = String(Boolean(msg.unread));
          btn.dataset.id = msg.id;
          const top = document.createElement("div");
          top.className = "inbox-item__top";
          const fromSpan = document.createElement("span");
          fromSpan.textContent = msg.from;
          const dateSpan = document.createElement("span");
          dateSpan.textContent = msg.date ? msg.date.slice(0, 22) : "";
          top.append(fromSpan, dateSpan);
          const subj = document.createElement("div");
          subj.className = "inbox-item__subject";
          subj.textContent = msg.subject;
          const snip = document.createElement("div");
          snip.className = "small muted";
          snip.textContent = msg.snippet;
          btn.append(top, subj, snip);
          btn.addEventListener("click", () => openInboxMessage(msg.id, btn));
          li.appendChild(btn);
          inboxUl.appendChild(li);
        }
      }
    } finally {
      if (refreshBtn) refreshBtn.disabled = false;
    }
  }

  async function loadBrief(fresh = false) {
    const briefEl = document.getElementById("gemini-brief");
    const badgeEl = document.getElementById("gemini-badge");
    briefEl.textContent = "Synthesizing executive briefing...";
    try {
      const res = await api("/api/gemini/brief" + (fresh ? "?fresh=1" : ""), { body: {} });
      setStatusBadge(badgeEl, res.connected);
      briefEl.textContent = res.connected ? res.summary : (res.error || res.setupHint || "");
    } catch (err) {
      setStatusBadge(badgeEl, false);
      briefEl.textContent = err.message;
    }
  }

  async function openInboxMessage(id, buttonEl) {
    activeMessageId = id;
    for (const el of document.querySelectorAll(".inbox-item")) {
      el.dataset.active = String(el === buttonEl);
    }
    const reader = document.getElementById("thread-reader");
    const meta = document.getElementById("thread-meta");
    const body = document.getElementById("thread-body");
    const status = document.getElementById("reply-status");
    reader.hidden = false;
    status.textContent = "";
    body.textContent = "Loading message...";
    try {
      const msg = await api("/api/inbox/message?id=" + encodeURIComponent(id));
      meta.textContent = "From: " + msg.from + " · Subject: " + msg.subject;
      body.textContent = msg.body || "(Empty message)";
    } catch (err) {
      body.textContent = err.message;
    }
  }

  const draftBtn = document.getElementById("draft-reply-btn");
  if (draftBtn) {
    draftBtn.addEventListener("click", async () => {
      if (!activeMessageId) return;
      const textarea = document.getElementById("reply-textarea");
      const guidance = document.getElementById("reply-guidance").value.trim();
      const status = document.getElementById("reply-status");
      draftBtn.disabled = true;
      status.textContent = "Drafting reply with Gemini...";
      try {
        const res = await api("/api/gemini/draft-reply", {
          body: { messageId: activeMessageId, guidance },
        });
        textarea.value = res.draft || "";
        status.textContent = "Draft ready. Review carefully before clicking Approve & Send.";
      } catch (err) {
        status.textContent = err.message;
      } finally {
        draftBtn.disabled = false;
      }
    });
  }

  const sendReplyBtn = document.getElementById("send-reply-btn");
  if (sendReplyBtn) {
    sendReplyBtn.addEventListener("click", async () => {
      if (!activeMessageId) return;
      const textarea = document.getElementById("reply-textarea");
      const status = document.getElementById("reply-status");
      const bodyText = textarea.value.trim();
      if (!bodyText) {
        status.textContent = "Write or draft a reply before sending.";
        return;
      }
      if (!window.confirm("Send this reply now from contact@solivantstudios.com?")) return;
      sendReplyBtn.disabled = true;
      status.textContent = "Sending via Google Workspace...";
      try {
        await api("/api/inbox/send", { body: { messageId: activeMessageId, bodyText } });
        textarea.value = "";
        status.textContent = "Reply sent from contact@solivantstudios.com.";
      } catch (err) {
        status.textContent = err.message;
      } finally {
        sendReplyBtn.disabled = false;
      }
    });
  }

  // Gemini Studio Analyst Chat
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

  if (chatForm) {
    chatForm.addEventListener("submit", async event => {
      event.preventDefault();
      const input = chatForm.elements.question;
      const question = input.value.trim();
      if (!question) return;
      input.value = "";
      appendChat("user", question);
      const btn = chatForm.querySelector("button[type=submit]");
      btn.disabled = true;
      try {
        const res = await api("/api/gemini/chat", { body: { history: chatHistory, question } });
        appendChat("model", res.answer);
        chatHistory.push({ role: "user", text: question }, { role: "model", text: res.answer });
      } catch (err) {
        appendChat("model", "Error: " + err.message);
      } finally {
        btn.disabled = false;
      }
    });
  }

  const refreshBtn = document.getElementById("refresh-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadSnapshot(true);
      loadBrief(true);
    });
  }

  const refreshBriefBtn = document.getElementById("refresh-brief-btn");
  if (refreshBriefBtn) {
    refreshBriefBtn.addEventListener("click", () => loadBrief(true));
  }

  loadSnapshot(false);
  loadBrief(false);
})();
`;

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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

export function renderDashboardPage({ adminEmail, csrfToken }) {
  return `<!doctype html>
<html lang="en" data-csrf="${escapeHtml(csrfToken)}">
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
          <span class="eyebrow">Solivant Studios</span>
          <h1>Studio HQ</h1>
        </div>
        <div class="hq-toolbar">
          <span class="small muted mono">${escapeHtml(adminEmail)}</span>
          <button id="refresh-btn" class="btn btn--outline" type="button">Refresh Live Data</button>
          <button id="logout-btn" class="btn btn--outline" type="button">Sign Out</button>
        </div>
      </div>
    </header>

    <main id="hq-dashboard" class="hq-main">
      <section class="panel panel--gold" aria-labelledby="brief-heading">
        <div class="panel__head">
          <div>
            <p class="eyebrow">Gemini Executive Summary</p>
            <h2 id="brief-heading">Daily Studio Brief</h2>
          </div>
          <div class="hq-toolbar">
            <span id="gemini-badge" class="badge badge--standby">Checking</span>
            <button id="refresh-brief-btn" class="btn btn--outline" type="button">Regenerate</button>
          </div>
        </div>
        <div id="gemini-brief" class="brief-copy">Loading studio briefing...</div>
      </section>

      <section class="kpi-grid" aria-label="Key studio metrics">
        <div class="kpi">
          <p class="eyebrow">Active Right Now</p>
          <p id="kpi-active" class="kpi__value">...</p>
          <p class="kpi__sub">solivantstudios.com live</p>
        </div>
        <div class="kpi">
          <p class="eyebrow">Website Sessions (30d)</p>
          <p id="kpi-sessions" class="kpi__value">...</p>
          <p id="kpi-sessions-sub" class="kpi__sub">Loading GA4...</p>
        </div>
        <div class="kpi">
          <p class="eyebrow">Steam Net Sales (30d)</p>
          <p id="kpi-steam" class="kpi__value">...</p>
          <p id="kpi-steam-sub" class="kpi__sub">Steamworks API</p>
        </div>
        <div class="kpi">
          <p class="eyebrow">iOS / macOS Proceeds (7d)</p>
          <p id="kpi-apple" class="kpi__value">...</p>
          <p id="kpi-apple-sub" class="kpi__sub">App Store Connect</p>
        </div>
        <div class="kpi">
          <p class="eyebrow">Unread Studio Mail</p>
          <p id="kpi-inbox" class="kpi__value">...</p>
          <p id="kpi-inbox-sub" class="kpi__sub">contact@solivantstudios.com</p>
        </div>
      </section>

      <section class="grid-3">
        <article class="panel" aria-labelledby="ga4-heading">
          <div class="panel__head">
            <h2 id="ga4-heading">Website &amp; Byzantium (GA4)</h2>
            <span id="ga4-badge" class="badge">...</span>
          </div>
          <p id="ga4-hint" class="small muted" hidden></p>
          <p class="eyebrow">Top Pages (30d)</p>
          <ul id="ga4-pages" class="data-list"></ul>
          <div class="field">
            <label>Key Click Events (30d)</label>
            <ul id="ga4-events" class="data-list"></ul>
          </div>
        </article>

        <article class="panel" aria-labelledby="steam-heading">
          <div class="panel__head">
            <h2 id="steam-heading">Steamworks Sales</h2>
            <span id="steam-badge" class="badge">...</span>
          </div>
          <p id="steam-hint" class="small muted" hidden></p>
          <ul id="steam-list" class="data-list"></ul>
        </article>

        <article class="panel" aria-labelledby="apple-heading">
          <div class="panel__head">
            <h2 id="apple-heading">App Store (iOS &amp; macOS)</h2>
            <span id="apple-badge" class="badge">...</span>
          </div>
          <p id="apple-hint" class="small muted" hidden></p>
          <ul id="apple-list" class="data-list"></ul>
        </article>
      </section>

      <section class="grid-2">
        <article class="panel" aria-labelledby="inbox-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">Google Workspace</p>
              <h2 id="inbox-heading">contact@solivantstudios.com</h2>
            </div>
            <span id="inbox-badge" class="badge">...</span>
          </div>
          <p id="inbox-hint" class="small muted" hidden></p>
          <ul id="inbox-list" class="inbox-list"></ul>

          <div id="thread-reader" class="thread-reader" hidden>
            <p id="thread-meta" class="small mono"></p>
            <div id="thread-body" class="thread-body"></div>
            <div class="field">
              <label for="reply-guidance">Optional Direction for Gemini Draft</label>
              <input id="reply-guidance" type="text" placeholder="e.g. Thank them for reaching out and confirm press kit timing" />
            </div>
            <div class="hq-toolbar">
              <button id="draft-reply-btn" class="btn btn--outline" type="button">Draft Reply with Gemini</button>
            </div>
            <div class="field">
              <label for="reply-textarea">Reply Body (Manual Approval Required)</label>
              <textarea id="reply-textarea" rows="6" placeholder="Draft or write your reply here..."></textarea>
            </div>
            <div class="hq-toolbar">
              <button id="send-reply-btn" class="btn" type="button">Approve &amp; Send Reply</button>
              <span id="reply-status" class="small muted"></span>
            </div>
          </div>
        </article>

        <article class="panel panel--gold" aria-labelledby="analyst-heading">
          <div class="panel__head">
            <div>
              <p class="eyebrow">Gemini Studio Intelligence</p>
              <h2 id="analyst-heading">Ask Studio Analyst</h2>
            </div>
          </div>
          <div id="chat-log" class="chat-log">
            <div class="chat-bubble chat-bubble--model">Ask anything across your website traffic, Byzantium funnel, Steam sales, iOS/macOS proceeds, or studio inbox.</div>
          </div>
          <form id="chat-form" class="chat-form">
            <input name="question" type="text" placeholder="Ask Gemini about traffic, sales, or inbox..." required />
            <button class="btn" type="submit">Ask</button>
          </form>
        </article>
      </section>
    </main>
    <script src="/assets/hq.js" defer></script>
  </body>
</html>`;
}
