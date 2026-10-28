# Work 與 CV 完整個人頁資訊 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 訪客免登入即可讀取原頁所有作品、統計、活動圖與工具資訊。

**Architecture:** 以一份來源快照提供作品資料與雙語 CV 統計。Work 放作品卡片及活動圖，CV 放五項統計、分析與外掛，兩頁互相連結。圖表與預覽由真實頁面擷取，保留原有視覺。

**Tech Stack:** Next.js、React、TypeScript、現有 shadcn 元件與 CSS、Vitest、Playwright。

**Spec:** `docs/superpowers/specs/2026-10-28-work-gallery-design.md`

## Global Constraints

- 全部五項統計、四項深入分析、四個熱門外掛、五項作品與三種活動檢視均保留。
- 不寫程式註解，不更改 Sites 權限，不編造圖表數據。
- 明確顯示資料來源與擷取日期，保留案例 URL 與文章內容。
- 使用既有隔離 worktree，依已授權範圍完成審查、CI、合併與發布。

## Review Focus

- 圖片來自真實來源，不能使用會到期的外部截圖網址。
- 英文 CV 單位及日期與中文一致。
- 手機窄螢幕、鍵盤與深淺主題下仍可閱讀所有內容。
- Ochre Chess 登入需求與 ASCII Sharks 原始專案署名清楚呈現。
- 作品入口回到 `/work`，舊案例與 CV 不失效。

### Task 1: 來源快照與展示資料

**Files:** `lib/site/showcase.ts`、`public/images/work/`、`public/images/codex/`

- [x] 讀回原頁完整統計、活動圖模式與外掛圖示，保存自有靜態資產。
- [x] 核對五個作品預覽、直接網址及未登入狀態。
- [x] 建立單一來源資料與來源日期。

### Task 2: Work 與 CV 實作

**Files:** `app/(frontend)/work/page.tsx`、`components/CodexActivity.tsx`、`components/CodexProfile.tsx`、`styles/showcase.css`、`components/cv/cv-home.tsx`、`components/BlogHeader.tsx`、首頁與 About。

- [x] 在 `tests/unit/showcase.test.tsx` 寫入完整資訊、雙語與歸屬斷言，確認先失敗。
- [x] 實作作品卡片、三種活動檢視及完整 CV 統計／分析／外掛 UI。
- [x] 恢復首頁、About 與桌面／手機作品導覽至 `/work`，調整現有測試。
- [x] 加入明確的資料日期、來源、登入限制與署名。
- [x] 執行單元測試、全專案 lint、typecheck、OpenSpec 與 build。

### Task 3: 驗收與發布

- [x] 實測桌面、手機、鍵盤與雙主題，核對 Work 與中英文 CV，保存畫面。
- [ ] 量測完整 PR 大小，取得 pstack interrogate 與 no-comments 審查。
- [ ] Ready PR 取得一次 Codex 與 CodeRabbit 結果及 current-head Woodpecker success。
- [ ] 合併後確認相同版本 CI、Pages 與公開頁面 readback，更新 Linear。
