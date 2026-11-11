// Solivant Studios HQ · Imperial Command Deck Stylesheet (CSP style-src 'self' compliant).

export const HQ_CSS = `@font-face {
  font-family: "Cinzel";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("https://solivantstudios.com/fonts/cinzel-latin-400.woff2") format("woff2");
}
:root {
  color-scheme: dark;
  --bg: #080706;
  --surface: #110f0d;
  --surface-2: #171411;
  --surface-3: #1e1a16;
  --text: #f3efe6;
  --muted: #a39a8e;
  --gold: #d8a650;
  --gold-bright: #ecc374;
  --gold-dim: rgba(216, 166, 80, 0.16);
  --emerald: #52c48a;
  --slate: #7db4de;
  --clay: #e08e68;
  --danger: #e07a68;
  --line: #28211a;
  --line-bright: rgba(216, 166, 80, 0.36);
  --serif: "Cinzel", "Trajan Pro", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --mono: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
}
*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  background-color: var(--bg);
  background-image:
    radial-gradient(ellipse 90% 45% at 50% -10%, rgba(124, 72, 26, 0.34), transparent 70%),
    radial-gradient(ellipse 50% 40% at 90% 12%, rgba(216, 166, 80, 0.09), transparent 65%),
    radial-gradient(ellipse 45% 40% at 8% 65%, rgba(82, 196, 138, 0.05), transparent 65%);
  color: var(--text);
  font: 400 .92rem/1.58 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4, p { margin: 0; }
h1, h2, h3 { font-family: var(--serif); font-weight: 400; letter-spacing: .025em; }
[hidden] { display: none !important; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }

.eyebrow {
  color: var(--gold);
  font: 500 .63rem/1.4 var(--mono);
  text-transform: uppercase;
  letter-spacing: .16em;
}
.muted { color: var(--muted); }
.small { font-size: .8rem; }
.mono { font-family: var(--mono); font-size: .78rem; }

/* Buttons & Segmented Controls */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  min-height: 2.35rem;
  padding: .48rem 1rem;
  border: 1px solid var(--gold);
  background: var(--gold);
  color: #090807;
  font: 600 .71rem/1 -apple-system, BlinkMacSystemFont, sans-serif;
  text-transform: uppercase;
  letter-spacing: .09em;
  text-decoration: none;
  cursor: pointer;
  transition: background .18s, border-color .18s, color .18s, transform .12s;
}
.btn:hover:not(:disabled) { background: var(--gold-bright); border-color: var(--gold-bright); }
.btn:active:not(:disabled) { transform: translateY(1px); }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.btn--outline {
  background: rgba(255, 255, 255, 0.015);
  border-color: var(--line);
  color: var(--text);
}
.btn--outline:hover:not(:disabled) {
  border-color: var(--gold);
  color: var(--gold-bright);
  background: rgba(216, 166, 80, 0.08);
}
.btn--ghost {
  background: rgba(216, 166, 80, 0.08);
  border-color: rgba(216, 166, 80, 0.28);
  color: var(--gold-bright);
}
.btn--ghost:hover:not(:disabled) {
  background: rgba(216, 166, 80, 0.16);
  border-color: var(--gold);
}
.btn--sm { min-height: 1.95rem; padding: .35rem .72rem; font-size: .66rem; }

.seg-group {
  display: inline-flex;
  border: 1px solid var(--line);
  background: #0b0a08;
  padding: .15rem;
  gap: .15rem;
}
.seg-btn {
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 .66rem/1 var(--mono);
  text-transform: uppercase;
  letter-spacing: .1em;
  padding: .42rem .7rem;
  cursor: pointer;
  transition: background .18s, color .18s;
}
.seg-btn:hover { color: var(--text); }
.seg-btn[aria-pressed="true"] {
  background: rgba(216, 166, 80, 0.18);
  color: var(--gold-bright);
  box-shadow: inset 0 0 0 1px rgba(216, 166, 80, 0.42);
}

/* Auth & Onboarding Gate */
.auth-shell { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; }
.auth-card {
  width: min(100%, 27.5rem);
  padding: 2.25rem 2rem;
  background: var(--surface);
  border: 1px solid var(--line-bright);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.65);
}
.auth-card h1 { font-size: 1.75rem; margin-top: .5rem; }
.auth-card > p.muted { margin-top: .45rem; font-size: .88rem; }
.field { display: grid; gap: .38rem; margin-top: 1rem; }
.field label {
  font: 500 .64rem/1.4 var(--mono);
  text-transform: uppercase;
  letter-spacing: .14em;
  color: var(--muted);
}
.field input, .field select, textarea {
  width: 100%;
  padding: .65rem .82rem;
  background: #0a0907;
  border: 1px solid var(--line);
  color: var(--text);
  font: inherit;
}
.field input:focus, .field select:focus, textarea:focus { border-color: var(--gold); outline: none; }
.otp-input { font: 500 1.4rem/1.2 var(--mono) !important; letter-spacing: .32em; text-align: center; }
.auth-actions { margin-top: 1.35rem; display: grid; gap: .6rem; }
.setup-key-box {
  margin-top: .5rem;
  padding: .7rem .85rem;
  background: #0b0a08;
  border: 1px solid var(--line);
  font: 500 .84rem/1.5 var(--mono);
  letter-spacing: .08em;
  word-break: break-all;
  color: var(--gold-bright);
}
.alert {
  margin-top: 1rem;
  padding: .7rem .85rem;
  border: 1px solid rgba(224, 122, 104, 0.45);
  background: rgba(224, 122, 104, 0.1);
  color: #f3c4ba;
  font-size: .82rem;
}

/* Sticky Command Header */
.hq-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(8, 7, 6, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(216, 166, 80, 0.18);
}
.hq-header__inner {
  max-width: 90rem;
  margin: 0 auto;
  padding: .8rem clamp(1rem, 2.5vw, 2.25rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.hq-brand { display: flex; align-items: center; gap: .85rem; }
.hq-brand__dot {
  width: .55rem;
  height: .55rem;
  border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 10px var(--emerald);
}
.hq-brand__dot[data-sim="true"] {
  background: var(--gold);
  box-shadow: 0 0 10px var(--gold);
}
.hq-brand h1 { font-size: 1.2rem; text-transform: uppercase; letter-spacing: .06em; }
.hq-toolbar { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }

/* Main Deck Layout */
.hq-main {
  max-width: 90rem;
  margin: 0 auto;
  padding: 1.5rem clamp(1rem, 2.5vw, 2.25rem) 4rem;
  display: grid;
  gap: 1.35rem;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: .38rem;
  padding: .2rem .55rem;
  font: 500 .6rem/1.3 var(--mono);
  text-transform: uppercase;
  letter-spacing: .12em;
  border: 1px solid var(--line);
  color: var(--muted);
}
.badge--live { border-color: rgba(82, 196, 138, 0.45); color: #c4f0d8; background: rgba(82, 196, 138, 0.1); }
.badge--sim { border-color: rgba(216, 166, 80, 0.45); color: var(--gold-bright); background: rgba(216, 166, 80, 0.1); }
.badge--standby { border-color: rgba(255, 255, 255, 0.14); color: var(--muted); }
.badge--press { border-color: rgba(216, 166, 80, 0.5); color: var(--gold-bright); background: rgba(216, 166, 80, 0.12); }
.badge--support { border-color: rgba(125, 180, 222, 0.5); color: #cde3f5; background: rgba(125, 180, 222, 0.12); }
.badge--partnership { border-color: rgba(82, 196, 138, 0.5); color: #c6f0da; background: rgba(82, 196, 138, 0.12); }
.badge--high { border-color: rgba(224, 122, 104, 0.55); color: #f6c4bb; background: rgba(224, 122, 104, 0.14); }

/* Gemini Command Deck Banner */
.gemini-deck {
  background:
    linear-gradient(135deg, rgba(216, 166, 80, 0.09) 0%, rgba(17, 15, 13, 0.96) 45%, rgba(17, 15, 13, 0.98) 100%);
  border: 1px solid rgba(216, 166, 80, 0.38);
  padding: 1.25rem 1.4rem;
  display: grid;
  gap: 1rem;
}
.gemini-deck__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.gemini-deck__title { display: flex; align-items: center; gap: .8rem; }
.gemini-deck__spark {
  color: var(--gold-bright);
  font-size: 1.15rem;
  line-height: 1;
}
.gemini-deck__chips { display: flex; flex-wrap: wrap; gap: .5rem; }
.brief-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: .85rem;
}
.brief-card {
  background: rgba(9, 8, 7, 0.65);
  border: 1px solid var(--line);
  padding: .85rem 1rem;
}
.brief-card__label {
  font: 600 .6rem/1.3 var(--mono);
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: .35rem;
}
.brief-card__body {
  font-size: .84rem;
  color: var(--text);
  line-height: 1.5;
}
.brief-raw {
  white-space: pre-wrap;
  font-size: .88rem;
  line-height: 1.65;
  color: var(--text);
  padding: .85rem 1rem;
  background: rgba(9, 8, 7, 0.6);
  border: 1px solid var(--line);
}

/* Interactive KPI Strip with Mini Sparklines */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: .85rem;
}
.kpi-card {
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1rem 1.1rem .85rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: .45rem;
  transition: border-color .2s, background .2s, transform .15s;
}
.kpi-card:hover {
  border-color: rgba(216, 166, 80, 0.45);
  background: var(--surface-2);
}
.kpi-card[data-selected="true"] {
  border-color: var(--gold);
  background: linear-gradient(180deg, rgba(216, 166, 80, 0.1) 0%, var(--surface) 100%);
  box-shadow: inset 0 2px 0 var(--gold);
}
.kpi-card__head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; width: 100%; }
.kpi-card__delta {
  font: 500 .64rem/1 var(--mono);
  color: var(--emerald);
}
.kpi-card__value {
  font: 400 clamp(1.35rem, 2vw, 1.85rem)/1.1 var(--serif);
  color: var(--text);
}
.kpi-card__sub { font-size: .74rem; color: var(--muted); }
.kpi-spark { width: 100%; height: 26px; display: block; margin-top: .2rem; }

/* Interactive Visual Telemetry Stage */
.stage-panel {
  scroll-margin-top: 5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1.3rem 1.4rem;
}
.stage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: .95rem;
  border-bottom: 1px solid var(--line);
}
.stage-controls { display: flex; align-items: center; gap: .65rem; flex-wrap: wrap; }
.stage-body {
  display: grid;
  grid-template-columns: 1.65fr 1fr;
  gap: 1.5rem;
  padding-top: 1.15rem;
  align-items: stretch;
}
.chart-wrap {
  position: relative;
  background: #0a0907;
  border: 1px solid var(--line);
  padding: .9rem 1rem .65rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 20rem;
}
.chart-readout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 1.6rem;
  padding-bottom: .45rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font: 500 .74rem/1.3 var(--mono);
  color: var(--gold-bright);
}
.chart-svg {
  width: 100%;
  height: 260px;
  display: block;
  cursor: crosshair;
  overflow: visible;
}
.chart-legend {
  display: flex;
  gap: 1.15rem;
  flex-wrap: wrap;
  padding-top: .45rem;
  font: 500 .68rem/1.3 var(--mono);
  color: var(--muted);
}
.legend-item { display: inline-flex; align-items: center; gap: .4rem; }
.legend-swatch { width: .6rem; height: .6rem; display: inline-block; }
.swatch--gold { background: var(--gold); }
.swatch--slate { background: var(--slate); }
.swatch--emerald { background: var(--emerald); }
.swatch--clay { background: var(--clay); }

/* Right Side Breakdown Card (Donut + Bars) */
.breakdown-wrap {
  background: #0a0907;
  border: 1px solid var(--line);
  padding: 1rem 1.15rem;
  display: flex;
  flex-direction: column;
  gap: .95rem;
}
.donut-row {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}
.donut-svg { width: 112px; height: 112px; flex-shrink: 0; }
.donut-meta { display: grid; gap: .32rem; flex: 1; }
.bar-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .6rem; }
.bar-item { display: grid; gap: .25rem; font-size: .8rem; }
.bar-item__top { display: flex; justify-content: space-between; gap: .75rem; }
.bar-track { height: 5px; background: rgba(255, 255, 255, 0.06); overflow: hidden; }
.bar-fill { height: 100%; background: var(--gold); }
.bar-fill[data-tone="1"] { background: var(--slate); }
.bar-fill[data-tone="2"] { background: var(--emerald); }
.bar-fill[data-tone="3"] { background: var(--clay); }

/* Operations Workspace: Inbox Prep Studio + Gemini Analyst */
.ops-grid {
  display: grid;
  grid-template-columns: 1.35fr .95fr;
  gap: 1.35rem;
  align-items: start;
}
.panel {
  scroll-margin-top: 5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  padding: 1.25rem 1.35rem;
}
.panel--gold { border-color: rgba(216, 166, 80, 0.35); }
.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .85rem;
  flex-wrap: wrap;
  padding-bottom: .85rem;
  border-bottom: 1px solid var(--line);
  margin-bottom: 1rem;
}
.panel__head h2 { font-size: 1.08rem; text-transform: uppercase; }

/* Inbox Split Workbench */
.inbox-workbench {
  display: grid;
  grid-template-columns: .92fr 1.08fr;
  gap: 1rem;
  align-items: start;
}
.inbox-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: .45rem;
  max-height: 31rem;
  overflow-y: auto;
}
.inbox-item {
  width: 100%;
  text-align: left;
  padding: .75rem .85rem;
  background: var(--surface-2);
  border: 1px solid var(--line);
  color: var(--text);
  cursor: pointer;
  display: grid;
  gap: .28rem;
  transition: border-color .15s, background .15s;
}
.inbox-item:hover { border-color: rgba(216, 166, 80, 0.45); }
.inbox-item[data-active="true"] {
  border-color: var(--gold);
  background: rgba(216, 166, 80, 0.07);
}
.inbox-item__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: .5rem;
  font-size: .72rem;
  color: var(--muted);
}
.inbox-item__tags { display: flex; flex-wrap: wrap; gap: .35rem; }
.inbox-item__subject { font-weight: 600; font-size: .85rem; color: var(--text); }
.inbox-item[data-unread="true"] .inbox-item__subject { color: var(--gold-bright); }
.inbox-item__gist { font-size: .76rem; color: #d6cec0; line-height: 1.4; }

.composer-pane {
  background: #0b0a08;
  border: 1px solid var(--line);
  padding: 1rem;
  display: grid;
  gap: .8rem;
}
.gist-callout {
  padding: .65rem .8rem;
  background: rgba(216, 166, 80, 0.08);
  border-left: 2px solid var(--gold);
  font-size: .81rem;
  color: var(--text);
}
.thread-body {
  max-height: 9.5rem;
  overflow-y: auto;
  padding: .75rem;
  background: #070605;
  border: 1px solid var(--line);
  white-space: pre-wrap;
  font-size: .8rem;
  color: var(--muted);
}
.preset-bar { display: flex; flex-wrap: wrap; gap: .38rem; }

/* Gemini Studio Analyst Chat */
.chat-log {
  display: grid;
  gap: .65rem;
  max-height: 24rem;
  overflow-y: auto;
  padding-right: .2rem;
  margin-bottom: .85rem;
}
.chat-bubble {
  padding: .75rem .9rem;
  border: 1px solid var(--line);
  background: #0a0907;
  white-space: pre-wrap;
  font-size: .85rem;
  line-height: 1.58;
}
.chat-bubble--user {
  border-color: rgba(216, 166, 80, 0.4);
  background: rgba(216, 166, 80, 0.08);
  margin-left: 1.5rem;
}
.chat-prompts { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: .75rem; }
.chat-form { display: flex; gap: .5rem; }
.chat-form input {
  flex: 1;
  padding: .62rem .82rem;
  background: #0a0907;
  border: 1px solid var(--line);
  color: var(--text);
  font: inherit;
}
.chat-form input:focus { border-color: var(--gold); outline: none; }

/* Channel Summary Strip */
.channel-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}
.data-list { list-style: none; margin: 0; padding: 0; display: grid; gap: .42rem; }
.data-list li {
  display: flex;
  justify-content: space-between;
  gap: .75rem;
  padding-block: .36rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: .82rem;
}
.data-list li:last-child { border-bottom: 0; }

/* Connections Modal Drawer */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(0, 0, 0, 0.76);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1.25rem;
}
.modal-card {
  width: min(100%, 42rem);
  max-height: 88vh;
  overflow-y: auto;
  background: var(--surface);
  border: 1px solid var(--line-bright);
  padding: 1.5rem 1.65rem;
  display: grid;
  gap: 1.1rem;
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.8);
}
.conn-form { display: grid; gap: .9rem; }
.conn-group {
  border: 1px solid var(--line);
  background: #0b0a08;
  padding: 1rem 1.1rem;
  display: grid;
  gap: .65rem;
}
.conn-group__head { display: flex; justify-content: space-between; align-items: center; gap: .75rem; }

@media (max-width: 74rem) {
  .kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .brief-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .stage-body, .ops-grid, .inbox-workbench, .channel-grid { grid-template-columns: 1fr; }
}
@media (max-width: 42rem) {
  .kpi-grid, .brief-grid { grid-template-columns: 1fr; }
  .chat-form { flex-direction: column; }
}
`;
