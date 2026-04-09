# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Terry Chen (@terry90918). steipete.me-style blog built with Payload CMS + Next.js.
Records engineering articles and personal insights.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **CMS**: Payload CMS 3.x (embedded in Next.js via `@payloadcms/next`)
- **Database**: PostgreSQL (`@payloadcms/db-postgres`)
- **Rich Text**: Lexical Editor (`@payloadcms/richtext-lexical`)
- **Styling**: Tailwind CSS 4 + `@tailwindcss/typography`
- **Fonts**: Atkinson Hyperlegible (Google Fonts), `font-mono` global
- **Dark Mode**: next-themes (`attribute="data-theme"`)
- **Package Manager**: bun (not npm — `package-lock.json` is gitignored)

## Development Commands

```bash
bun dev            # Dev server on localhost:3000
bun build          # Production build
bun start          # Production server
bun lint           # ESLint
bun format         # Prettier format
bun run typecheck  # TypeScript check (tsc --noEmit)
bun run test       # Vitest unit tests
bun run test:e2e   # Playwright E2E tests (needs running server on :3001)
bun run generate:types  # Regenerate payload-types.ts
```

## Project Structure

```
app/
  (frontend)/
    layout.tsx             # Root layout with Atkinson font, ThemeProvider
    page.tsx               # Homepage: avatar + hero + latest 10 posts
    posts/                 # All posts grouped by year/month
    posts/[year]/[slug]/   # Post detail with tags, share, prev/next
    about/                 # About page with GitHub activity chart
    rss.xml/               # RSS 2.0 Route Handler
    sitemap.ts             # Dynamic sitemap
    robots.ts              # robots.txt
    api/og/                # OG image generation (@vercel/og)
    api/health/            # Health check endpoint
    (payload)/               # Payload CMS admin routes → /admin
    admin/[[...segments]]/ # Catch-all admin pages
    api/                   # Payload REST + GraphQL APIs
collections/               # Payload CMS collections (registered in payload.config.ts)
  Posts.ts                 # title, slug (auto-generated), content, excerpt, heroImage, tags, readingTime, status, publishedAt
  Tags.ts                  # name, slug
  Media.ts                 # Upload collection (local storage)
  Users.ts                 # Admin users
components/
  BlogHeader.tsx           # Sticky header with dark mode toggle (useSyncExternalStore)
  BlogFooter.tsx           # Footer with social links + CC BY 4.0
  ThemeProvider.tsx        # next-themes wrapper (attribute="data-theme")
lib/
  rss.ts                   # RSS 2.0 feed builder
lib/payload/
  queries.ts               # getPosts, getPostBySlug, getPostsPaginated, getPostsByTag,
                           # getLatestPosts, getRelatedPosts, getAllPostSlugs, getAllTags,
                           # getPostsByYearMonth, getAdjacentPosts
  index.ts                 # Re-exports from queries.ts
tests/
  unit/                    # Vitest unit tests
  e2e/                     # Playwright E2E tests
proxy.ts                   # Staging HTTP Basic Auth (enabled when STAGING=true)
payload.config.ts          # Payload CMS configuration
payload-types.ts           # Auto-generated TypeScript types
Dockerfile                 # Multi-stage Docker build (oven/bun:1-alpine)
```

## Design System (steipete.me)

CSS variables in `app/(frontend)/globals.css`:

| Token          | Light     | Dark        |
| -------------- | --------- | ----------- |
| `--background` | `#fdfdfd` | `#212737`   |
| `--foreground` | `#282728` | `#eaedf3`   |
| `--accent`     | `#006cac` | `#ff6b01`   |
| `--muted`      | `#e6e6e6` | `#343f60bf` |
| `--border`     | `#ece9e9` | `#ab4b08`   |

- Font: Atkinson Hyperlegible (Google Fonts), `font-mono` on body
- Container: `max-w-3xl` centered
- Dark mode: `data-theme="dark"` on `<html>` (next-themes `attribute="data-theme"`)

## Environments

| Environment | URL                          | Branch    |
| ----------- | ---------------------------- | --------- |
| Production  | https://blog.jurislm.com     | `main`    |
| Staging     | https://blog-dev.jurislm.com | `develop` |

## Coolify Resources

| Resource    | Name         | UUID                       | Status                          |
| ----------- | ------------ | -------------------------- | ------------------------------- |
| Project     | Blog         | `tsg0gook408g4w0c04kwc884` | —                               |
| Develop Env | develop      | `egkosgkswwcss848wwgowccs` | —                               |
| Staging App | blog-dev-app | `mwscwg88sc8cs0ws8os44k84` | `running`                       |
| Staging DB  | blog-dev-db  | `w8840oo0kcsg0gcocook8k8g` | PostgreSQL 16 Alpine, port 5450 |

**DB Connection URLs** (passwords stored in Coolify env vars):

- Internal (Docker network): `postgres://payload:<password>@w8840oo0kcsg0gcocook8k8g:5432/blog_cms`
- External (local psql): `postgres://payload:<password>@46.225.58.202:5450/blog_cms`

### Environment Variables

**Staging** (5 vars): `DATABASE_URL`, `PAYLOAD_SECRET`, `STAGING=true`, `STAGING_USER`, `STAGING_PASSWORD`

```bash
DATABASE_URL=postgres://...                        # Internal Coolify DB URL
PAYLOAD_SECRET=<random string>
STAGING=true                                       # Enables Basic Auth, robots Disallow, X-Robots-Tag
STAGING_USER=admin                                 # Basic Auth username (required when STAGING=true)
STAGING_PASSWORD=staging2026                       # Basic Auth password (required when STAGING=true)
```

### Gotchas

- **Migration strategy**: `push` is enabled only in dev (`NODE_ENV === 'development'`) for fast iteration, disabled everywhere else to enforce migrations.
- **Query try-catch**: All functions in `lib/payload/queries.ts` have try-catch to return empty results when DB tables don't exist yet (required for `next build` prerendering against empty DB).
- **Dark mode selector**: Uses `data-theme` attribute (not `class`) — ThemeProvider must set `attribute="data-theme"`.
- **ThemeToggle hydration**: Uses `useSyncExternalStore` (not `useEffect+useState`) to avoid `react-hooks/set-state-in-effect` lint error.
- **Staging protection**: `proxy.ts` enforces HTTP Basic Auth when `STAGING=true`.
- **S3 storage**: `@payloadcms/storage-s3` is installed but not yet configured in `payload.config.ts` (uses local storage for Media).
- **PR labels**: Always add labels when creating PRs. Available: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `perf`, `breaking`, `major`, `minor`, `patch`. Use `gh pr edit <num> --add-label "label1,label2"`.

## Migrations

Dev uses `push: true` (only when `NODE_ENV=development`). Production uses `prodMigrations`.

### Creating a New Migration

```bash
bun -e "
import { getPayload } from 'payload';
import config from './payload.config.ts';
const payload = await getPayload({ config });
await payload.db.createMigration({ payload, migrationName: 'describe_change' });
process.exit(0);
"
```

## E2E Testing

Playwright projects: `frontend`.

- Base URL: `http://localhost:3001`
- Tests in `tests/e2e/`
