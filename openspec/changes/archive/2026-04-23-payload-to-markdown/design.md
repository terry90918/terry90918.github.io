## Context

個人技術部落格目前以 Payload CMS + PostgreSQL 作為資料來源。由於所有內容都是作者自己撰寫、所有讀者都是 public 閱讀，不需要視覺化 CMS 後台，改用 Markdown 檔案可大幅降低基礎設施複雜度。

**現況**：

- Payload DB 內無實際文章內容（文章詳情頁為 placeholder）
- `featureImage` 欄位存在但前台完全沒渲染
- Tag 頁面路由不存在（`getPostsByTag` 未被使用）
- 無任何語法高亮套件

## Goals / Non-Goals

**Goals:**

- 以 `content/posts/<year>/<slug>.md` Markdown 檔案取代 PostgreSQL 作為文章資料來源
- 保持所有前台頁面路由不變（URL 結構不 breaking）
- 修復文章詳情頁 Markdown 渲染（目前是 placeholder）
- 新增語法高亮（dual theme，跟隨 dark mode）
- 移除所有 Payload/PostgreSQL npm 相依，讓 `bun build` 無需 DB

**Non-Goals:**

- 新增 Tag 頁面路由（保留 queries 供未來用）
- featureImage 渲染（前台目前沒有，遷移後維持現狀）
- 搜尋功能
- 留言系統
- 任何 admin UI 替代品

## Decisions

### D1：Markdown 目錄結構 — `content/posts/<year>/<slug>.md`

**決定**：依年份分資料夾，符合現有 URL 結構（`/posts/[year]/[slug]`），年份從 `publishedAt` frontmatter 推導。

**替代方案**：扁平結構（`content/posts/<slug>.md`）— 不採用，因為年份需要在 slug 解析前就知道（`generateStaticParams` 需要同時回傳 `year` 和 `slug`）。

### D2：Markdown 處理管線 — unified + remark + rehype

**決定**：使用 `unified` 生態系（`remark-parse` → `remark-gfm` → `remark-rehype` → `rehype-slug` → `rehype-autolink-headings` → `rehype-pretty-code` → `rehype-stringify`）。

**替代方案**：`marked`（較簡單但無 rehype 生態）、MDX（支援 JSX 但引入 runtime 複雜度）— 不需要 JSX in Markdown，unified 生態更完整。

### D3：語法高亮 — rehype-pretty-code + shiki dual theme

**決定**：`rehype-pretty-code` 的 `themes: { light: 'github-light', dark: 'github-dark' }` 輸出 CSS variables，搭配 `html[data-theme='dark']` 選擇器（與現有 next-themes `attribute="data-theme"` 一致）。

**替代方案**：`rehype-highlight`（highlight.js，需要額外 CSS）、server-side theme detection（需要 cookie/SSR，增加複雜度）。

### D4：Build-time 快取策略

**決定**：module-level `let cachedPosts: Post[] | null` — 第一次呼叫時讀取所有 Markdown 並快取在記憶體中。`NODE_ENV=development` 時每次請求重讀（方便編輯預覽）。

**替代方案**：Next.js `unstable_cache` / `cache()`（適合 RSC）、Contentlayer（型別安全但增加 toolchain 複雜度）— 模組快取最簡單，不引入新 framework。

### D5：保持 queries 函式簽名不變

**決定**：`lib/posts/queries.ts` 的所有函式簽名與 `lib/payload/queries.ts` 完全一致，前台頁面只改 import path（`@/lib/payload/queries` → `@/lib/posts/queries`）。

**理由**：減少 diff 噪音，讓前台頁面改動可審查性更高。

## Risks / Trade-offs

- `rehype-pretty-code` v0.x → v1.x API 有 breaking change（`theme` → `themes`）→ 安裝前用 Context7 確認目前版本 API
- `dangerouslySetInnerHTML` 注入 Markdown 產生的 HTML → 信任邊界明確（作者 = 自己，內容在 git），可接受；若需要加強可加 `rehype-sanitize`
- Tailwind CSS v4 + prose class：`prose` 需要 `@tailwindcss/typography`（已安裝），dark mode 用 `dark:prose-invert`（v4 語法需確認）
- 刪除 `app/(payload)/` 後訪問 `/admin` 會 404 → 接受（admin 本來就私人）

## Migration Plan

1. **Phase 1**（新增，無破壞）：安裝套件 → 建立 `lib/posts/` → 建立 `content/posts/` 種子內容 → 驗證 loader
2. **Phase 2**（前台遷移）：逐頁替換 import，每頁獨立 commit 可 rollback
3. **Phase 3**（刪除 Payload）：單一大 commit 刪除所有 Payload 相關檔案，`bun build` 驗證通過後 push
4. **Phase 4**（測試 + 文件）：更新 unit/E2E tests，更新 CLAUDE.md
5. **外部**（手動）：Coolify 移除 DB env vars；production 驗證一週後刪除 `blog-dev-db` resource

**Rollback**：Phase 1-2 可隨時 `git revert`；Phase 3 push 後需要 `git revert` 一個 commit + Coolify redeploy。

## Open Questions

（已透過 codebase 探索解答，無遺留問題）
