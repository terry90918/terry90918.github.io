## Context

The blog currently deploys as a Docker image (`output: 'standalone'`) to two Coolify-managed Hetzner apps: production (`blog.jurislm.com`) and staging (`blog-dev.jurislm.com`, gated by Basic Auth via `proxy.ts`). All content is Markdown read from disk at build/request time — there is no database and no server-side mutation. This is a personal blog; a self-hosted server is unnecessary overhead for what static hosting already solves for free. The repo currently has two small server-dependent features that don't survive the move: an unused OG-image edge route and a health-check endpoint.

## Goals / Non-Goals

**Goals:**

- Publish the site as pure static HTML/CSS/JS via GitHub Pages, built and deployed by GitHub Actions on every push to `main`.
- Serve from the GitHub Pages default URL (`https://terry90918.github.io`), which requires the repo to be named `terry90918.github.io` (GitHub's "user site" convention — only this exact repo name gets served at the bare domain instead of `<user>.github.io/<repo>/`).
- Remove every piece of the app that depends on a running Node/edge server (middleware, API routes, ISR) since GitHub Pages has none.

**Non-Goals:**

- Custom domain — out of scope, the design uses the GitHub-provided URL only.
- Decommissioning the existing Coolify `Blog` project/apps — left running; a manual follow-up outside this change.
- Preserving the staging Basic Auth gate in any form — staging is dropped, not replaced (see Decisions).

## Decisions

- **Repo rename over `basePath`.** Renaming to `terry90918.github.io` gives a clean root URL with zero Next.js config for path prefixing. The alternative (keep `terry90918.me`, set `basePath: '/terry90918.me'`) was rejected — user chose the clean-URL option, and it avoids every internal link/asset path needing the prefix.
- **Drop staging outright, not "preview via PR."** GitHub Pages publishes one branch to one URL; there's no built-in gated preview environment, and standing up one (e.g., a second Pages site, or Basic Auth via a Cloudflare Worker) is real infra for a personal blog that doesn't need it. Local `bun dev`/`bun run build` + manual preview covers pre-merge review.
- **Delete `api/health` and `api/og` rather than adapt them.** `api/health` has no server process to report on once hosting is static — keeping it would just return a static `{status:"ok"}` forever, which is misleading, not useful. `api/og` is dead code (grepped: no page references it in metadata) and uses `runtime = 'edge'`, which `output: 'export'` cannot build at all — it must go regardless.
- **Remove `revalidate` exports instead of leaving them as no-ops.** With `output: 'export'`, ISR doesn't exist — there's no server to revalidate against. Leaving `export const revalidate = 3600` in place would misrepresent the page as having live revalidation.
- **`images.unoptimized: true`, drop `remotePatterns`.** GitHub Pages has no image-optimization endpoint, so `next/image` must skip optimization entirely. The existing `remotePatterns` (googleusercontent, s3.jurislm.com) are already unused in the codebase (the one remote image, the GitHub avatar on `/about`, is already rendered with `unoptimized`), so the whole block is dead weight.
- **Delete `next.config.ts`'s `headers()` function rather than port it.** GitHub Pages serves files directly; a Next.js `headers()` config only takes effect when the Next server itself handles the request, which never happens in static hosting. Cache/robots headers for a static host would need to live in GitHub Pages' own mechanism (it has none configurable per-repo) — accepted as a non-goal.
- **GitHub Actions + official `actions/deploy-pages` over `gh-pages` branch push.** The official Pages deployment action is the current recommended approach (no orphan branch to manage, deployment shows in the repo's Environments/Deployments UI, built-in artifact retention).

## Risks / Trade-offs

- [No staging environment before merging to `main`] → Mitigation: verify locally with `bun run build` (static export) before pushing; GitHub Pages deploys are fast enough that a bad `main` push is cheap to fix forward.
- [Losing custom cache-control/robots headers that `next.config.ts` used to set] → Mitigation: accepted; GitHub Pages' default caching is adequate for a low-traffic personal blog, and `robots.ts`/`sitemap.ts` (Next metadata routes, still statically exported) continue to control crawler behavior at the content level.
- [Repo rename breaks old clone URLs / bookmarks to `github.com/terry90918/terry90918.me`] → Mitigation: GitHub automatically redirects the old repo name to the new one; no action needed.
- [`out/` static export missing `.nojekyll` causes GitHub Pages' Jekyll processing to mangle the `_next/` folder (leading underscore)] → Mitigation: workflow adds a `touch out/.nojekyll` step before uploading the artifact.

## Migration Plan

1. Land all code changes (config, deletions, URL updates) on a branch, verify `bun run build` produces a working `out/` directory locally (`npx serve out` or equivalent).
2. Merge to `main`; this both ships the code change and (once repo is renamed) triggers the new `deploy-pages.yml` workflow.
3. Rename the repo via `gh repo rename terry90918.github.io` (or GitHub UI) — can happen before or after the code merge; GitHub's redirect makes ordering non-critical.
4. In repo Settings → Pages, set source to "GitHub Actions" (one-time manual step, not scriptable via the workflow itself).
5. Confirm `https://terry90918.github.io` serves the site after the first successful workflow run.

Rollback: revert the merge commit; the old Coolify deployment (`blog.jurislm.com`) is untouched by this change and keeps serving in parallel until DNS/links are updated elsewhere, so there is no hard cutover risk.

## Open Questions

- None — all prior ambiguities (repo naming, staging handling, OG/health routes) were resolved during brainstorming.
