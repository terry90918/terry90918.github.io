## Why

This is a personal blog with no need for a paid server or a self-hosted Coolify/Docker deployment. The content is already 100% static Markdown, so the site can be published for free via GitHub Pages instead of running on Hetzner/Coolify at `blog.jurislm.com` / `blog-dev.jurislm.com`.

## What Changes

- Rename the repo to `terry90918.github.io` so GitHub Pages serves it at the root domain (no `basePath` needed).
- **BREAKING**: Switch `next.config.ts` from `output: 'standalone'` (Docker/Coolify) to `output: 'export'` (static HTML).
- **BREAKING**: Remove the staging environment entirely — no more `blog-dev.jurislm.com`, no more HTTP Basic Auth gate.
- Delete `proxy.ts` (staging Basic Auth middleware — unsupported by static export and no longer needed).
- Delete `app/(frontend)/api/health/` (no server to health-check on static hosting).
- Delete `app/(frontend)/api/og/` (edge-runtime route, unused by any page, incompatible with static export).
- Delete `Dockerfile` (no longer deploying via Docker/Coolify).
- Remove the `@vercel/og` dependency (only consumer was the deleted OG route).
- Remove `export const revalidate` from the post detail page and the RSS route (ISR requires a server; static export has none).
- Simplify `next.config.ts` `images` config to `{ unoptimized: true }` (no image-optimization server on GitHub Pages) and drop the now-unused `remotePatterns`/`headers()` (GitHub Pages serves raw files; Next's `headers()` never runs there).
- Remove the `STAGING` branch in `robots.ts` (staging is gone; always emit the production rules).
- Update hardcoded base URLs (`sitemap.ts`, `robots.ts`, `layout.tsx` `openGraph.url`, RSS route's site-URL fallback) to `https://terry90918.github.io`.
- Add `.github/workflows/deploy-pages.yml`: on push to `main`, `bun install` → `bun run build` → upload `out/` via `actions/upload-pages-artifact` → `actions/deploy-pages`.
- Update `CLAUDE.md` to reflect the new deployment model (drop the Coolify Resources/Environments tables, document the GitHub Pages URL and workflow instead).

## Capabilities

### New Capabilities

- `static-site-deployment`: the site builds as a static export and is published to GitHub Pages by CI on every push to `main`, with no server-side runtime (no middleware, no API routes, no ISR).

### Modified Capabilities

(none — no existing spec in `openspec/specs/` covers deployment or hosting; content/rendering specs are unaffected by this change)

## Impact

- **Code**: `next.config.ts`, `proxy.ts` (deleted), `app/(frontend)/api/health/` (deleted), `app/(frontend)/api/og/` (deleted), `app/(frontend)/posts/[year]/[slug]/page.tsx`, `app/(frontend)/rss.xml/route.ts`, `app/(frontend)/robots.ts`, `app/(frontend)/sitemap.ts`, `app/(frontend)/layout.tsx`, `Dockerfile` (deleted), `package.json` (drop `@vercel/og`).
- **CI/CD**: new `.github/workflows/deploy-pages.yml`; existing `release.yml` and Claude review workflows are unaffected.
- **Infrastructure**: GitHub repo rename (`terry90918.me` → `terry90918.github.io`, GitHub auto-redirects the old name). Existing Coolify `Blog` project / `blog-dev-app` are left running and are **not** decommissioned by this change — that's a separate, manual infra decision.
- **Docs**: `CLAUDE.md` environments/Coolify sections rewritten.
