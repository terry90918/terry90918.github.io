---
title: 'GitHub Actions PR 工作流程的權限範圍'
publishedAt: '2026-03-25T12:28:00+08:00'
status: 'draft'
slug: 'github-actions-pr-workflow-scope'
tags:
  - infrastructure-deployment
  - github-actions
  - ci-cd
  - permissions
---

GitHub Actions 是現代 CI/CD 工作流的基石，但當你第一次在 pull request 中修改 workflow 文件時，很容易遇到一個令人困惑的現象：修改看起來沒有生效。

## 問題現象

假設你在一個 feature branch 中修改了 `.github/workflows/claude-code-review.yml`，期待這個修改在同一個 PR 的 CI 檢查中立即生效。但當你推送 commit 時，發現 workflow 仍然運行的是舊版本的定義。是不是修改沒有被保存？還是 GitHub 有什麼緩存機制？實際上都不是。

## 原因：Base Branch 定義優先

GitHub Actions 有一個關鍵的設計決策：當使用 `pull_request` trigger 時，workflow 的定義**完全來自 base branch**（通常是 `main`），即使你在 PR branch 中修改了該 workflow 文件。

換句話說：

- **新增的 workflow 文件**：如果你在 PR branch 中新增 `.github/workflows/new-check.yml`，這個 workflow 完全不會運行
- **修改的 workflow 文件**：即使你在 PR branch 中更新了 workflow 的邏輯，GitHub Actions 也會忽視這些修改，繼續使用 base branch 的版本
- **生效時機**：只有當你的修改被合併到 base branch 後，後續的 PR 才會使用新的 workflow 定義

這個設計的邏輯是為了安全性考慮——防止 malicious 的 PR 通過修改 CI workflow 來繞過安全檢查。

## 解決方案

如果你急需在 PR 中立即看到 workflow 的修改效果，有一個簡單的解決方案：

1. 先將 workflow 修改**單獨合併到 base branch**（作為一個單獨的 commit 或 PR）
2. 然後，後續對該 PR 的任何推送都會使用更新後的 workflow 定義

這相當於「先修改規則，再運行比賽」的思路。

## 重要例外

並非所有 trigger 都遵循這個規則。`workflow_dispatch` 和 `push` trigger **確實使用 branch 自己的 workflow 定義**。這意味著，如果你在本地 push 到一個 branch（不通過 PR），GitHub Actions 會立即使用該 branch 最新的 workflow 文件。

## 實踐建議

當你需要修改 GitHub Actions workflow 時，記住這幾點：

- 如果修改是針對 `pull_request` workflow，先在 base branch 上提交，再在 PR 中驗證效果
- 在開發過程中調試 workflow，可以利用 `workflow_dispatch` 在 branch 上手動觸發，快速迭代
- 如果要測試某個 workflow 邏輯，可以在 feature branch 上用 `push` event 觸發測試，因為 `push` trigger 會使用當前 branch 的定義
- 團隊中明確溝通 workflow 修改的部署流程，避免「為什麼我的修改沒有生效」這類的困惑

理解 GitHub Actions 的這個行為特性，能幫助你設計更清晰的 CI/CD 工作流，也能在調試時更快地定位問題根源。
