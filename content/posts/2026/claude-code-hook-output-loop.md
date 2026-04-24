---
title: 'Claude Code Hook 輸出迴圈陷阱'
publishedAt: '2026-03-22T18:49:00+08:00'
status: 'published'
slug: 'claude-code-hook-output-loop'
tags:
  - claude-code-tools
  - claude-code
  - hooks
  - debugging
---

每次設計 Claude Code hook 自動化時，我都會陷入一個常見的認知陷阱：把它當成傳統的 git hook 或 CI hook 來處理。結果往往導致在 shell script 內塞進一堆複雜的邏輯，不得不為 hook 配置額外的 API token、呼叫外部服務、處理錯誤重試——整個設計變得笨重且難以維護。

後來我才意識到，我完全誤解了 Claude Code hook 的運作模式。

## Hook 與 Claude Session 的迴圈關係

Claude Code hook 的關鍵區別在於它不是獨立的自動化工具。hook 的輸出會直接回傳給 Claude session，形成一個**輸出回傳循環**：

```
Hook 觸發 → Shell script 執行 → stdout 輸出 → 回到 Claude session → Claude 看到並行動
```

這意味著 hook 不需要自己完成所有事情。Claude session 有完整的工具箱：所有 MCP tools（Notion、GitHub、Telegram 等）、檔案操作（Read、Write、Edit）、搜尋工具（Grep、Glob），甚至瀏覽器自動化（claude-in-chrome）。Hook 只需要偵測條件並發出提醒，其餘的交給 Claude 去執行。

## 正確設計：Hook 負責偵測，Claude 負責執行

讓我用實際例子說明。假設我想在代碼中偵測到某個文件變動時自動同步到 Notion。

**正確的做法**是讓 hook 專注於偵測和輸出：

```bash
#!/bin/bash
# Hook: 偵測條件 → 輸出指令給 Claude
input=$(cat)
file_path=$(echo "$input" | grep -o '"file_path":"[^"]*"' | head -1 | sed 's/"file_path":"//;s/"//')

if echo "$file_path" | grep -q 'target/pattern'; then
  echo "[Action Required] 偵測到檔案變更，請使用 Notion MCP 建立學習記錄：$file_path"
fi
```

Hook 只輸出一句話。Claude 看到這句話後，會自動選擇合適的 MCP tool 來完成同步操作。整個流程簡潔且高效。

## 常見的反模式

我以前犯過的錯誤是讓 hook 自己去呼叫外部 API：

```bash
# ❌ 反模式：Hook 內部處理所有邏輯
curl -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parent": {...}, "properties": {...}}'
```

這樣做的問題是：

- Hook 需要管理 token（安全隱患）
- Hook 需要處理 API 錯誤和重試邏輯
- 當 API 改變時，hook 也要改變
- Hook 無法利用 Claude 的上下文理解能力

## 何時使用這個設計模式

只要你在設計 Claude Code hook 自動化，就應該牢記這個原則：

- **設計任何 Claude Code hook 自動化時** — 先問自己「這個偵測邏輯該由 hook 做，還是輸出給 Claude 做？」
- **當 hook 需要存取外部服務時** — Notion、GitHub、Slack 等都有對應的 MCP tool，hook 應該只輸出提醒
- **當你以為 hook「無法做到某件事」時** — 先想想 Claude session 能不能做到。大多數情況下，答案都是能

改變這個思維方式後，我設計的 hook 變得簡潔清晰，而且 Claude 能基於完整的上下文信息做出更好的決策。Hook 回到了它應有的角色：信息偵測器，而不是任務執行器。
