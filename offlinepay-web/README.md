# OfflinePay Mesh — Frontend

**Author: Arvind Dwivedi**

A multi-page Next.js (App Router) marketing + interactive demo site for **OfflinePay Mesh** — a system that simulates sending money with zero internet, where encrypted payment packets hop phone-to-phone via a gossip protocol until a bridge device with 4G reaches the backend and settles the payment.

Design direction: **institutional fintech** — Stripe docs crossed with a traditional bank statement. Restrained, structured, serif headings, hairline borders, flat color blocks.

---

## Screenshots

### Landing Page (Dark Mode)
![Landing page with hero section, stat strip, and propagation pipeline overview](docs/screenshots/01-homepage.jpg)

### Interactive Mesh Simulator
![Live payment simulator with compose, gossip, and bridge upload controls](docs/screenshots/02-simulator.jpg)

### How It Works — Protocol Pipeline
![Step-by-step protocol walkthrough with packet hop visualization](docs/screenshots/03-how-it-works.jpg)

### System Architecture
![Tech stack table, cryptography suite, and deduplication layer details](docs/screenshots/04-architecture.jpg)

---

## Quick Start

### Prerequisites

- **Node.js 18+** installed
- **Backend server** running at `http://localhost:8080` (see [offlinepay-mesh](../offlinepay-mesh/))

### Install & Run

```bash
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Site Structure

```
app/
  layout.tsx              → Shared Navbar + Footer, font setup, metadata
  page.tsx                → Home / Landing
  demo/page.tsx           → Live Demo (connected to Spring Boot backend)
  how-it-works/page.tsx   → Protocol pipeline walkthrough
  architecture/page.tsx   → Tech stack & system design
  use-cases/page.tsx      → Real-world application scenarios
  about/page.tsx          → Developer profile & project motivation
components/
  Navbar.tsx              → Thin, bottom-bordered, text links, theme toggle
  Footer.tsx              → Multi-column, minimal, GitHub + LinkedIn links
  ui/
    Card.tsx              → Surface card with hairline border
    Button.tsx            → Primary / secondary / danger variants
    Badge.tsx             → Dot + muted-gray text status indicator
    SectionHeading.tsx    → Serif heading + subtitle pattern
    StatStrip.tsx         → Mono-font stat row with dot separators
```

---

## Design System

### Typography
- **Display/headings:** Fraunces (serif) — via `next/font/google`
- **Body/UI:** Inter (sans-serif)
- **Numbers/data/code:** IBM Plex Mono

### Colors
| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg` | `#F7F5F0` (warm off-white) | `#0B1E3D` (deep navy) |
| `--surface` | `#FFFFFF` | `#10284D` |
| `--accent` | `#0F6B5C` (deep teal) | `#C9A227` (muted gold) |
| `--border` | `rgba(20,33,97,0.10)` | `rgba(241,245,249,0.12)` |

### Layout Rules
- Border radius: 4px everywhere
- No drop shadows — hairline borders only
- 96px+ vertical rhythm between sections

### Signature Element
Dotted "packet route line" motif — a thin dashed line with small dot markers representing a packet hopping device-to-device.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Hero, stat strip, 3-step pipeline preview, security integrity blocks |
| `/demo` | Live simulator connected to backend APIs (inject → gossip → settle) |
| `/how-it-works` | 5-step numbered protocol walkthrough with packet hop visualization |
| `/architecture` | Tech stack table, cryptography suite, dedup layer, GitHub link |
| `/use-cases` | 4 scenarios: rural markets, disaster relief, dead zones, transit |
| `/about` | Developer bio, project motivation, GitHub + contact links |

---

## API Proxy

The Next.js dev server proxies all `/api/*` requests to `http://localhost:8080` (the Spring Boot backend) via `next.config.ts` rewrites. No CORS configuration needed.

---

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **TypeScript 5**

---

## License

Built for learning and portfolio demonstration. Use freely.
