---
title: 'Pre-commit 分層驗證策略'
publishedAt: '2026-03-28T14:33:00+08:00'
status: 'draft'
slug: 'precommit-layered-verification'
tags:
  - testing-quality
  - git
  - pre-commit
  - testing
  - ci
---

在 Monorepo 的開發過程中，我經常遇到一個令人沮喪的問題：每次執行 `git commit` 時，pre-commit hook 都要耗費好幾分鐘。深入分析後發現，罪魁禍首是 hook 中跑著的全量測試——它竟然佔據了整個流程 98% 的時間。當你只是修改了一個小檔案，卻要等上兩分鐘才能完成 commit，開發體驗可想而知。

## 問題根源

典型的 pre-commit hook 通常會執行這個序列：

- 程式碼格式化（format）
- 靜態檢查（lint）
- 型別檢查（typecheck）
- **跑全量測試**

在單一專案裡，這個流程還算可以接受。但在 Monorepo 中，測試數量成倍增長，format 和 lint 本來只需 1-2 秒，結果整個 hook 在測試上花掉 2 分鐘，完全打破了開發節奏。

## 分層驗證的思路

與其在 pre-commit 就進行全面檢驗，不如把驗證工作按時機分散到三個層級——每層只做必要的事，這樣既能保證品質，又不會拖累開發速度。

### 三層驗證架構

| 層級           | 觸發時機     | 執行內容                             | 目標耗時         |
| -------------- | ------------ | ------------------------------------ | ---------------- |
| **pre-commit** | `git commit` | lint-staged 風格檢查 + 型別檢查      | < 5 秒           |
| **pre-push**   | `git push`   | 型別檢查 + 受影響 package 的測試     | < 30 秒          |
| **CI**         | PR/merge     | 全量 lint + typecheck + test + build | 不限（背景執行） |

## 實作細節

### 第一層：pre-commit（快速反饋）

pre-commit 的目標是快速捕捉最明顯的問題——程式碼格式和型別錯誤。這裡用 Husky 搭配 lint-staged：

```bash
# .husky/pre-commit
bunx lint-staged
bunx turbo typecheck
```

配合 package.json 中的 lint-staged 設定：

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,yaml}": ["prettier --write"]
  }
}
```

lint-staged 的妙處在於，它只會對你實際改動的檔案執行 linter，而不是整個專案。結合 Turborepo 的 typecheck，通常能在 5 秒內完成。

### 第二層：pre-push（區域測試）

pre-push hook 在你執行 `git push` 時觸發。這時我們可以跑一個更全面但仍有範圍的檢驗——針對你這次改動影響到的 package 進行測試。

```bash
# .husky/pre-push
bunx turbo typecheck
bunx turbo test --filter=...[origin/main]
```

Turborepo 的 `--filter=...[origin/main]` 是個聰明的特性，它會自動分析你相對於 `origin/main` 的改動，只執行受影響 package 的測試。假設你改了 API package，那就只跑 API 相關的測試，而不會去碰前端的測試。這樣通常能在 30 秒內完成。

### 第三層：CI（完整驗證）

最後一層放在 CI 環境。PR 合併時，CI pipeline 會執行全量的 lint、typecheck、測試和構建。由於 CI 是非互動式的背景工作，時間成本已不那麼關鍵，品質才是重點。

## 實踐這個策略的好處

- **開發體驗提升**：commit 不再是瓶頸，通常幾秒鐘就完成
- **品質未降低**：測試並未被跳過，只是移到適當的時機執行
- **成本合理化**：快速反饋（秒級）用來驗證個人的改動，完整驗證（分鐘級）只在要推向主線時才執行

## 何時該採用這個方案

如果你的 Monorepo 有以下特徵，就很值得考慮：

- pre-commit hook 已經超過 10 秒鐘
- 開發隊伍在抱怨 commit 太慢
- 你想在不降低品質的前提下加速整個流程

這套分層驗證策略對我的開發流程改善很大——希望它也能幫助你。
