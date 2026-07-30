# Environment inventory

Verified on 2026-07-30 before proposal approval.

## Repository and branch model

- Repository root:
  `/Users/terrychen/Documents/Github/terry90918/terry90918.me`
- Current root branch: `main`
- Remote: `origin`
- Fetch and push target: `git@github.com:terry90918/terry90918.github.io.git`
- GitHub repository: `terry90918/terry90918.github.io` (public)
- Default branch: `main`
- Current `HEAD` and `origin/main`: `a57a581fbe247db77fe982ed9b19ceba7d693015`
- Viewer permission: `ADMIN`
- A historical `develop` branch exists locally and remotely, but current deployment and release
  workflows trigger only from `main`; no active workflow is bound to `develop`.

## OpenSpec and active work

- OpenSpec directory exists and CLI version `1.2.0` is available.
- No active OpenSpec change matched homepage identity or display-name renaming.
- The archived GitHub Pages migration establishes static export and push-to-`main` deployment.
- Issue searches for `Terry.TY Chen`, `homepage name`, and `homepage identity` returned no match
  before issue #26 was created.

## Implementation evidence

- Current source uses `Terry Chen` in `components/BlogHeader.tsx`.
- Current source uses `Hi, I'm @terry90918.` in `app/(frontend)/page.tsx`.
- Existing E2E coverage asserts both labels and header navigation.
- A pre-proposal stash named `jt-flow-one pre-proposal homepage identity rename` preserves the
  earlier local draft; the root checkout contains no tracked implementation changes.

## Deployment and dependencies

- `next.config.ts` exports a static site.
- `.github/workflows/deploy-pages.yml` builds and publishes GitHub Pages on pushes to `main`.
- Production URL: `https://terry90918.github.io`.
- No database, migration, runtime server, credential, or external package change is required.

## Test surface

- Focused Playwright E2E covers the homepage identity and header navigation.
- Repository commands provide TypeScript, ESLint, Vitest, static build, and OpenSpec checks.
- Production acceptance requires a successful GitHub Pages workflow and canonical homepage
  readback after merge.
