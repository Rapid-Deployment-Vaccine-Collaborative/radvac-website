# WordPress admin setup checklist (Namecheap EasyWP)

One-time configuration to complete on the live WordPress instance so the
Next.js frontend (deployed on Vercel) can read content, refresh on edits,
and preview drafts.

Targets EasyWP **Starter** tier — dashboard + file manager only, no SFTP.
Everything below is doable through the WP admin and the EasyWP dashboard.

## 1. Plugins

Install + activate (already done if you've worked through the integration plan):

- `WPGraphQL`
- `WPGraphQL for ACF`
- `WPGraphQL Smart Cache`
- `Yoast SEO` + `WPGraphQL for Yoast SEO`

No JWT auth plugin needed — we use WP core's Application Passwords (step 4).

## 2. WP settings

- **Settings → Permalinks** → `Post name` (`/%postname%/`).
- **Settings → General → Site Address (URL)** → `https://old.radvac.org`
  (keep WordPress Address the same; only the public Site Address moves).
- **Appearance → Menus** → ensure the primary menu is assigned to the
  `Primary` location. The frontend queries this via `MenuLocationEnum`
  in [../src/lib/wordpress/queries.ts](../src/lib/wordpress/queries.ts).

## 3. Install the revalidate plugin

The plugin source lives in this repo at
[plugins/radvac-revalidate/](plugins/radvac-revalidate/).

Before zipping, edit [plugins/radvac-revalidate/radvac-revalidate.php](plugins/radvac-revalidate/radvac-revalidate.php)
and set `RADVAC_REVALIDATE_SECRET` to a random string. Save the same
string as `REVALIDATE_SECRET` in Vercel env vars (step 7).

Generate the secret:

```sh
openssl rand -hex 32
```

Then build the zip:

```sh
cd wordpress/plugins
zip -r radvac-revalidate.zip radvac-revalidate/
```

In WP admin: **Plugins → Add New → Upload Plugin** → choose
`radvac-revalidate.zip` → Install Now → Activate.

## 4. Application Passwords (for draft preview)

Skip this section if you don't need draft preview at launch.

1. WP admin: **Users → Profile** (for an editor account).
2. Scroll to **Application Passwords** → name it `vercel-draft-preview` →
   Add New Application Password.
3. Copy the displayed password (it has spaces — keep them).
4. Base64-encode `username:password`:

   ```sh
   echo -n 'editor-username:abcd efgh ijkl mnop qrst uvwx' | base64
   ```

5. Save the base64 result as `WP_AUTH_TOKEN` in Vercel env vars.

The frontend client at [../src/lib/wordpress/client.ts](../src/lib/wordpress/client.ts)
sends this as `Authorization: Basic <token>` on draft requests.

## 5. EasyWP-specific configuration

- **Custom domain:** EasyWP dashboard → your site → Domains → add
  `old.radvac.org`. EasyWP gives you a CNAME target; create that record
  at the DNS registrar.
- **CDN / `/graphql` caching:** EasyWP runs a managed CDN. WPGraphQL
  Smart Cache handles GraphQL invalidation, but verify with the smoke
  test below. If responses look stale (`Age:` header keeps growing
  after edits), file an EasyWP support ticket asking them to exclude
  `/graphql` from CDN caching.
- **WAF:** if the smoke test returns 403, ask EasyWP support to
  whitelist POSTs to `/graphql`.

## 6. Smoke test

From any machine:

```sh
curl -X POST https://old.radvac.org/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ pages(first:5){ nodes{ slug title }}}"}'
```

Should return JSON listing page slugs (look for `press-release` and `archived-updates`).

## 7. Vercel env vars

In Vercel Project Settings → Environment Variables (Production + Preview):

```
WP_GRAPHQL_URL=https://old.radvac.org/graphql
NEXT_PUBLIC_WP_URL=https://old.radvac.org
NEXT_PUBLIC_SITE_URL=https://radvac.org
REVALIDATE_SECRET=<same string used in radvac-revalidate.php>
PREVIEW_SECRET=<random, used by /api/draft>
WP_AUTH_TOKEN=<base64 from step 4, only if using drafts>
```

## 8. DNS summary

- `old.radvac.org` → CNAME to the host EasyWP gave you in step 5
- `radvac.org` and `www.radvac.org` → records provided by Vercel
  (Project → Domains)

## 9. End-to-end verification

1. `/press-release` and `/archived-updates` render on the Vercel preview URL.
2. Edit the Updates page in WP admin → Save → page refreshes on Vercel
   within ~5 seconds. Vercel function logs show `200` from `/api/revalidate`.
3. `https://radvac.org/api/draft?secret=<PREVIEW_SECRET>&slug=some-page`
   shows unpublished content.
