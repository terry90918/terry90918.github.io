## 1. 基礎建設（無前台影響）

- [x] 1.1 安裝 Markdown 處理套件：`gray-matter`, `unified`, `remark`, `remark-parse`, `remark-gfm`, `remark-rehype`, `rehype-slug`, `rehype-autolink-headings`, `rehype-pretty-code`, `rehype-stringify`；安裝 `shiki` 作為 peer dep
- [x] 1.2 建立 `lib/posts/types.ts`：定義 `PostFrontmatter`, `Post`, `Tag` TypeScript 型別
- [x] 1.3 建立 `lib/posts/slugify.ts`：從 `collections/Posts.ts` 抽出 `slugify()` 函式（CJK-aware）
- [x] 1.4 建立 `lib/posts/markdown.ts`：實作 `renderMarkdown(content: string): Promise<string>`，使用 unified 管線 + rehype-pretty-code dual theme（`github-light` / `github-dark`）
- [x] 1.5 建立 `lib/posts/loader.ts`：實作 `loadAllPosts()`，掃描 `content/posts/**/*.md`、解析 frontmatter（gray-matter）、驗證必填欄位（title, publishedAt, status）、計算 readingTime、呼叫 renderMarkdown；production 模組快取、development 每次重讀
- [x] 1.6 建立 `lib/posts/queries.ts`：實作 `getLatestPosts`, `getPostBySlug`, `getAllPostSlugs`, `getAdjacentPosts`, `getPostsByYearMonth`, `getAllTags`, `getPostsByTag`，簽名與 `lib/payload/queries.ts` 一致
- [x] 1.7 建立 `lib/posts/index.ts`：re-export 所有 queries

## 2. 種子內容

- [x] 2.1 建立 `content/posts/` 目錄結構（`2026/` 子目錄）
- [x] 2.2 建立 2-3 篇範例文章（含 frontmatter 全欄位、GFM 表格、fenced code block），供開發與測試使用
- [x] 2.3 建立 `content/README.md`：frontmatter schema、必填/選填欄位、命名規則、寫作流程

## 3. 前台頁面遷移

- [x] 3.1 更新 `app/(frontend)/page.tsx`：`@/lib/payload/queries` → `@/lib/posts/queries`；`payload-types` → `@/lib/posts/types`；`key` 改用 `post.slug`
- [x] 3.2 更新 `app/(frontend)/posts/page.tsx`：同上
- [x] 3.3 更新 `app/(frontend)/posts/[year]/[slug]/page.tsx`：改 import；新增 `<div dangerouslySetInnerHTML={{ __html: post.html }} className="prose dark:prose-invert max-w-none" />`；`generateStaticParams` 改用 `getAllPostSlugs()`；更新 `githubEditUrl` 指向 `content/posts/<year>/<slug>.md`
- [x] 3.4 新增 code block CSS：在 `globals.css` 或獨立 CSS 加上 `rehype-pretty-code` 的 dual theme selector（`html[data-theme='dark'] .shiki` 等）
- [x] 3.5 更新 `app/(frontend)/rss.xml/route.ts`：改 import
- [x] 3.6 更新 `app/(frontend)/sitemap.ts`：改 import；`lastModified` 改用 `publishedAt`

## 4. 移除 Payload（破壞性，一個 commit）

- [x] 4.1 刪除 `app/(payload)/` 整個目錄（admin routes）
- [x] 4.2 刪除 `collections/` 整個目錄
- [x] 4.3 刪除 `lib/payload/` 整個目錄
- [x] 4.4 刪除 `migrations/` 整個目錄
- [x] 4.5 刪除 `payload.config.ts`
- [x] 4.6 刪除 `payload-types.ts`
- [x] 4.7 從 `package.json` 移除 Payload 相依：`@payloadcms/db-postgres`, `@payloadcms/next`, `@payloadcms/richtext-lexical`, `@payloadcms/storage-s3`, `payload`, `graphql`；執行 `bun install`
- [x] 4.8 清理 `next.config.ts`：移除 `withPayload` wrapper（若有）、移除 `@payload-config` 路徑 alias
- [x] 4.9 清理 `tsconfig.json`：移除 Payload 相關路徑 alias（若有）
- [x] 4.10 更新 `Dockerfile`：移除 `DATABASE_URL` 和 `PAYLOAD_SECRET` build-time inline env override
- [x] 4.11 驗證 `bun run typecheck`、`bun run lint`、`bun build` 全部通過（無 DB 連線）

## 5. 測試

- [x] 5.1 建立 `tests/unit/markdown-loader.test.ts`：frontmatter 驗證、status filter、readingTime、slug 推導、空目錄容錯
- [x] 5.2 建立 `tests/unit/markdown-renderer.test.ts`：GFM 表格、task list、heading ID、code block 語法高亮、未知語言不崩潰
- [x] 5.3 建立 `tests/unit/post-queries.test.ts`：所有 queries 函式正確行為（含 getAdjacentPosts、getPostsByYearMonth）
- [x] 5.4 更新 `tests/unit/posts-collection.test.ts` 或刪除（若依賴已移除的 Payload collections）
- [x] 5.5 更新 `tests/unit/rss-feed.test.ts`：改用新 queries
- [x] 5.6 執行 E2E 測試確認前台路由全部通過（首頁、/posts、/posts/[year]/[slug]、/rss.xml）

## 6. 文件與清理

- [x] 6.1 更新 `CLAUDE.md`：移除 Payload/DB/migrations 章節；新增 Markdown 工作流程、`lib/posts/` 結構說明
- [x] 6.2 更新 `README.md`：移除 Payload CMS 後台連結；新增文章寫作流程說明
- [x] 6.3 在 Coolify staging 環境移除 `DATABASE_URL`、`PAYLOAD_SECRET` env vars
- [x] 6.4 確認 staging (`blog-dev.jurislm.com`) 部署成功並驗證所有頁面
- [ ] 6.5 production 驗證一週後，刪除 Coolify `blog-dev-db` PostgreSQL resource
