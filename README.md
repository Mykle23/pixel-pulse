<div align="center">

# 📡 PixelPulse

### Know When Someone Views Your Work

Track visits to your GitHub projects, websites, and emails with a single invisible image.
Generate shields.io-style badges with live counters — fully self-hosted, privacy-first.

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-File--based-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

[Quick Start](#-quick-start) · [Use Cases](#-use-cases) · [Dashboard](#-dashboard) · [API Reference](#-api-reference) · [Configuration](#-configuration)

</div>

---

## Why PixelPulse?

You built something — a project, a portfolio, a tool. You shared it. But then... silence. Did anyone actually look at it? Did that recruiter open your email? Is anyone reading your documentation?

**You have no way of knowing.**

GitHub shows clone counts but not README views. Your personal website needs an expensive analytics tool. Emails give you zero feedback unless you pay for a marketing platform.

PixelPulse solves this with the simplest trick in web tracking: **a 1x1 invisible image**. Embed it anywhere that renders images — and the moment someone opens that page, you know.

### What can you track?

| Scenario | How it works |
| :--- | :--- |
| **GitHub project** | Add a pixel to your `README.md` — every time someone opens the page, you get a visit |
| **Personal website** | Embed a pixel or badge on any page to track real visitors vs. bots |
| **Email outreach** | Add an invisible pixel to your HTML email — know exactly who opened it and when |
| **Documentation** | Track which docs pages get read and which are ignored |
| **Multiple projects** | Each pixel gets a unique label — track everything from one dashboard |

### What do you get?

- **Visit count** — total and unique visitors per label
- **Geography** — which countries your visitors come from
- **Devices** — browser, OS, device type breakdown
- **Bot detection** — separate human traffic from Googlebot, bingbot, and crawlers
- **Referrers** — where your visitors are coming from
- **Timeline** — visit trends over days, weeks, and months
- **Badges** — customizable shields.io-style SVGs with live counters to show off in your README

---

## Table of Contents

- [Why PixelPulse?](#why-pixelpulse)
- [Use Cases](#-use-cases)
- [Quick Start](#-quick-start)
- [Dashboard](#-dashboard)
- [Badge Creator](#-badge-creator)
- [API Reference](#-api-reference)
- [Badge Reference](#-badge-reference)
- [Configuration](#-configuration)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Privacy](#-privacy)
- [License](#-license)

---

## 💡 Use Cases

### Track your GitHub README

Someone clones your repo and opens the README? You'll know.

```markdown
<!-- Add this anywhere in your README.md — it's invisible -->
![](https://your-server.com/pixel/my-awesome-project.gif)
```

Want a visible counter instead? Use a badge:

```markdown
![visitors](https://your-server.com/badge/my-awesome-project.svg?label=visitors&color=green&logo=github)
```

### Track email opens

Add a pixel to your HTML emails. When the recipient opens the email and their client loads images, you get a notification in your dashboard.

```html
<img src="https://your-server.com/pixel/recruiter-email-jan.gif" alt="" width="1" height="1" style="display:none" />
```

### Track website pages

Embed a pixel on any page of your site. Unlike heavyweight analytics tools, this adds **zero JavaScript** and **zero latency** to your page.

```html
<!-- In your HTML <body> -->
<img src="https://your-server.com/pixel/portfolio-home.gif" alt="" width="1" height="1" />
```

### Track multiple projects from one place

Every pixel gets a unique label. Track all your projects, pages, and emails from a single dashboard:

```
/pixel/project-alpha.gif     → tracks Project Alpha README
/pixel/portfolio-about.gif   → tracks your About page
/pixel/email-cold-outreach.gif → tracks a specific email campaign
/badge/my-tool.svg           → visible badge with live counter
```

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [pnpm](https://pnpm.io/) (recommended) or npm

### 1. Clone the repository

```bash
git clone https://github.com/Mykle23/pixel-pulse.git
cd pixel-pulse
```

### 2. Install dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

### 3. Configure the backend

```bash
cd ../backend
cp .env.example .env
```

Open `.env` and configure at minimum the `IP_SALT`. Optionally set `API_KEY` to protect the stats endpoints:

```env
# Required — random string for IP hashing
IP_SALT=my-super-secret-random-salt

# Optional — protects /api/* routes
API_KEY=my-dashboard-password

# Database (defaults to SQLite file in project root)
DATABASE_URL=file:./dev.db
```

### 4. Initialize the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Start both servers

```bash
# Terminal 1 — Backend (port 3001)
cd backend
pnpm dev

# Terminal 2 — Frontend (port 5173)
cd frontend
pnpm dev
```

Open `http://localhost:5173` to access the dashboard. The frontend proxies API calls to the backend automatically.

### 6. Embed your first pixel

Add this to any GitHub README or HTML page (replace with your server URL):

```markdown
![](http://localhost:3001/pixel/my-first-test.gif)
```

Open the page, then check the dashboard — your visit should appear within seconds.

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🖥 Dashboard

PixelPulse includes a full analytics dashboard built with React:

- **Overview** — Total visits, unique visitors, human vs. bot traffic at a glance
- **Label Management** — Search, sort, paginate, multi-select, and bulk delete labels
- **Label Detail** — Per-label drill-down with timeline, device/browser/OS breakdown, bot list, and referrers
- **Analytics page** — Cross-label visualizations including:
  - Label treemap (sized by visits, colored by growth)
  - Stacked area timeline comparing top labels
  - Interactive world map with geographic distribution
  - Browser, OS, and device distribution (pie charts)
  - Hourly activity chart
  - Top referrers ranking

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🏷 Badge Creator

The dashboard includes a visual badge editor with live preview. You can:

- Choose between **counter** (live visit count), **static** (custom text), and **pixel** (invisible tracking) modes
- Customize label, message, colors, style, logo (any [Simple Icons](https://simpleicons.org/) icon), and link URL
- Copy ready-to-paste **Markdown**, **HTML**, or **URL** snippets
- Browse a gallery of **~200 pre-configured developer badges** (TypeScript, React, Docker, AWS, etc.) and apply them with one click

**Badge examples:**

```
# Live visitor counter
/badge/my-repo.svg?label=visitors&color=green&logo=github

# Static tech badge
/badge/preview.svg?label=TypeScript&message=5.9&color=3178C6&logo=typescript&logoColor=white&preview=true

# Message-only badge
/badge/preview.svg?label=&message=Hello+World&color=blue&preview=true

# Icon-only badge
/badge/preview.svg?label=&color=black&logo=github&logoColor=white&preview=true

# Clickable badge
/badge/my-repo.svg?label=GitHub&message=Star&color=yellow&logo=github&link=https://github.com/Mykle23/pixel-pulse
```

Full parameter reference in the [Badge Reference](#-badge-reference) section.

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 📡 API Reference

### Pixel Endpoints (public)

| Endpoint | Content-Type | Description |
| :--- | :--- | :--- |
| `GET /pixel/:label.gif` | `image/gif` | 1x1 transparent GIF pixel |
| `GET /pixel/:label.svg` | `image/svg+xml` | 1x1 transparent SVG pixel |
| `GET /badge/:label.svg` | `image/svg+xml` | Dynamic SVG badge with visit counter |

All pixel and badge endpoints:
- Return `Cache-Control: no-cache, no-store, must-revalidate`
- Register the visit asynchronously (response is sent first, zero added latency)
- Are rate-limited to **100 requests/IP/minute**

**Data collected per visit:**

| Field | Source |
| :--- | :--- |
| `ipHash` | SHA-256 of IP + salt (anonymized) |
| `country`, `city` | Local GeoIP lookup (MaxMind) |
| `browser`, `os`, `deviceType` | User-Agent parsing |
| `isBot`, `botName` | Bot detection |
| `referer` | Referer header |

---

### `GET /api/stats` (protected)

Returns an overview across all labels. Rate-limited to **120 requests/IP/minute**.

```json
{
  "totalVisits": 1420,
  "uniqueVisitors": 389,
  "botVisits": 230,
  "labels": [
    {
      "label": "portfolio-home",
      "total": 800,
      "unique": 210,
      "bots": 120,
      "lastSeen": "2026-02-11T18:30:00.000Z",
      "topCountry": "ES"
    }
  ]
}
```

---

### `GET /api/stats/:label` (protected)

Returns detailed stats for a single label.

| Param | Default | Description |
| :--- | :--- | :--- |
| `from` | — | Start date (`YYYY-MM-DD`) |
| `to` | — | End date (`YYYY-MM-DD`) |
| `includeBots` | `true` | Set to `false` to exclude bot traffic |

```json
{
  "label": "portfolio-home",
  "total": 800,
  "unique": 210,
  "bots": 120,
  "timeline": [
    { "date": "2026-02-10", "visits": 45, "unique": 18 }
  ],
  "countries": [{ "country": "ES", "visits": 300 }],
  "devices": [{ "deviceType": "desktop", "visits": 600 }],
  "browsers": [{ "browser": "Chrome 121", "visits": 400 }],
  "topBots": [{ "botName": "Googlebot", "visits": 80 }],
  "referers": [{ "referer": "google.com", "visits": 150 }]
}
```

---

### `DELETE /api/stats` (protected)

Batch delete labels and their associated visits.

```bash
curl -X DELETE http://localhost:3001/api/stats \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{ "labels": ["old-label", "test-label"] }'
```

---

### `GET /api/analytics` (protected)

Returns aggregated analytics across all labels for the specified period.

| Param | Default | Description |
| :--- | :--- | :--- |
| `days` | `30` | Number of days to aggregate (7, 14, 30, 60, 90) |

Response includes: summary KPIs, per-label totals with growth, daily timeline, country distribution, browser/OS/device breakdowns, hourly activity, and referrer ranking.

---

### `GET /health` (public)

```json
{
  "status": "ok",
  "totalVisits": 1420,
  "totalLabels": 5,
  "timestamp": "2026-02-11T20:00:00.000Z"
}
```

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🎨 Badge Reference

Badges follow the [shields.io](https://shields.io) standard and support extensive customization.

| Parameter | Default | Description |
| :--- | :--- | :--- |
| `label` | `PixelPulse` | Left-side text. Set to empty string for message-only badges |
| `message` | _(visit count)_ | Right-side text. Overrides the dynamic counter |
| `color` | `blue` | Right-side color: named (`green`, `red`, `cyan`...) or hex (`#4c1`, `ff6600`) |
| `labelColor` | `#555` | Left-side background color |
| `style` | `flat` | Badge style: `flat` or `flat-square` |
| `logo` | — | [Simple Icons](https://simpleicons.org/) slug (e.g. `typescript`, `github`, `docker`) |
| `logoColor` | — | Logo color override |
| `link` | — | URL to wrap the badge in a clickable link |
| `preview` | `false` | Set to `true` to skip visit registration |

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🔧 Configuration

All settings are managed through environment variables. See [`.env.example`](backend/.env.example) for the full template.

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Backend server port |
| `NODE_ENV` | `development` | `development` / `production` |
| `LOG_LEVEL` | `info` | Pino log level (`debug`, `info`, `warn`, `error`) |
| `API_KEY` | _(empty)_ | Bearer token for `/api/*` routes — leave empty to disable auth |
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `IP_SALT` | `change-me` | Fixed salt for IP hashing — **change this** |

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🔄 Architecture

```
Browser/Bot                   PixelPulse Backend              SQLite
    │                              │                            │
    │  GET /pixel/label.gif        │                            │
    │  GET /pixel/label.svg        │                            │
    │  GET /badge/label.svg        │                            │
    │─────────────────────────────>│                            │
    │  200 OK (image response)     │                            │
    │<─────────────────────────────│                            │
    │                              │  async (fire-and-forget)   │
    │                              │  hash IP + geolocate       │
    │                              │  parse UA + detect bot     │
    │                              │  INSERT visit              │
    │                              │───────────────────────────>│
    │                              │                            │

Dashboard (React)             PixelPulse Backend              SQLite
    │                              │                            │
    │  GET /api/stats              │                            │
    │  GET /api/analytics          │                            │
    │─────────────────────────────>│                            │
    │                              │  SELECT + aggregate        │
    │                              │<───────────────────────────│
    │  200 JSON                    │                            │
    │<─────────────────────────────│                            │
```

**How it works:**

1. An image request (`/pixel/*` or `/badge/*`) arrives from any surface — README, website, email client.
2. The server responds immediately with the image — **zero latency added** to the page load.
3. Asynchronously (fire-and-forget): the IP is hashed, geolocation and User-Agent are parsed, bot detection runs, and the visit is inserted into SQLite.
4. The dashboard reads aggregated data through the `/api/stats` and `/api/analytics` endpoints.

**Project structure:**

```
pixel-pulse/
├── backend/            # Express API + pixel/badge serving
│   ├── src/
│   │   ├── config/     # Environment validation
│   │   ├── lib/        # Core logic (visit, geo, ua, badge, logo)
│   │   └── routes/     # Pixel, badge, stats, analytics, health
│   └── prisma/         # Schema + SQLite database
└── frontend/           # React dashboard (Vite + TailwindCSS)
    └── src/
        ├── api/        # API client + types
        ├── components/ # Shared UI (KpiCard, BadgeCreator, etc.)
        ├── context/    # Badge preset context
        ├── lib/        # Icons, presets, country codes
        └── pages/      # Dashboard, Analytics, LabelDetail, Login
```

<p align="right">(<a href="#-pixelpulse">back to top</a>)</p>

---

## 🛠 Tech Stack

<div align="center">

### Backend

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Helmet](https://img.shields.io/badge/Helmet-Security-white?logo=helmet)
![Pino](https://img.shields.io/badge/Pino-Logging-687634)
![GeoIP](https://img.shields.io/badge/GeoIP--lite-MaxMind-FF6600)
![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)

### Frontend

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-Charts-22B5BF)
![Nivo](https://img.shields.io/badge/Nivo-Treemap-F46D43)


</div>



---

## 🔒 Privacy

- **IPs are never stored** — only a SHA-256 hash with a configurable salt
- The salt is fixed (set in `.env`), allowing consistent unique visitor counting across sessions
- **Geolocation is 100% local** — uses the bundled MaxMind database, no external API calls
- No cookies, no fingerprinting, no third-party scripts
- All data stays in a single SQLite file on your machine
- **You own everything** — self-hosted, no data leaves your server

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

**[Back to Top](#-pixelpulse)**

</div>
