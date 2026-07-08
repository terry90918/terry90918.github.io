# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Terry Chen (@terry90918). Built with Next.js + TypeScript, content authored as Markdown files.
Records engineering articles and personal insights.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Content**: Markdown files in `content/posts/<year>/<slug>.md`
- **Markdown**: unified → remark-gfm → remark-rehype → rehype-slug → rehype-pretty-code → rehype-stringify
- **Syntax Highlighting**: rehype-pretty-code (dual theme: github-light / github-dark-dimmed)
- **Styling**: Tailwind CSS 4 + `@tailwindcss/typography`
- **Fonts**: Atkinson Hyperlegible (Google Fonts), `font-mono` global
- **Dark Mode**: next-themes (`attribute="data-theme"`)
- **Package Manager**: bun (not npm — `package-lock.json` is gitignored)

## Development Commands

```bash
bun dev            # Dev server on localhost:3000
bun build          # Production build (no DB required)
bun start          # Production server
bun lint           # ESLint
bun format         # Prettier format
bun run typecheck  # TypeScript check (tsc --noEmit)
bun run test       # Vitest unit tests
bun run test:e2e   # Playwright E2E tests (needs running server on :3001)
```

## Project Structure

```
app/
  (frontend)/
    layout.tsx             # Root layout with ThemeProvider, BlogHeader, BlogFooter
    page.tsx               # Homepage: avatar + hero + latest 10 posts
    posts/                 # All posts grouped by year/month
    posts/[year]/[slug]/   # Post detail with tags, share, prev/next
    about/                 # About page with GitHub activity chart
    rss.xml/               # RSS 2.0 Route Handler (statically exported)
    sitemap.ts             # Sitemap (statically exported)
    robots.ts              # robots.txt
    icon.svg               # Favicon
    globals.css            # Tailwind base + CSS variables + syntax highlighting
    fonts.ts               # Stub (font loaded via CSS @import)
content/
  posts/<year>/<slug>.md   # Markdown blog posts (frontmatter + content)
  README.md                # Frontmatter schema and authoring guide
components/
  BlogHeader.tsx           # Sticky header with dark mode toggle (useSyncExternalStore)
  BlogFooter.tsx           # Footer with social links + CC BY 4.0
  ThemeProvider.tsx        # next-themes wrapper (attribute="data-theme")
lib/
  rss.ts                   # RSS 2.0 feed builder
lib/posts/
  types.ts                 # Post, Tag, PostsByYearMonth, PaginatedResult types
  slugify.ts               # CJK-aware slug helper
  markdown.ts              # renderMarkdown() — unified pipeline
  loader.ts                # loadAllPosts(), parsePost(), module-level cache
  queries.ts               # getPosts, getLatestPosts, getPostBySlug, getAllPostSlugs,
                           # getAdjacentPosts, getRelatedPosts, getPostsByYearMonth,
                           # getAllTags, getPostsByTag, getPostsPaginated
  index.ts                 # Re-exports from queries.ts
tests/
  unit/                    # Vitest unit tests (markdown-renderer, markdown-loader, post-queries, rss-feed)
  e2e/                     # Playwright E2E tests (frontend-blog.spec.ts)
next.config.ts             # static export (output: 'export'), unoptimized images
.github/workflows/
  deploy-pages.yml         # Build + deploy static export to GitHub Pages on push to main
```

## Content Authoring

Post files live at `content/posts/<year>/<slug>.md`. Required frontmatter:

```yaml
---
title: 'My Post Title'
publishedAt: '2026-04-23T00:00:00.000Z'
status: 'published' # or "draft"
---
```

Optional fields: `slug` (auto-derived from filename if omitted), `excerpt`, `tags` (string array), `metaDescription`, `featureImage` (path string, reserved for future use — not rendered by frontend yet).

Draft posts (`status: "draft"`) are excluded in `NODE_ENV=production` but visible in development.

See `content/README.md` for full schema reference and writing workflow.

## Design System

CSS variables in `app/(frontend)/globals.css`:

| Token          | Light     | Dark        |
| -------------- | --------- | ----------- |
| `--background` | `#fdfdfd` | `#212737`   |
| `--foreground` | `#282728` | `#eaedf3`   |
| `--accent`     | `#006cac` | `#ff6b01`   |
| `--muted`      | `#e6e6e6` | `#343f60bf` |
| `--border`     | `#ece9e9` | `#ab4b08`   |

- Font: Atkinson Hyperlegible loaded via `@import url()` in `globals.css`; `fonts.ts` is `export {}` (unused)
- Container: `max-w-3xl` centered
- Dark mode: `data-theme="dark"` on `<html>` (next-themes `attribute="data-theme"`)

### Syntax Highlighting (rehype-pretty-code)

`globals.css` contains dual-theme CSS using `--shiki-light` / `--shiki-dark` CSS variables:

```css
[data-rehype-pretty-code-figure] code[data-theme*=' '] span {
  color: var(--shiki-light);
}
html[data-theme='dark'] [data-rehype-pretty-code-figure] code[data-theme*=' '] span {
  color: var(--shiki-dark);
}
```

## next.config.ts

Key settings:

- `output: 'export'` — static HTML export, no Node/edge server at runtime (required for GitHub Pages)
- `images.unoptimized: true` — no image-optimization server on GitHub Pages, `next/image` skips optimization

## Environments

| Environment | URL                          | Branch |
| ----------- | ---------------------------- | ------ |
| Production  | https://terry90918.github.io | `main` |

No staging environment — GitHub Pages serves one branch to one URL. Verify changes locally (`bun run build` + serve `out/`) before merging to `main`.

## Deployment

Push to `main` → `.github/workflows/deploy-pages.yml` builds the static export and publishes it via `actions/deploy-pages`. No manual deploy step. Repo Settings → Pages must have source set to "GitHub Actions".

No database or environment variables required — content is served from Markdown files at build time.

### Gotchas

- **Dark mode selector**: Uses `data-theme` attribute (not `class`) — ThemeProvider must set `attribute="data-theme"`.
- **ThemeToggle hydration**: Uses `useSyncExternalStore` (not `useEffect+useState`) to avoid `react-hooks/set-state-in-effect` lint error.
- **Module-level cache**: `loadAllPosts()` caches parsed posts in memory on first call (production only). Dev always re-reads from disk for hot reload.
- **Draft filtering**: `status: "draft"` posts are excluded in `NODE_ENV=production`. Control in tests via `opts.env` parameter.
- **PR labels**: Always add labels when creating PRs. Available: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `perf`, `breaking`, `major`, `minor`, `patch`. Use `gh pr edit <num> --add-label "label1,label2"`.

## E2E Testing

Playwright projects: `frontend`.

- Base URL: `http://localhost:3001`
- Tests in `tests/e2e/frontend-blog.spec.ts`
