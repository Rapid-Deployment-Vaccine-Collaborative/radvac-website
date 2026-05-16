# RaDVaC website

Public site for [radvac.org](https://radvac.org). Next.js frontend with WordPress for headless content mangement on backend.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **WordPress** (headless) via **WPGraphQL**
  - Production: live WP on Namecheap EasyWP at `radvac-297e5f.ingress-alpha.ewp.live`
  - Local dev: dockerized WP at `wordpress/docker-compose.yml`
- **Framer Motion** for animation, **html-react-parser** + **sanitize-html** for rendering WP block HTML safely
- Hosting: **Vercel** (frontend), **EasyWP** (CMS)

## Project layout

```
src/app/              Next.js App Router routes
src/app/[slug]/       Dynamic route — renders any WP page by slug
src/app/api/          /api/contact, /api/revalidate (ISR webhook), /api/draft (preview mode)
src/lib/wordpress/    GraphQL client, queries, types
src/data/             Hardcoded content (FAQ, papers, projects) — to be migrated to WP
wordpress/            Local docker WP stack + plugin source + admin setup notes
  docker-compose.yml
  plugins/radvac-revalidate/   Revalidation webhook plugin (zip + upload to WP admin)
  SETUP.md                     EasyWP-side configuration checklist
```

## Run locally

### 1. Install deps

```sh
npm install
```

### 2. Configure env

```sh
cp .env.example .env.local
```

Either point at the production CMS (read-only is safe):

```
WP_GRAPHQL_URL=https://radvac-297e5f.ingress-alpha.ewp.live/graphql
NEXT_PUBLIC_WP_URL=https://radvac-297e5f.ingress-alpha.ewp.live
```

…or boot the local WordPress stack (see below) and use:

```
WP_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_WP_URL=http://localhost:8080
```

### 3. Start the dev server

```sh
npm run dev
```

→ http://localhost:3000

### Optional: local WordPress

```sh
cd wordpress
docker compose up -d
```

WP admin at http://localhost:8080/wp-admin (initial setup runs once). Import [radvac.WordPress.2026-01-27.xml](radvac.WordPress.2026-01-27.xml) via Tools → Import → WordPress.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Deployment

- **Frontend** auto-deploys to Vercel on push to `main`. Required env vars are listed in [.env.example](.env.example).
- **CMS** changes are made directly in the EasyWP WP admin. The `radvac-revalidate` plugin notifies Vercel on save so pages update without waiting for the 1-hour ISR window.

See [wordpress/SETUP.md](wordpress/SETUP.md) for the WordPress-side configuration.


## Gradient

body {
  background: linear-gradient(180deg, #a8c4e7 0%, #f4f8fd 100%);
  background-attachment: fixed;
  min-height: 100vh;
  color: var(--ink);
  font-family: var(--serif);
  -webkit-font-smoothing: antialiased;
}
