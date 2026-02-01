# Webzam - Design Intelligence Scanner

A tool that extracts design tokens, typography, colors, and brand vibe from any website using real browser rendering.

## Architecture

- **Backend**: Cloudflare Worker with Browser Rendering + D1 database
- **Frontend**: Next.js dashboard with Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or pnpm
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with:
  - **Workers Paid plan** (required for Browser Rendering)
  - D1 database access

## Quick Start

### 1. Backend Worker Setup

```bash
cd backend-worker

# Install dependencies
npm install

# Create D1 database
wrangler d1 create webzam-db

# Update wrangler.toml with your database ID
# Replace YOUR_D1_DATABASE_ID with the ID from the create command
```

Update `wrangler.toml` with your D1 database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "webzam-db"
database_id = "your-actual-database-id-here"
```

Run migrations:

```bash
# Local development
npm run db:migrate

# Production
npm run db:migrate:prod
```

Start the worker:

```bash
# npm run dev uses --remote by default (required for Browser Rendering)
npm run dev
```

The API will be available at `http://localhost:8787`.

> **Note**: Browser Rendering is only available on Cloudflare's infrastructure.
> The `--remote` flag proxies requests through Cloudflare, enabling browser access.
> Without `--remote`, you'll get "Browser Rendering not available" errors.

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy env file
cp .env.example .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scan` | Scan a URL and extract design tokens |
| GET | `/scans` | List all scan history |
| GET | `/scans/:id` | Get a specific scan result |

### Scan Request

```bash
curl -X POST http://localhost:8787/scan \
  -H "Content-Type: application/json" \
  -d '{"url": "https://adopt.ai"}'
```

### Response Structure

```json
{
  "id": "uuid",
  "url": "https://adopt.ai",
  "scannedAt": "2024-01-01T00:00:00.000Z",
  "colors": {
    "primary": { "hex": "#...", "confidence": 0.85, "evidence": [...] },
    "secondary": { "hex": "#...", "confidence": 0.72, "evidence": [...] },
    "background": { "hex": "#...", "confidence": 0.95, "evidence": [...] }
  },
  "typography": {
    "heading": { "fontFamily": "...", "confidence": 0.9, "evidence": [...] },
    "body": { "fontFamily": "...", "confidence": 0.88, "evidence": [...] }
  },
  "logo": {
    "type": "svg|png|jpg",
    "value": "...",
    "confidence": 0.8,
    "reason": "..."
  },
  "vibe": {
    "tone": "...",
    "audience": ["..."],
    "positioning": "...",
    "aesthetic_style": ["..."],
    "summary": "...",
    "confidence": 0.8,
    "provider": "anthropic|openai|none"
  },
  "vibeSlice": {
    "heroH1": "...",
    "heroSubheading": "...",
    "primaryCTA": "...",
    "navLabels": ["..."]
  }
}
```

## LLM Vibe Analysis (Optional)

To enable AI-powered vibe analysis, set environment variables in `wrangler.toml`:

```toml
[vars]
VIBE_PROVIDER = "anthropic"  # or "openai"

# Then set secrets:
# wrangler secret put ANTHROPIC_API_KEY
# or
# wrangler secret put OPENAI_API_KEY
```

If no provider is configured, the scan still works but returns empty vibe data with `provider: "none"`.

## Deployment

### Deploy Backend

```bash
cd backend-worker

# Run production migrations
npm run db:migrate:prod

# Deploy worker
npm run deploy
```

### Deploy Frontend

The frontend can be deployed to Vercel, Cloudflare Pages, or any Next.js-compatible platform.

```bash
cd frontend

# Build
npm run build

# Or deploy to Vercel
npx vercel
```

Update `NEXT_PUBLIC_API_URL` to point to your deployed Worker URL.

## Project Structure

```
webzam/
├── backend-worker/
│   ├── src/
│   │   ├── index.ts         # Worker entry, routes
│   │   ├── types.ts         # TypeScript types
│   │   ├── extract.ts       # Browser rendering extraction
│   │   ├── db.ts            # D1 database operations
│   │   ├── analyze/
│   │   │   ├── colors.ts    # Color analysis + clustering
│   │   │   ├── typography.ts # Typography analysis
│   │   │   └── logo.ts      # Logo detection
│   │   └── vibe/
│   │       └── provider.ts  # LLM integration
│   ├── migrations/
│   │   └── 0001_init.sql    # D1 schema
│   ├── wrangler.toml
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── history/page.tsx # History page
│   │   │   └── scan/[id]/page.tsx # Scan detail
│   │   ├── components/          # UI components
│   │   └── lib/
│   │       ├── api.ts           # API client
│   │       └── types.ts         # Shared types
│   └── package.json
│
└── README.md
```

## How It Works

1. **Browser Rendering**: Uses Cloudflare Browser Rendering (Puppeteer) to render pages at 1440x900 viewport
2. **Element Sampling**: Extracts CTAs, headings, body text, backgrounds, and logos from above-the-fold content
3. **Color Analysis**: Clusters similar colors and scores by prominence (CTA backgrounds, position, area)
4. **Typography Detection**: Identifies heading and body fonts by sampling and weighting by font size
5. **Logo Detection**: Prioritizes SVGs in header/nav, falls back to images with logo-related alt text
6. **Vibe Analysis**: Optionally sends extracted content slice to LLM for brand tone/audience analysis

## Testing with adopt.ai

```bash
# Start backend (uses --remote by default for Browser Rendering)
cd backend-worker && npm run dev

# In another terminal, start frontend
cd frontend && npm run dev

# Open http://localhost:3000 and enter https://adopt.ai
```

The scan history is stored in D1 and viewable at `/history`.

## Troubleshooting

**"Browser Rendering not available" error**
- Ensure you're running with `--remote` flag (default in `npm run dev`)
- Verify you have a Workers Paid plan on Cloudflare
- Run `wrangler login` to authenticate

**Scan takes a long time**
- Browser Rendering cold starts can take 10-30 seconds
- Subsequent scans are faster due to browser reuse

**D1 database errors**
- Ensure you've created the database: `wrangler d1 create webzam-db`
- Update `wrangler.toml` with the correct database ID
- Run migrations: `npm run db:migrate`
