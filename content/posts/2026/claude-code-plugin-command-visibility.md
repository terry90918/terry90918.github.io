---
title: 'Claude Code Plugin 指令可見性控制'
publishedAt: '2026-04-10T21:40:00+08:00'
status: 'published'
slug: 'claude-code-plugin-command-visibility'
tags:
  - claude-code-tools
  - claude-code
  - plugins
  - commands
---

在使用 Claude Code Plugin 開發過程中，你可能會遇到一個令人沮喪的問題：新增了 command 或 skill，卻在 autocomplete dropdown 中看不到它。這個情況比你想像的更常見，而且原因往往出人意料地簡單。

## 為什麼你的 Plugin 指令消失了？

Plugin 的指令不出現在 autocomplete 中，通常有三個主要原因。首先，**名稱可能太短了**。如果你的 command 或 skill 只有 2 個字元（比如 `pr`），autocomplete 根本不會顯示它。這不是 bug，而是系統的設計選擇——短名稱容易造成誤觸發。

其次，**cache 可能已過期**。Claude Code 會在第一次安裝 plugin 時緩存所有檔案，記錄著 `installedAt` 的時間戳。如果你在 PR merge 之後才查看，但 cache 的時間戳早於 merge，系統就看不到新加入的指令。

第三個常見的陷阱是**誤加 plugin.json 的欄位**。許多開發者會在 `plugin.json` 中手動添加 `"skills"` 或 `"commands"` 陣列，以為這樣能註冊指令。實際上這是多餘的——Claude Code 會自動掃描 `skills/` 和 `commands/` 目錄，不需要在 manifest 中手動列舉。

## 如何診斷問題

當問題出現時，按照這個步驟逐一排查。

首先，驗證你的檔案是否已被緩存：

```bash
ls ~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/commands/
ls ~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/skills/
```

如果檔案存在，接下來檢查 cache 的時間戳。你可以查看 `~/.claude/plugins/installed_plugins.json` 中 `installedAt` 的值，比對 PR merge 的時間。如果 cache 明顯更早，那就是問題所在。

```bash
python3 -c "import sys,json;d=json.load(sys.stdin);print(d['plugins']['<plugin>@<marketplace>'][0])" < ~/.claude/plugins/installed_plugins.json
```

若 cache 確實過時，強制重新拉取會解決問題。在 Claude Code 中執行 `/plugin marketplace update <marketplace>` 或 `/plugin update <plugin>@<marketplace>`。

最後，如果檔案存在且 cache 也是最新的，那就檢查名稱長度。**command 或 skill 的名稱至少要 3 個字元**。如果你的指令叫 `pr`，改名為 `pr-review` 就會出現在 autocomplete 中。

## 重新思考命名和自動發現

Plugin 的指令發現機制比許多開發者想像的更簡潔。Claude Code 會**自動掃描** `skills/` 和 `commands/` 目錄內的所有檔案，不需要在 `plugin.json` 中做任何聲明。換句話說，預設目錄的內容會自動被找到。

`plugin.json` 中的 `"skills"` 和 `"commands"` 欄位只在一種情況下才有用：當你想指定額外的目錄時，例如 `./admin-commands/` 之類的非標準位置。對於標準目錄，這些欄位完全可以省略。

另一個細節是 frontmatter 中的 `name` 欄位。它是可選的。如果你不提供，Claude Code 會用檔名作為指令名稱。有無 `name` 欄位都不影響自動發現的過程。

## 跨越 CI 的陷阱

有時候問題不在 plugin 本身，而在自動化流程。如果你的 CI 在版本檢查時報告 `manifest: null`，很可能是 `jq` 查詢出了問題。

這是常見的錯誤模式：

```bash
# ❌ 陷阱：如果 jq 查不到 key，會返回字串 "null" 但 exit code 為 0
# 因此 || 分支永遠不會觸發
MANIFEST_VER=$(jq -r '.[""]' file 2>/dev/null || jq -r '.["."]' file)
```

正確的做法是直接用正確的 query：

```bash
# ✅ 直接用對的 path
MANIFEST_VER=$(jq -r '.["."]' .release-please-manifest.json)
```

差別在於：前者依賴 fallback 邏輯來修正錯誤的 query，但 `jq` 的 exit code 行為會讓 fallback 永遠不執行。後者則是一開始就用對的 query，避免這個陷阱。

## 實務建議

總結一下避免這些問題的方法：

**命名時至少使用 3 個字元**，最好用描述性的名稱，例如 `pr-review` 而非 `pr`。這不只讓 autocomplete 更容易找到，也讓其他開發者一眼就明白這個指令的用途。

**信任自動發現機制**。把 skill 和 command 檔案放在標準目錄（`skills/` 或 `commands/`），然後忘掉 `plugin.json` 中的 `"skills"` 和 `"commands"` 欄位吧。系統會自動找到它們。

**當指令不出現時，先檢查 cache**。許多時候不是你的程式碼有問題，而只是 Claude Code 還沒看到最新的版本。強制更新 plugin 通常能解決問題。

**在 CI 中謹慎使用 jq**。不要依賴 fallback 邏輯來隱藏查詢錯誤，而是一開始就確保 query 路徑正確。這樣更容易測試，也避免了難以追蹤的間歇性故障。

這些問題都不難解決，關鍵是理解系統的運作方式，而非把它當成黑盒。下次遇到類似情況，按照這套流程診斷，通常幾分鐘內就能找到原因。
