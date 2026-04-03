# 劉尹惠律師事務所網站

新竹劉尹惠律師事務所的形象網站。

## 環境

| 環境       | 網址                           | Branch    |
| ---------- | ------------------------------ | --------- |
| Production | https://lawyer.jurislm.com     | `main`    |
| Staging    | https://lawyer-dev.jurislm.com | `develop` |

### Staging 環境

Staging 環境有三層保護：

**1. HTTP Basic Auth（`middleware.ts`）**：

- 透過 `STAGING_USER` / `STAGING_PASSWORD` 環境變數設定

**2. Payload Admin 後台（`/admin`）**：

- 管理員帳號透過 Payload Admin 建立

**3. SEO 保護**：`X-Robots-Tag: noindex` header + `robots.txt Disallow: /`

## 開發

```bash
bun install    # 安裝依賴
bun dev        # 開發伺服器 http://localhost:3000
bun build      # 建置
bun lint       # ESLint 檢查
```

## 技術棧

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Payload CMS 3.x (嵌入式)
- PostgreSQL
- next-themes (深色模式)

## Payload CMS

| 項目       | 值                               |
| ---------- | -------------------------------- |
| Admin 後台 | https://lawyer.jurislm.com/admin |
| REST API   | https://lawyer.jurislm.com/api   |
| 資料庫     | PostgreSQL（Coolify managed）    |

### 嵌入式架構

本站採用 Payload CMS 嵌入式架構（embedded in Next.js）：

- **Payload CMS** — 內容管理（文章、標籤、媒體），Admin UI 在 `/admin`
- **Next.js** — 前端渲染，透過 Payload Local API 直接查詢資料庫（無 HTTP API 開銷）

### Collections

- **Articles** — 文章（標題、內容、標籤、封面圖、發布狀態）
- **Tags** — 標籤分類
- **Media** — 媒體上傳（支援 S3 / 本地 fallback）
- **Users** — 管理員帳號

## 資料庫遷移

所有環境使用 `prodMigrations` 自動執行遷移（伺服器啟動時）。本地開發預設 `push: true`（自動同步 schema），部署環境為 `push: false`（強制使用 migration）。

**重要**：本地 `bun dev` 只連本地 DB，絕不連 staging/production DB，否則會造成 push 與 migration 衝突。

建立新的 migration（需 `.env.local` 包含 `PAYLOAD_SECRET` 與 `DATABASE_URL`）：

```bash
bun -e "
import { getPayload } from 'payload';
import config from './payload.config.ts';
const payload = await getPayload({ config });
await payload.db.createMigration({ payload, migrationName: 'describe_change' });
process.exit(0);
"
```

生成的檔案會包含新的遷移檔（如 `migrations/2026xxxx_describe_change.ts`）以及更新後的 `migrations/index.ts`；請務必一併 commit 並 push，否則部署環境不會執行新的遷移。

## 部署

透過 Coolify 自動部署（Nixpacks + bun），部署在 Hetzner 伺服器：

- `main` branch → Production（`lawyer-prod-app`）
- `develop` branch → Staging（`lawyer-dev-app`）

### 環境變數

| 變數                    | 說明                                    | Production | Staging |
| ----------------------- | --------------------------------------- | :--------: | :-----: |
| `DATABASE_URL`          | PostgreSQL 連線字串（Coolify 內部網路） |     v      |    v    |
| `PAYLOAD_SECRET`        | Payload CMS 加密密鑰                    |     v      |    v    |
| `NIXPACKS_NODE_VERSION` | 固定 Node.js 版本（22）                 |     v      |    v    |
| `STAGING`               | 啟用 Basic Auth + SEO 保護              |     —      | `true`  |
