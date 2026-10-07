# Terry Chen Blog

Terry Chen 的個人技術部落格。以 Markdown 檔案為內容來源，Next.js 靜態生成。

## 環境

| 環境       | 網址                         | Branch |
| ---------- | ---------------------------- | ------ |
| Production | https://terry90918.github.io | `main` |

## 開發

```bash
bun install         # 安裝依賴
bun dev             # 開發伺服器 http://localhost:3000
bun build           # 建置（無需 DB）
bun lint            # ESLint 檢查
bun format          # Prettier 格式化
bun run typecheck   # TypeScript 檢查
bun run test        # Vitest 單元測試
bun run test:e2e    # Playwright E2E（需要伺服器在 :3001）
```

commit 前 Husky pre-commit hook 會自動執行 format → lint → typecheck → test → OpenSpec 規格驗證（`git commit --no-verify` 可跳過，但不建議）。

## 技術棧

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + @tailwindcss/typography
- Markdown（unified + remark + rehype + rehype-raw + rehype-sanitize + rehype-pretty-code，支援嵌入 `<audio>` 等有限的 raw HTML）
- next-themes（深色模式，`data-theme` 屬性）

## 寫文章

文章存放於 `content/posts/<year>/<slug>.md`，frontmatter 必填欄位：

```yaml
---
title: '文章標題'
publishedAt: '2026-04-23T00:00:00.000Z'
status: 'published' # or "draft"
---
```

選填：`slug`（預設從檔名推導）、`excerpt`、`tags`（字串陣列）、`metaDescription`。

詳細規範見 `content/README.md`。

## 設計系統

| Token      | Light     | Dark      |
| ---------- | --------- | --------- |
| `--accent` | `#006cac` | `#ff6b01` |

## 站內 CV

`/cv` 直接顯示繁體中文履歷；`/cv/zh-TW` 與 `/cv/en` 提供雙語履歷，各自包含聯絡頁與六個案例。主站與 CV 共用導覽、頁尾、主題設定及 Google Analytics，CV 保留原版型與 3D 名牌。

履歷來源為 `lib/cv/profile.ts`，雙語案例放在 `content/cv/case-studies/`；圖片、模型及游標放在 `public/cv-assets/`。元件位於 `components/cv/`，CV 樣式限定在 `.cv-site`。來源為原 `cv` 專案的 `c2ef213`，授權與來源說明保留在 `licenses/`。

`bun build` 會為 CV 產生尾斜線網址相容入口，所有頁面共用根目錄 `/_next`。公開發佈只由本儲存庫管理；舊 `cv` 儲存庫保留歷史，在主站部署完成後停止獨立發布，再回讀站內履歷確認切換。

`BASE_URL=http://localhost:3001 bunx playwright test --project=frontend` 驗證站內導覽、CV 語言與章節切換、手機版面及既有文章頁。

## 部署流程

透過 GitHub Actions 自動部署至 GitHub Pages：push 到 `main` → 觸發 `.github/workflows/deploy-pages.yml` → 靜態匯出（`next build`, `output: 'export'`）→ 發佈到 https://terry90918.github.io。
