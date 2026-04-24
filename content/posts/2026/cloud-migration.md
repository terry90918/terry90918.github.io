---
title: '雲端遷移的環境變數與 OAuth 一致性'
publishedAt: '2026-03-20T11:02:00+08:00'
status: 'published'
slug: 'cloud-migration'
tags:
  - infrastructure-deployment
  - deployment
  - oauth
  - environment
  - migration
---

從本地開發環境遷移到雲端資料庫是許多團隊都會面臨的挑戰。這個過程涉及多個環境變數、配置管理和多工作區的協調。我在這次遷移中總結了幾個關鍵的經驗教訓，希望能幫助你避免類似的陷阱。

## 環境變數載入的隱藏陷阱

在使用 dotenv 時，許多開發者會直接檢查檔案是否存在，但往往忽略了路徑計算的細節。例如：

```typescript
join(__dirname, '../../..', '.env.shared')
```

這樣的相對路徑很容易出錯，尤其當程式執行位置改變時。更關鍵的是，當 dotenv 載入失敗時，程式通常會靜默地跳過該檔案，所有環境變數都退而使用 fallback 值。這樣的設計會隱藏問題，讓你難以發現配置出了什麼問題。

**更好的做法**：在 dotenv 載入失敗時至少記錄一條警告訊息，而不是完全靜默。這樣當環境變數意外遺失時，你能更快地察覺問題所在。

## 多工作區的環境變數同步

使用 Git worktree 開發時，每個工作區都有自己獨立的 `.env.shared` 檔案（通常被 gitignore）。當你在不同工作區之間切換時，環境變數的設定可能不同步。

我的建議是：**在切換 worktree 後的第一件事就是比對環境變數檔案**。簡單的 `diff` 命令就能檢查出哪些變數在新工作區中可能是過期的：

```bash
git worktree list
diff .env.shared ../.worktrees/other-branch/.env.shared
```

這樣可以及時發現環境不一致導致的微妙問題。

## 外部服務的精確匹配要求

### Ollama 模型標籤

開發 AI 功能時，使用 Ollama 的開發者常會假設 `:latest` 是萬用的標籤。然而，環境變數中指定的模型名稱必須與 `ollama list` 命令返回的結果**完全一致**，包括標籤在內。

如果你的環境變數是 `MODEL=mistral`，但實際拉下來的模型標籤是 `mistral:7b`，就會發生模型找不到的問題。

### OAuth redirect_uri 的三角一致性

OAuth 提供商（例如 Google）的設定同樣需要精確對應。你需要確保以下三項完全一致：

1. Google Console 中註冊的 Authorized redirect URIs
2. 程式中的 `NEXTAUTH_URL` 環境變數
3. 開發伺服器實際監聽的 port（通常是 `localhost:3000`）

任何一項不匹配，OAuth 流程就會失敗。尤其當從本地開發遷移到雲端時，這三項都需要更新。

## 中央配置管理策略

當多個消費者（不同的模組或元件）都需要讀取同一個配置時，改變其中一項設定可能需要修改多個檔案。解決這個問題的關鍵是**建立一個統一的 getter 函數**。

這個 getter 應該遵循明確的優先級：首先嘗試從環境變數讀取，如果失敗則使用 localhost 作為 fallback。這樣當你遷移到雲端時，只需修改一個地方（環境變數或 getter 的優先級邏輯），所有依賴它的模組都會自動適應。

## Docker 到雲端資料庫的完整遷移清單

從本地 Docker 遷移到雲端資料庫時，以下是我整理的檢查清單：

1. **修改配置 getter** — 調整環境變數的優先級，讓雲端配置覆蓋本地 fallback
2. **更新 `.env.shared`** — 填入實際的雲端連線字串（hosts、ports、credentials）
3. **移除條件邏輯** — 刪除形如 `if (CLOUD_ENV)` 的分支判斷，統一使用一套配置邏輯
4. **重寫資料庫重置指令** — 從 Docker 命令改為 psql 直接連線的方式
5. **刪除不再需要的 Docker 檔案** — Dockerfile、docker-compose 等只在本地使用的檔案
6. **更新測試環境** — 確保測試的資料庫連線也指向正確的環境
7. **更新文件** — 更新 README 和開發指南中的本地設定說明

## Payload CMS 的生產遷移陷阱

Payload CMS 有一個容易踩的坑：`push: true` 選項**只在 `next dev` 時有效**。當你在生產環境使用 `next start` 時，schema 變更完全不會觸發。生產環境必須使用 `prodMigrations` 來管理資料庫變更。

此外，Payload CLI 的 `payload migrate` 命令在 Node.js 24 + bun 的組合下會出現相容性問題。改用 bun 的內嵌執行功能來程式化呼叫 Payload 的 migration 方法，會是更穩定的方案：

```typescript
bun -e "import('./payload.ts').then(m => m.payload.db.createMigration({ ... }))"
```

當部署到空資料庫時，任何查詢空資料的函數都可能因表不存在而報錯。解決方法是在查詢函數中加入 try-catch，當資料庫為空時回傳空值，而不是拋出例外。這樣 `next build` 時的 prerender 才不會因為資料遺失而失敗。

## 實際應用場景

這些經驗教訓特別適用於以下場景：

- **第一次將應用部署到雲端** — 從本地 Docker Compose 遷移到雲端託管資料庫（AWS RDS、Supabase 等）
- **團隊多工作區開發** — 不同工程師在不同分支工作，需要同步環境配置
- **整合外部服務** — OAuth、AI 模型、第三方 API 等需要精確配置
- **Payload CMS 生產部署** — 從開發環境的自動 schema 推送切換到生產環境的手動遷移

關鍵是建立清晰的優先級體系、中央化的配置管理，以及詳細的遷移檢查清單。這樣才能確保開發和生產環境的一致性，避免環境變數相關的難以排除的 bug。
