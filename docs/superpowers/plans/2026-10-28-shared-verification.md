# Shared verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** pre-commit 與 Woodpecker 執行同一套七階段驗證，最後才產生正式靜態輸出。

**Architecture:** `bun run verify` 呼叫單一 Node runner，依序執行格式、lint、型別、單元、整合、E2E、build；任一階段失敗即停止。Playwright 管理專用 Next.js 開發伺服器，因此測試不依賴預先存在的 `out/`。格式化基線與管線獨立交付，CV 圖表接續使用新管線。

**Tech Stack:** Bun、Node、Prettier、ESLint、TypeScript、Vitest、Playwright、Next.js、Woodpecker。

**Spec:** 使用者於 2026-10-28 明確要求的七階段順序，以及 `AGENTS.md` 的提交與發布規範。

## Global Constraints

- 格式化、ESLint、型別、單元、整合、E2E、正式建置，順序不得互換。
- pre-commit 與 CI 只維護一份驗證順序；OpenSpec／OpenAPI 驗證不屬於管線。
- 所有既有測試斷言保留，整合測試不得是空套件。
- 程式、測試與設定不新增註解。
- 自動產生的 CHANGELOG 與測試報告不是格式檢查對象；其他既有格式問題正常修正。

## Review Focus

- 任一階段非零退出後，不得繼續後續測試或 build。
- E2E 使用當前 checkout 的專用開發伺服器，不沿用其他分支的服務或舊匯出。
- 單元與整合測試各自有實際測例，缺少測例會失敗。
- CI 安裝 Chromium 及系統依賴，沒有瀏覽器時不能假通過。
- 測試伺服器退出後才能正式 build，避免共用 `.next` 寫入。

### Task 1: 單一驗證入口與測試分類

**Files:** `scripts/verify.mjs`、`package.json`、`vitest.config.ts`、`tests/integration/site-contract.test.tsx`、`tests/integration/cv-reference-copy.test.tsx`

- [x] 把真實頁面／內容組裝測試移入整合測試目錄，保留原斷言。
- [x] 以假的外部 Bun 邊界證明 runner 的七階段順序與失敗即停止，先看見失敗。
- [x] 實作 runner 與 unit/integration 命令，缺少測試不算通過。
- [x] 重跑單元與整合測試。

### Task 2: E2E 伺服器與入口接線

**Files:** `playwright.config.ts`、`.husky/pre-commit`、`.woodpecker/validate.yml`、`.prettierignore`、`AGENTS.md`、`CLAUDE.md`

- [x] Playwright 啟動當前 checkout 的 Next.js dev server，結束時關閉。
- [x] CI 安裝 Chromium 與必要系統套件；兩個入口都執行 `bun run verify`。
- [x] 格式檢查維護的 repo 檔案，正規化既有格式差異。
- [x] 從沒有舊匯出的狀態執行完整管線，核對各階段及最後 build。

### Task 3: 交付與後續 CV 整合

- [ ] 量測整份 PR；審查、CI、合併與部署逐項驗證。
- [ ] 將新主線合併至保留中的 CV 分支，解決指引／入口重疊，不 force-push。
- [ ] 用同一管線驗證 CV 原生三模式圖表，完成審查與公開發布。
