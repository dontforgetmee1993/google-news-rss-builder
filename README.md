# Google News RSS Builder

A web app to build, save, and proxy Google News RSS feed URLs. Configure keyword/topic feeds through a UI, get a stable proxy URL you can drop into any RSS reader.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v3 + shadcn/ui |
| Backend | Hono + Cloudflare Workers |
| Database / Auth | Supabase (PostgreSQL + Magic Link auth) |
| Hosting | Cloudflare Pages (frontend) + Cloudflare Workers (API) |

## Prerequisites

- Node 20 (`nvm use` if you have nvm)
- [Cloudflare account](https://dash.cloudflare.com) (free tier works)
- [Supabase project](https://supabase.com) (free tier works)
- `wrangler` CLI: `npm install -g wrangler` then `wrangler login`

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd google-news-rss-builder
npm install
```

### 2. Configure frontend env

```bash
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` with your Supabase project values.

### 3. Configure worker env

```bash
cp worker/.dev.vars.example worker/.dev.vars
```

Edit `worker/.dev.vars` with your Supabase project values.

### 4. Run Supabase migrations

Apply the SQL migrations from `supabase/` to your Supabase project via the Supabase Dashboard SQL editor or the Supabase CLI.

### 5. Start development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Worker API: http://localhost:8787

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_API_URL` | Worker API URL (use `http://localhost:8787` in dev) |

### Worker (`worker/.dev.vars`)

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key (server-side only) |

## Deployment

### Worker (Cloudflare Workers)

```bash
cd worker

# Set production secrets
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_KEY

# Update FRONTEND_URL in wrangler.toml to your Pages domain, then:
npx wrangler deploy
```

Worker deploys to `https://gnews-rss-api.<your-subdomain>.workers.dev`.

### Frontend (Cloudflare Pages)

1. Push repo to GitHub
2. Cloudflare Dashboard → Pages → Create project → Connect to Git
3. Build settings:
   - Build command: `cd frontend && npm run build`
   - Build output directory: `frontend/dist`
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL` (your worker URL)
5. Deploy

### Supabase (post-deploy)

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-frontend.pages.dev`
- Redirect URLs: `https://your-frontend.pages.dev/auth/callback`

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/feeds/build-url` | Build a Google News RSS URL from params |
| `GET` | `/api/feeds` | List feeds for authenticated user |
| `POST` | `/api/feeds` | Create a new feed |
| `PUT` | `/api/feeds/:id` | Update a feed |
| `DELETE` | `/api/feeds/:id` | Delete a feed |
| `GET` | `/rss/:slug` | Proxy feed as RSS XML (public, cacheable) |
| `GET` | `/rss/:slug.json` | Proxy feed as parsed JSON |
