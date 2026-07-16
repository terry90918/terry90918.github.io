# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog for Terry Chen (@terry90918). Built with Next.js + TypeScript, content authored as Markdown files.
Records engineering articles and personal insights.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Content**: Markdown files in `content/posts/<year>/<slug>.md`
- **Markdown**: unified → remark-gfm → remark-rehype (allowDangerousHtml) → rehype-raw → rehype-sanitize → rehype-slug → rehype-autolink-headings → rehype-pretty-code → rehype-stringify
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
bun run test <file># Run a single test file, e.g. bun run test tests/unit/markdown-loader.test.ts
bun run test:e2e   # Playwright E2E tests (needs running server on :3001)
```

### Pre-commit Hook

Husky's `pre-commit` hook runs on every commit: `bun format` (auto-fixes + re-stages) → `bun lint` → `bun run typecheck` → `bunx vitest run` → `bunx @fission-ai/openspec validate --specs`. The OpenSpec step validates specs under `openspec/specs/` against in-flight changes in `openspec/changes/` — most day-to-day edits won't touch these, but if a commit fails at that step, check whether an OpenSpec change needs to be applied or archived.

## Project Structure

```
app/
  robots.ts                # robots.txt — MUST stay at true app/ root, not inside (frontend)/
                           # (Next.js matches robots/favicon/manifest with an anchored regex
                           # that requires them at the app root; route-group nesting is not
                           # recognized, unlike sitemap/icon/opengraph-image which are unanchored)
  (frontend)/
    layout.tsx             # Root layout with ThemeProvider, BlogHeader, BlogFooter
    page.tsx               # Homepage: avatar + hero + latest 10 posts
    posts/                 # All posts grouped by year/month
    posts/[year]/[slug]/   # Post detail with tags, share, prev/next
    about/                 # About page with GitHub activity chart
    rss.xml/               # RSS 2.0 Route Handler (statically exported)
    sitemap.ts             # Sitemap (statically exported)
    icon.svg               # Favicon
    globals.css            # Tailwind base + CSS variables + syntax highlighting
    fonts.ts               # Stub (font loaded via CSS @import)
content/
  posts/<year>/<slug>.md   # Markdown blog posts (frontmatter + content)
  README.md                # Frontmatter schema and authoring guide
public/
  audio/<year>/<slug>.mp3  # Podcast/audio embeds referenced by posts via raw <audio> tags
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

### Embedding Audio (Podcasts)

Post Markdown supports raw HTML — the pipeline runs `rehype-raw` then `rehype-sanitize` with a schema extended to allow `<audio>`/`<source>` (see `lib/posts/markdown.ts`). Any tag/attribute not in the sanitize schema is silently stripped — extend `sanitizeSchema` in `lib/posts/markdown.ts` if a post needs another raw HTML element.

**Automated**: `bun run podcast <slug-or-path>` (`scripts/generate-podcast.ts`) drafts a two-host dialogue script from the post (via the `claude` CLI, unless `--script <dialogue.json>` supplies one), synthesizes each line with OpenAI's `gpt-4o-mini-tts` (`marin`/`cedar` voices), concatenates and downsamples with `ffmpeg`, writes `public/audio/<year>/<slug>.mp3`, and inserts the `<audio>` tag into the post — all in one commit instead of the two-PR pattern from #14/#21. Requires `OPENAI_API_KEY` in the environment and `ffmpeg`/`claude` on `PATH`. Use `--dry-run` to preview the dialogue script without calling the TTS API.

**Manual fallback**, if you already have a narration audio file (e.g. recorded separately):

1. Downsample to mono mp3 (`ffmpeg -i in.m4a -codec:a libmp3lame -b:a 80k -ac 1 out.mp3`) to keep the file small before committing it to the repo (there's no CDN/object storage — audio ships as a static asset in `public/`)
2. Save to `public/audio/<year>/<slug>.mp3`
3. Embed near the top of the post:

```html
<audio controls preload="none" style="width: 100%;">
  <source src="/audio/<year>/<slug>.mp3" type="audio/mpeg" />
  您的瀏覽器不支援音訊播放，請<a href="/audio/<year>/<slug>.mp3">直接下載收聽</a>。
</audio>
```

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

- **`robots.ts` placement**: must live at `app/robots.ts`, not nested in `(frontend)/` or any other route group — Next.js's route matcher anchors `robots`/`favicon.ico`/`manifest.json` to the literal app root (regex starts with `^`), so a nested one is silently never registered (404, no build/dev error). `sitemap.ts`/`icon.*`/`opengraph-image.*` use an unanchored regex and can be nested — that asymmetry is what makes this easy to miss.
- **Dark mode selector**: Uses `data-theme` attribute (not `class`) — ThemeProvider must set `attribute="data-theme"`.
- **ThemeToggle hydration**: Uses `useSyncExternalStore` (not `useEffect+useState`) to avoid `react-hooks/set-state-in-effect` lint error.
- **Module-level cache**: `loadAllPosts()` caches parsed posts in memory on first call (production only). Dev always re-reads from disk for hot reload.
- **Draft filtering**: `status: "draft"` posts are excluded in `NODE_ENV=production`. Control in tests via `opts.env` parameter.
- **PR labels**: Always add labels when creating PRs. Available: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`, `perf`, `breaking`, `major`, `minor`, `patch`. Use `gh pr edit <num> --add-label "label1,label2"`.
- **Markdown raw HTML is sanitized, not disabled**: `rehype-sanitize` runs right after `rehype-raw`, so `<script>` and other unlisted tags/attributes are stripped even though posts are self-authored. Adding a new embed type (video, iframe, etc.) requires updating `sanitizeSchema` in `lib/posts/markdown.ts` — it won't render silently otherwise.

## E2E Testing

Playwright projects: `frontend`.

- Base URL: `http://localhost:3001`
- Tests in `tests/e2e/frontend-blog.spec.ts`
