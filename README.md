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

## 技術棧

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + @tailwindcss/typography
- Markdown（unified + remark + rehype + rehype-sanitize + rehype-pretty-code，支援嵌入 `<audio>` 等有限的 raw HTML）
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

## 部署

透過 GitHub Actions 自動部署至 GitHub Pages：push 到 `main` → 觸發 `.github/workflows/deploy-pages.yml` → 靜態匯出（`next build`, `output: 'export'`）→ 發佈到 https://terry90918.github.io。
