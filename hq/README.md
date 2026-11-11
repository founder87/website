# Solivant Studios HQ (`hq.solivantstudios.com`)

Private, 2FA-protected founder command center unifying:
1. **Email + Password + TOTP 2FA Login** (RFC 6238 Authenticator codes, PBKDF2-SHA256 210k iterations, `HttpOnly; Secure; SameSite=Strict` cookies, CSRF protection, IP lockout, and TOTP replay prevention).
2. **Gemini Studio Intelligence** (`gemini-2.5-flash`):
   - **Daily Studio Brief** synthesizing website funnel, sales, and unread mail
   - **Ask Studio Analyst** multi-turn chat grounded in live telemetry
   - **One-Click Email Reply Drafter** (manual founder approval required before sending)
3. **Google Analytics 4 (`GA4 Data API`):** Real-time visitors, 7d/30d sessions, `/projects/byzantium/` views, and custom click events.
4. **Google Workspace Inbox (`Gmail API`):** Unread count, inbox reader, and manual-approved replies from `contact@solivantstudios.com`.
5. **Steamworks Sales (`IPartnerFinancialsService`):** 7d/30d net units, gross & net USD, returns, and top regions.
6. **Apple App Store Connect (`v1/salesReports`):** ES256 `.p8` signed daily gzipped TSV aggregation for iOS, iPadOS, and macOS downloads and developer proceeds.

The public website (`solivantstudios.com`) remains **100% static** on GitHub Pages with zero backend attack surface.

---

## 1. Generate Your Login + 2FA Secrets

Run from the `website/` directory:

```sh
npm run hq:setup
```

1. Scan or paste the printed **Setup Key** (`HQ_TOTP_SECRET`) into **Apple Passwords**, **1Password**, or **Google Authenticator**.
2. Copy the 4 generated values into `hq/.dev.vars` (gitignored) to test locally:
   ```sh
   npm run hq:dev
   # Open http://127.0.0.1:8788
   ```

---

## 2. Plug In Connectors (In Any Order)

Every connector is optional; unconfigured panels stay in clean **Standby** mode and light up automatically once their secret is added:

| Connector | Secrets |
| --- | --- |
| **Gemini AI** | `GEMINI_API_KEY` (from Google AI Studio) |
| **Website GA4** | `GA4_PROPERTY_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (Service Account granted Viewer on your GA4 property) |
| **Studio Inbox (`contact@solivantstudios.com`)** | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` (OAuth 2.0 Web/Desktop client authorized for `https://www.googleapis.com/auth/gmail.modify` and `https://www.googleapis.com/auth/gmail.send`) |
| **Steamworks** | `STEAM_FINANCIAL_API_KEY` (Steamworks Partner Financial Web API group key) |
| **Apple App Store** | `APPLE_ISSUER_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (`.p8` PEM), `APPLE_VENDOR_NUMBER` |

---

## 3. Deploy to `hq.solivantstudios.com` (Cloudflare Workers Free Tier)

1. Authenticate Wrangler once (`npx wrangler login`) and upload your secrets (never stored in Git):
   ```sh
   npx wrangler secret put HQ_ADMIN_EMAIL --config hq/wrangler.toml
   npx wrangler secret put HQ_PASSWORD_HASH --config hq/wrangler.toml
   npx wrangler secret put HQ_TOTP_SECRET --config hq/wrangler.toml
   npx wrangler secret put HQ_SESSION_SECRET --config hq/wrangler.toml
   npx wrangler secret put GEMINI_API_KEY --config hq/wrangler.toml
   ```
2. Deploy the Worker:
   ```sh
   npx wrangler deploy --config hq/wrangler.toml
   ```
3. Attach `hq.solivantstudios.com` under **Workers & Pages -> solivant-hq -> Settings -> Domains & Routes** (keeping `solivantstudios.com` pointing to GitHub Pages).
