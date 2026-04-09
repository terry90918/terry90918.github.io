# Terry Chen Blog

Terry Chen 的個人技術部落格。steipete.me 風格，基於 Payload CMS + Next.js。

## 環境

| 環境       | 網址                         | Branch    |
| ---------- | ---------------------------- | --------- |
| Production | https://blog.jurislm.com     | `main`    |
| Staging    | https://blog-dev.jurislm.com | `develop` |

## 開發

```bash
bun install         # 安裝依賴
bun dev             # 開發伺服器 http://localhost:3000
bun build           # 建置
bun lint            # ESLint 檢查
bun format          # Prettier 格式化
bun run typecheck   # TypeScript 檢查
bun run test        # Vitest 單元測試
bun run test:e2e    # Playwright E2E（需要伺服器在 :3001）
```

## 技術棧

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4
- Payload CMS 3.x（嵌入式，`@payloadcms/next`）
- PostgreSQL（`@payloadcms/db-postgres`）
- next-themes（深色模式，`data-theme` 屬性）

## Payload CMS

| 項目       | 值                             |
| ---------- | ------------------------------ |
| Admin 後台 | https://blog.jurislm.com/admin |
| REST API   | https://blog.jurislm.com/api   |
| 資料庫     | PostgreSQL（Coolify managed）  |

### Collections

- **Posts** — 文章（標題、slug、內容、摘要、封面圖、標籤、閱讀時間、狀態、發布時間）
- **Tags** — 標籤分類
- **Media** — 媒體上傳（本地儲存）
- **Users** — 管理員帳號

## 設計系統

前後台統一使用 Atkinson Hyperlegible 字型與相同 accent 色：

| Token      | Light     | Dark      |
| ---------- | --------- | --------- |
| `--accent` | `#006cac` | `#ff6b01` |

## 資料庫遷移

本地開發 `push: true`（自動同步 schema），部署環境 `push: false`（強制使用 migration）。

建立新的 migration：

```bash
bun -e "
import { getPayload } from 'payload';
import config from './payload.config.ts';
const payload = await getPayload({ config });
await payload.db.createMigration({ payload, migrationName: 'describe_change' });
process.exit(0);
"
```

## 部署

透過 Coolify 自動部署：

- `main` branch → Production
- `develop` branch → Staging

### 環境變數

| 變數               | 說明                                   |
| ------------------ | -------------------------------------- |
| `DATABASE_URL`     | PostgreSQL 連線字串                    |
| `PAYLOAD_SECRET`   | Payload CMS 加密密鑰（至少 32 字元）   |
| `STAGING`          | `true` 啟用 Basic Auth + SEO 保護      |
| `STAGING_USER`     | Basic Auth 帳號（STAGING=true 時必填） |
| `STAGING_PASSWORD` | Basic Auth 密碼（STAGING=true 時必填） |
