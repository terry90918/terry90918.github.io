---
title: 'Claude Plugin 版本與路徑同步問題'
publishedAt: '2026-03-26T13:31:00+08:00'
status: 'draft'
slug: 'claude-plugin-version-path-sync'
tags:
  - claude-code-tools
  - claude-code
  - plugins
  - versioning
---

在更新 Claude Code 的 fork 外掛版本時，很容易遇到一個隱微但令人沮喪的問題：明明已經更新了代碼，外掛卻仍然引用舊的路徑，導致 `MODULE_NOT_FOUND` 錯誤。這個問題的根源在於 Claude Code 的外掛系統中存在兩套獨立的路徑機制。

## 兩套路徑機制

Claude Code 外掛系統在兩個不同的地方管理路徑：

首先是外掛源碼中的 `hooks/hooks.json`。這個檔案使用可攜式的路徑格式 `${CLAUDE_PLUGIN_ROOT}/...`，在外掛安裝時，系統會將其展開為絕對路徑，然後寫入使用者的 `~/.claude/settings.json` 中。

但這裡出現了問題：`~/.claude/settings.json` 中的路徑是硬編碼的絕對路徑，例如 `/Users/username/.claude/plugins/cache/everything-claude-code/everything-claude-code/1.11.0/...`。當外掛版本更新時，快取目錄會改變（比如從 `1.9.0/` 變成 `1.11.0/`），但 `settings.json` 中的路徑卻沒有自動更新，仍然指向舊版本的目錄。

這就是為什麼 `claude plugin update` 命令執行後，仍然會出現找不到模塊的錯誤——它更新了版本，卻沒有更新 `settings.json` 中的硬編碼路徑。

## 版本來自何處

理解外掛系統如何讀取版本號也很重要。外掛系統讀取的是 `.claude-plugin/plugin.json` 中的版本，**而不是** `package.json`。這是一個容易被忽視的細節。如果你只更新了 `package.json` 的版本號，而沒有更新 `.claude-plugin/plugin.json`，外掛系統仍然會看到舊版本。

## 完整的更新步驟

為了確保版本同步正確進行，需要遵循以下步驟。

首先，在 fork repo 中合併 PR 後，更新兩個版本檔案：

```bash
# 1. 更新 .claude-plugin/plugin.json（外掛系統讀取這個）
# 2. 同時更新 package.json（維持一致性）

git add .claude-plugin/plugin.json package.json
git commit -m "chore: bump version to X.Y.Z"
git push origin main
```

然後在本地機器上執行更新：

```bash
# 1. 更新本地的 marketplace 快取
cd ~/.claude/plugins/marketplaces/everything-claude-code
git pull origin main

# 2. 更新外掛（系統會從 .claude-plugin/plugin.json 讀取新版本）
claude plugin update "everything-claude-code@everything-claude-code"
# 預期輸出：「updated from X.Y.Z to A.B.C」

# 3. 修復 settings.json 中硬編碼的路徑
# 使用編輯工具，將所有「everything-claude-code/舊版本/」替換為「everything-claude-code/新版本/」

# 4. 重新載入外掛
# /reload-plugins

# 5. 清除舊快取（可選）
rm -rf ~/.claude/plugins/cache/everything-claude-code/everything-claude-code/舊版本/
```

## 為什麼不直接在 settings.json 中使用變數

有人可能會想，既然 `hooks.json` 中可以使用 `${CLAUDE_PLUGIN_ROOT}` 這樣的變數，為什麼不在 `settings.json` 中也這樣做呢？

原因是 `${CLAUDE_PLUGIN_ROOT}` 只在外掛的 `hooks.json` 中有效——外掛系統在安裝時會展開這個變數。一旦路徑被寫入 `settings.json`，就變成了字面上的字符串，執行時 shell 無法解析它（環境變數沒有被設定）。`settings.json` 中硬編碼絕對路徑是外掛系統的設計決策，不是使用者的選擇。

## 核心要點

整理一下關鍵的教訓：`.claude-plugin/plugin.json` 才是版本的真實來源，`package.json` 對外掛系統沒有影響。第二，`claude plugin update` 命令只會更新版本號，不會自動修正 `settings.json` 中的路徑——這部分需要手動完成。第三，在執行更新前，必須手動拉取 marketplace 快取，否則 `claude plugin update` 看不到新版本。最後，`${CLAUDE_PLUGIN_ROOT}` 變數只能在外掛內部使用，無法在 `settings.json` 中解析。

理解這些細節後，版本更新就不再是一個神祕的黑盒，而是一個清晰、可重複的流程。
