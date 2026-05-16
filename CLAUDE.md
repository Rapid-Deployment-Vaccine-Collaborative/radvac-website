# Notes for AI agents working on this repo

Public site for radvac.org. **Next.js 15 (App Router) + React 19 + TS + Tailwind 4** frontend, **WordPress (WPGraphQL) on Namecheap EasyWP** as the headless CMS. Frontend on Vercel; CMS at `radvac-297e5f.ingress-alpha.ewp.live` (EasyWP-provided hostname). See [README.md](README.md) for the human-facing overview and [wordpress/SETUP.md](wordpress/SETUP.md) for the WP-side setup.

## How content flows

- `[slug]` route at [src/app/[slug]/page.tsx](src/app/[slug]/page.tsx) renders **any** WP page by slug via `getPageBySlug()` in [src/lib/wordpress/queries.ts](src/lib/wordpress/queries.ts). Adding a new WP page typically needs no code change.
- All WP queries go through [src/lib/wordpress/client.ts](src/lib/wordpress/client.ts). 1-hour ISR cache by default; pass `revalidate: 0` for draft fetches.
- WP HTML is rendered with `dangerouslySetInnerHTML` after `rewriteWordPressUrls()` in [src/lib/utils.ts](src/lib/utils.ts). Don't add new sanitizers — `sanitize-html` is already wired.
- Yoast SEO fields flow through `PAGE_FIELDS` in [src/lib/wordpress/queries.ts](src/lib/wordpress/queries.ts) and into `generateMetadata`. If you add a new content query, follow the same pattern.

## Things to know

- **Read-only.** This codebase only reads from WP. Do not add mutations or admin-style operations.
- **Hardcoded content is legacy.** [src/data/faq.ts](src/data/faq.ts), [src/data/papers.ts](src/data/papers.ts), [src/data/projects.ts](src/data/projects.ts) and homepage sections in [src/app/page.tsx](src/app/page.tsx) are slated for migration to WP. Don't add new entries to `src/data/` — add a WP query instead.
- **Revalidation:** the WP plugin at [wordpress/plugins/radvac-revalidate/](wordpress/plugins/radvac-revalidate/) POSTs to `/api/revalidate` ([src/app/api/revalidate/route.ts](src/app/api/revalidate/route.ts)) on `save_post`. Layout-level data refreshes on every change; page-level by slug.
- **Draft preview** uses WP **Application Passwords** (not JWT). `WP_AUTH_TOKEN` holds `base64("user:app-password")` and is sent as `Authorization: Basic <token>`.
- **Local WP** stack at [wordpress/docker-compose.yml](wordpress/docker-compose.yml) runs on **port 8080** (note: image config in [next.config.ts](next.config.ts) historically references 8890 — check before running).
- **Don't commit:** `.env.local`, `*.xml` (the 189 MB WP export), `wordpress/plugins/*.zip` (built bundles). All in `.gitignore`.

## Common tasks

- **Add a query for a new WP content type:** mirror the `getPageBySlug` shape in [src/lib/wordpress/queries.ts](src/lib/wordpress/queries.ts) (try/catch → null/empty fallback, `revalidate: 3600`), add types to [src/lib/wordpress/types.ts](src/lib/wordpress/types.ts), call from a server component.
- **Allow images from a new WP host:** add to `images.remotePatterns` in [next.config.ts](next.config.ts).
- **Add a route that needs revalidation by tag:** pass `tags: [...]` to `fetch` and call `revalidateTag` from the webhook route.

## Verifying changes

- TypeScript: `npx tsc --noEmit`
- Lint: `npm run lint`
- Live render: `npm run dev` → http://localhost:3000. For WP-backed routes, ensure `WP_GRAPHQL_URL` in `.env.local` points somewhere reachable.
- There is no test suite. UI/feature changes need to be visually verified in the browser.
