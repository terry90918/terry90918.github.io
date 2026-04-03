# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for 劉尹惠律師事務所 (Liu Yin-Hui Law Office) based in Hsinchu. Homepage + articles blog showcasing 7 practice areas: 民事訴訟, 刑事辯護, 婚姻家事, 遺產繼承, 房地糾紛, 契約審閱, 法人顧問.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **CMS**: Payload CMS 3.x (embedded in Next.js via `@payloadcms/next`)
- **Database**: PostgreSQL (`@payloadcms/db-postgres`)
- **Rich Text**: Lexical Editor (`@payloadcms/richtext-lexical`)
- **Storage**: S3 (optional, `@payloadcms/storage-s3` for MinIO)
- **Styling**: Tailwind CSS 4 + SCSS (admin custom theme)
- **Fonts**: LXGW WenKai TC (display + body), loaded via `FontLoader` component
- **Dark Mode**: next-themes
- **Package Manager**: bun (not npm — `package-lock.json` is gitignored)

## Development Commands

```bash
bun dev            # Dev server on localhost:3000 (Turbopack)
bun build          # Production build
bun start          # Production server
bun lint           # ESLint
bun run typecheck  # TypeScript check (tsc --noEmit)
bun run test       # Vitest unit tests
bun run test:e2e   # Playwright E2E tests (needs running server on :3001)
bun run generate:types  # Regenerate payload-types.ts
```

## Project Structure

```
app/
  (frontend)/          # Public-facing routes
    layout.tsx         # Root layout with fonts, metadata, ThemeProvider, JSON-LD
    page.tsx           # Homepage composing all section components
    articles/          # Blog listing + [slug] detail pages
    robots.ts
    sitemap.ts
    api/og/            # OG image generation
  (payload)/           # Payload CMS admin routes → /admin
    layout.tsx         # Admin layout (imports @payloadcms/next/css + custom.scss)
    custom.scss        # Admin theme overrides (sage green design system)
    admin/
      importMap.js     # Auto-generated — maps plugin client components
      [[...segments]]/ # Catch-all for admin pages
    api/               # Payload REST + GraphQL APIs
collections/           # Payload CMS collections
  Articles.ts          # title, slug (auto-generated), content, excerpt, featuredImage, tags, status, publishedAt
  Tags.ts              # name, slug
  Media.ts             # Upload collection (S3 or local fallback)
  Users.ts             # Admin users
components/            # Shared React components
  Navigation.tsx, Hero.tsx, About.tsx, PracticeAreas.tsx, PracticeAreaCard.tsx,
  Testimonial.tsx, Contact.tsx, Footer.tsx, FloatingCTA.tsx, ArticleCard.tsx,
  ArticlesSection.tsx, Pagination.tsx, FontLoader.tsx, ThemeProvider.tsx, ThemeToggle.tsx
lib/payload/
  queries.ts           # Server-side Payload queries (getPosts, getPostBySlug, etc.)
scripts/
  migrate-articles.ts  # Ghost → Payload article migration script
  create-test-user.ts  # Create E2E test user
migrations/
  index.ts             # Migration registry (imported by payload.config.ts as prodMigrations)
  *.ts                 # Migration files (auto-generated, DO NOT edit)
proxy.ts           # Staging HTTP Basic Auth (enabled when STAGING=true)
payload.config.ts      # Payload CMS configuration (collections, plugins, DB, prodMigrations)
payload-types.ts       # Auto-generated TypeScript types
Dockerfile             # Multi-stage Docker build (oven/bun:1-alpine)
```

## Design System

Custom Tailwind theme in `tailwind.config.ts`:

- `primary` / `accent`: #6A7E72 (Muted Sage Green)
- `background-light`: #E6E4E1 (Pale Pebble Gray)
- `background-dark`: #2C3530 (Deep Forest Green)
- `text-dark`: #333331, `text-light`: #E8E6E3

Dark mode via `dark:` classes with next-themes (`darkMode: 'class'`).

## Environments

| Environment | URL                            | Branch    |
| ----------- | ------------------------------ | --------- |
| Production  | https://lawyer.jurislm.com     | `main`    |
| Staging     | https://lawyer-dev.jurislm.com | `develop` |

Staging access credentials are managed via Coolify environment variables (`STAGING_USER`, `STAGING_PASSWORD`) and Payload Admin accounts. Do not commit credentials to the repository.

## i18n

Payload Admin UI 配置為繁體中文（`@payloadcms/translations/languages/zhTw`）。
Collection labels 也已中文化：文章、標籤、媒體、使用者，分為「內容管理」和「系統管理」兩個群組。

## Deployment

Auto-deploy via Coolify (Dockerfile) on Hetzner server (`46.225.58.202`):

- Push to `main` → Production
- Push to `develop` → Staging

### Coolify Resources

| Resource    | Name              | UUID                       | Status                          |
| ----------- | ----------------- | -------------------------- | ------------------------------- |
| Project     | Lawyer            | `u80gskc844sco8ckk8swoos8` | —                               |
| Prod App    | lawyer-prod-app   | `xckckgo84kwk8044wockkoso` | `running:healthy`               |
| Staging App | lawyer-dev-app    | `jgcwwwc04sk04skc84488wk8` | `running:healthy`               |
| Prod DB     | lawyer-prod-db    | `v80s40gk4g4gsosk8c04s8c0` | PostgreSQL 16 Alpine, port 5448 |
| Staging DB  | lawyer-develop-db | `dow48808w0wggws8wo8ck8g4` | PostgreSQL 16 Alpine, port 5447 |

**DB Connection URLs** (passwords stored in Coolify env vars, not in this file):

- Internal (Docker network): `postgres://payload:<password>@<db-uuid>:5432/lawyer_cms`
- External (local psql): `postgres://payload:<password>@46.225.58.202:<port>/lawyer_cms`
- Production port: `5448` / Staging port: `5447`

Note: `!` in passwords must be URL-encoded as `%21`.

### Environment Variables

**Production** (2 vars): `DATABASE_URL`, `PAYLOAD_SECRET`

**Staging** (3 vars): same as production + `STAGING=true` (enables Basic Auth + SEO protection)

```bash
DATABASE_URL=postgres://...                        # Internal Coolify DB URL
PAYLOAD_SECRET=<random string>
STAGING=true                                       # Staging only: enables Basic Auth, robots Disallow, X-Robots-Tag
```

### Gotchas

- **Migration strategy**: `push` is enabled only in dev (`NODE_ENV === 'development'`) for fast iteration, disabled everywhere else (production, staging, test) to enforce migrations. **Never use push mode against production/staging DB** — it creates tables without migration records, causing deployment failures. Local dev DB is treated as a sandbox.
- **Query try-catch**: All functions in `lib/payload/queries.ts` have try-catch to return empty results when DB tables don't exist yet (required for `next build` prerendering against empty DB).
- **S3 env vars**: Do NOT set placeholder values (e.g. `S3_ACCESS_KEY_ID=placeholder`). The S3 plugin loads conditionally on truthiness — placeholders cause `importMap.js` mismatch → admin blank page.
- **importMap.js**: Generated at `next build` time. Build-time and runtime S3 env vars must match, or admin UI silently fails to render.
- **Dockerfile**: Multi-stage build using `oven/bun:1-alpine`. Build stage uses dummy `DATABASE_URL` and `PAYLOAD_SECRET` (Payload CMS requires them at build time). Do NOT set S3 env vars at build time (S3 plugin loads conditionally on truthiness — dummy values cause `importMap.js` mismatch).
- **Admin CSS (Turbopack)**: Payload admin CSS requires manual imports — `@payloadcms/next/css` in layout.tsx (JS import) + `@payloadcms/ui/scss/app.scss` in custom.scss (SCSS import).
- **Staging protection**: `proxy.ts` enforces HTTP Basic Auth when `STAGING=true`. Excludes `/api/*` (webhooks), `robots.txt`, `sitemap.xml`. `STAGING_USER` and `STAGING_PASSWORD` env vars are **required** — returns 500 if unset.
- **Cloudflare WAF + Free plan**: `cf.bot_management.verified_bot` requires Bot Management add-on (Enterprise). Free plan WAF rules cannot filter by verified bot status.
- **PR labels**: Always add labels when creating PRs. Available: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `perf`, `breaking`, `major`, `minor`, `patch`. Use `gh pr edit <num> --add-label "label1,label2"`.

## Migrations

Production/Staging use `prodMigrations` (auto-runs at server startup). Dev uses `push: true` (only when `NODE_ENV=development`) for fast iteration against local sandbox DB. **Never point `bun dev` at production/staging DB.**

### Creating a New Migration

```bash
# payload CLI broken with Node.js 24 + bun — use programmatic API:
bun -e "
import { getPayload } from 'payload';
import config from './payload.config.ts';
const payload = await getPayload({ config });
await payload.db.createMigration({ payload, migrationName: 'describe_change' });
process.exit(0);
"
```

This generates files in `migrations/`. Note: the script imports `payload.config.ts`, so ensure `PAYLOAD_SECRET` and `DATABASE_URL` are set (via `.env.local`) and the DB is reachable. The `migrations/index.ts` registry auto-updates. Commit both the new migration file and updated `index.ts`, then push — Payload runs pending migrations on next server start.

## E2E Testing

90 tests across 3 Playwright projects: `admin-setup`, `admin`, `frontend`.

- Test account: `e2e-test@jurislm.com` / `E2ETest2026`
- `admin-setup` logs in once → shares `storageState` with `admin` tests
- Base URL: `http://localhost:3001`
