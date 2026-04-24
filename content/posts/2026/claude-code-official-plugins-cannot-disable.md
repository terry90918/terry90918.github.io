---
title: 'Claude Code 官方 Plugin 無法停用的限制'
publishedAt: '2026-04-02T12:44:00+08:00'
status: 'published'
slug: 'claude-code-official-plugins-cannot-disable'
tags:
  - claude-code-tools
  - claude-code
  - plugins
  - limitations
---

在使用 Claude Code 時，有時你會碰到一個令人沮喪的情況：某個 plugin 在 `/plugin` UI 中顯示「not installed in user scope」的錯誤訊息，怎麼試都卸載不掉。即使你看著 `installed_plugins.json` 檔案，清楚地看到該 plugin 確實存在於 user scope 中，UI 的 Uninstall 按鈕仍然拒絕執行。這不是 bug，而是 Claude Code 官方 plugin 系統的一個設計限制。

## 問題的根源

Claude Code 的 plugin 管理機制分散在三個不同的地方：安裝清單、啟用設定，以及本地快取。當你嘗試透過 UI 卸載時，系統只會操作其中某些部分，導致 plugin 殘留的痕跡散落各處。即使你手動編輯 `installed_plugins.json` 移除了 plugin 項目，系統仍然會在 `settings.json` 中找到啟用狀態的記錄，或者從快取目錄重新載入。

## 完整移除方案

為了徹底卸載一個不聽話的 plugin，你需要同時處理三個位置，缺一不可：

**第一步：編輯 `~/.claude/plugins/installed_plugins.json`**

打開這個檔案，找到目標 plugin 的整個 JSON 區塊（包含 `scope`、`installPath`、`version` 等欄位），把它完整移除。

**第二步：編輯 `~/.claude/settings.json`**

找到 `enabledPlugins` 物件，移除該 plugin 對應的設定行。例如如果你要移除 Notion plugin，就刪掉類似 `"notion@marketplace": false` 的這一行。

**第三步：刪除快取目錄**

執行：

```bash
rm -rf ~/.claude/plugins/cache/<marketplace-name>/<plugin-name>
```

例如移除 Notion plugin：

```bash
rm -rf ~/.claude/plugins/cache/claude-plugins-official/notion
```

**第四步：完整重啟 Claude Code**

這是最容易被忽略卻最關鍵的一步。不是 reload，也不是重新開一個標籤頁，而是完全關閉應用程式再重新打開。只有這樣才能清除應用層級的 plugin 狀態。

## 為什麼以前的方法都失敗了

如果你只嘗試過以下這些方法，難怪 plugin 還在跟著你：

只在 `enabledPlugins` 中設定為 `false`？不行——plugin 仍然會被初始化和載入，hooks 照樣執行。

只刪快取目錄？不行——下次啟動時系統會根據 `installed_plugins.json` 重新下載。

只用 UI 的 Uninstall 按鈕？那就是我們一開始碰到的問題，會報 scope 錯誤。

設定環境變數 `CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL=1`？沒有驗證過有效。

Claude Code 的設計要求你必須同時更新這三個位置，系統才會真正忘記那個 plugin。這像是一個分散式系統的一致性問題——任何一個位置的資訊不完整，整個系統就會根據記憶中的另一份副本恢復該 plugin。

## 何時需要這招

如果你遇到以下情況，這個方案就派上用場了：

- `/plugin` UI 執行卸載時報 scope 相關的錯誤
- Plugin 在列表中顯示「not found in marketplace」，但仍然出現在啟用狀態中
- 某個 plugin 已損壞或過時，需要徹底清除所有痕跡

值得注意的是，這個限制背後還有一些已知的相關問題：官方 plugin 有時會在關閉啟用後自動重新安裝、被停用的 plugin 仍會透過 SessionStart hooks 注入上下文、hooks 仍會繼續執行。這些都指向同一個核心問題——Claude Code 的 plugin 生命週期管理需要更完善的協調機制。

下次如果遇到卸載失敗的情況，記住這三步加一次完整重啟。比起反覆點 UI 的 Uninstall 按鈕，直接編輯檔案往往更快更可靠。
