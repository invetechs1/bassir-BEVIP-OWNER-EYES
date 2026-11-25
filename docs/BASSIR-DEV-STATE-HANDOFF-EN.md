# Bassir — Owner Eyes | Developer Handoff: What's Done & Current State

> For the system's developer: a summary of what was built, the current state of the code and deployment, the routes and files, and what remains for production.
> Last updated: November 2026 · Branch: `claude/bassir-owner-eyes-system-aogee5` → merged into `main`.

---

## 1) Quick summary (what's done)
On top of the core "Bassir — Owner Eyes" system, a full **commercialization layer + bilingual public website + sales tooling** were added:
- **Sales layer (SaaS):** create tenants, per-project billing (2,000 SAR/project/month), automatic invoices, auto activate/suspend, and a platform-owner dashboard (client count, MRR revenue, growth, conversion funnel).
- **Full marketing website** (Arabic + English) as the domain homepage.
- **Subscribe & pay page** (Arabic + English) with simulated payment.
- **Platform-owner login** from both the website and the app (hidden gate).
- **Full localization** of the Progress Map and BIM viewer screens.
- **Sales tooling:** pricing strategy, marketing plan, sales playbook, and a pitch deck (Slides) — under `docs/`.

> All of the above is **merged into `main`** and auto-deploys.

---

## 2) Routes — current state
The server `server/server.js` maps public paths to static pages; the rest are API:

| Path | Content |
|---|---|
| `/` | Marketing website (Arabic) — `public/site.html` |
| `/en` | Marketing website (English) — `public/site-en.html` |
| `/app` | **The app** (client & platform-owner login) — `public/index.html` (SPA) |
| `/landing.html` or `/subscribe` | Subscribe & pay page (Arabic) |
| `/landing-en.html` or `/subscribe-en` | Subscribe & pay page (English) |
| `/deck` | Sales pitch deck — `public/deck.html` |

**Important:** the domain root `/` is now the **website**, and the app moved to **`/app`**.

### API routes (sales platform)
Public (no auth — for website/subscribe pages):
`GET /api/platform/plans` · `POST /api/platform/visit` · `POST /api/platform/register` · `POST /api/platform/subscribe`

Platform owner (`platform_admin`/`admin`):
`GET /api/platform/state` · `POST /api/actions/platform-create-tenant` · `platform-pay-invoice` · `platform-set-status` · `platform-run-billing`

---

## 3) Key pages and files
**Public pages (`public/`):** `site.html` (website AR), `site-en.html` (website EN), `landing.html` (subscribe AR), `landing-en.html` (subscribe EN), `deck.html` (sales deck), `index.html` (SPA app).

**Front-end scripts (`public/js/`):** `app.js` (the app + the hidden platform-owner gate), `api.js` (transport layer + platform methods), `views*.js` + `views-platform.js` (platform-owner dashboard), `bim-viewer.js`, `site.js` + `landing.js` + `deck.js` (public-page scripts — bilingual), `i18n.js`, `charts.js`, `viewer.js`.

**Shared core (`shared/`):** `api-core.js` (billing & stats engine; constant `DEFAULT_PRICE = 2000`), `seed-data.js` (plans, tenants, invoices, the `biz` user, the visit counter).

**Server:** `server/server.js` (Node, SQLite, file uploads, **CSP**, static routing + API).

**Static demo:** `tools/build-demo.js` → `demo/bassir-demo.html` (runs without a server).

**Sales tooling (`docs/`):** `BASSIR-PRICING-STRATEGY-AR` (pricing strategy), `BASSIR-SALES-PLAYBOOK-AR` (sales playbook), `Bassir-Sales-Deck-AR.pdf` (the deck), `BASSIR-DEV-HANDOFF-AR` and `SAAS-COMMERCIALIZATION` (sales-layer details). Each usually has an MD + PDF.

---

## 4) Login accounts
| Account | User/Pass | Role |
|---|---|---|
| Owner | `owner / owner123` | owner |
| Owner's rep | `rep / rep123` | owner_rep |
| Consultant | `consultant / consult123` | consultant |
| Project manager | `pm / pm123` | project_manager |
| Contractor | `cont-str / cont123` · `cont-arch / cont123` | contractor |
| Admin | `admin / admin123` | admin |
| **Platform owner** | `biz / biz123` | **platform_admin** |

**Platform-owner login:** from the website via the "Platform owner login" button (footer) → password modal → `/app#biz-overview`. Or on the `/app` page, **triple-click the eye logo 👁** to reveal the gate.

---

## 5) Data model (summary)
**Tenant:** `id, companyName, contactName, email, phone, planId, pricePerProject, projectCount, status (active|trial|suspended|pending), createdAt, activatedAt, subscriptionStart, subscriptionEnd, billingCycle, nextInvoiceDate, lastPaymentAt, usersCount, cardLast4`.
**Invoice:** `id, number, tenantId, period, projectCount, pricePerProject, amount, currency, status (paid|unpaid|overdue), issuedAt, dueAt, paidAt, method, cardLast4`.
**`platformStats` metrics:** tenants/active/projects/users counts, MRR/ARR, revenue, monthly growth, visits, conversion rate, outstanding.

---

## 6) ⚠️ What remains before launch (developer tasks)
1. **Real payment gateway (most important):** payment is currently **simulated** in `chargeCard(card, amount)` in `shared/api-core.js`. Integrate **Moyasar/Tap**: tokenize the card on the subscribe page, charge server-side with an `.env` secret, and add a confirmation **Webhook** (idempotent). Details in `docs/SAAS-COMMERCIALIZATION`.
2. **Billing schedule:** call `runBilling` daily via Cron (currently manual via a dashboard button).
3. **Platform-owner password:** change `biz/biz123`, and make the owner gate require the password in production.
4. **Content Security Policy (CSP):** the server blocks inline scripts (`script-src 'self'`). **Any new script must be an external file** loaded via `src` (as in `js/site.js`, `js/landing.js`, `js/deck.js`) — no inline `<script>…</script>`.
5. **(Optional)** the Progress Map & BIM screenshots on the English site are now fully English after the app localization; any remaining Arabic is **data** (item/project names) that is not translated.

---

## 7) Run & deploy
```bash
npm install
npm start        # http://localhost:3000  (website at /, app at /app)
```
- **Deploy:** from the `main` branch (hosting auto-redeploys after merge).
- **Build the static demo:** `node tools/build-demo.js`.
- **Reference verification done:** a 6-role crawl = 81 page-visits / 0 errors, plus testing all public pages and the subscribe/pay flow on the real server.

---

## 8) Important operational notes
- **Repository rename:** the GitHub repo was renamed to **`invetechs1/bassir-BEVIP-OWNER-EYES`** (the old name `BEVIP-OWNER-EYES` redirects). Use the new name for GitHub operations.
- **Transient GitHub error:** during the last merge, transient server errors (500/502) appeared from GitHub while the merge **actually completed** (PR #35 appears in the `main` log). If you see a similar inconsistency in the future, check the `main` log before retrying.
- **Branch:** all work is on `claude/bassir-owner-eyes-system-aogee5` and is merged into `main` via Pull Requests.

> For commercial details, pricing, and the sales playbook, see the `docs/` files listed in section (3).
