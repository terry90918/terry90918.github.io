## Why

Payload CMS + PostgreSQL 增加了不必要的基礎設施負擔（DB 維護、migration、Coolify 資源），但部落格完全沒有非技術編輯需求。改用 Markdown 檔案讓內容住在 git 裡，部署只需 Next.js server，無需 DB。

## What Changes

- 新增 `content/posts/<year>/<slug>.md` 作為文章資料來源
- 新增 `lib/posts/` 取代 `lib/payload/`（types, loader, markdown renderer, queries）
- **BREAKING**：移除 `app/(payload)/` admin 路由（/admin 將 404）
- **BREAKING**：移除 `collections/`、`migrations/`、`payload.config.ts`、`payload-types.ts`
- **BREAKING**：移除所有 Payload/PostgreSQL npm 相依（`@payloadcms/*`, `payload`, `graphql`）
- 修改所有前台頁面改 import 來源
- 文章詳情頁新增 Markdown → HTML 渲染（修復目前 placeholder bug）
- 新增語法高亮（`rehype-pretty-code` + `shiki`，`github-light`/`github-dark` dual theme）
- Dockerfile 移除 build-time DB env override
- Coolify 移除 `DATABASE_URL`、`PAYLOAD_SECRET` env vars

## Capabilities

### New Capabilities

- `markdown-loader`: 從 `content/posts/` 讀取、解析、快取 Markdown 檔案；frontmatter 驗證；readingTime 計算
- `markdown-renderer`: Markdown → HTML 渲染管線（unified/remark/rehype），支援 GFM、heading anchors、語法高亮 dual theme
- `post-queries`: 與 `lib/payload/queries.ts` 相同簽名的查詢 API，資料來源改為 Markdown loader
- `content-authoring`: `content/posts/<year>/<slug>.md` 目錄結構與 frontmatter schema 規範

### Modified Capabilities

（無現有 spec 需更新）

## Impact

- **移除相依**：`@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, `payload`, `graphql`
- **新增相依**：`gray-matter`, `unified`, `remark`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`, `shiki`, `rehype-stringify`
- **受影響頁面**：`app/(frontend)/page.tsx`, `posts/page.tsx`, `posts/[year]/[slug]/page.tsx`, `rss.xml/route.ts`, `sitemap.ts`
- **Coolify 資源**：`blog-dev-db` PostgreSQL resource 可在 production 驗證後刪除
- **無影響**：dark mode、staging Basic Auth、OG image、RSS feed 格式、sitemap 格式、Tailwind CSS
