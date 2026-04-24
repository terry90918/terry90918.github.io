---
title: 'Notion MCP 更新 Mermaid 與 Code Block 的陷阱'
publishedAt: '2026-04-05T14:50:00+08:00'
status: 'draft'
slug: 'notion-mcp-mermaid-code-block-traps'
tags:
  - tooling-workflow
  - notion
  - mcp
  - mermaid
---

最近在透過 Notion MCP 更新包含 Mermaid 架構圖和程式碼區塊的頁面時，遇到了幾個令人沮喪的格式陷阱。這些問題看似簡單，但會直接導致頁面內容破損或圖表解析失敗。讓我分享一下我學到的教訓。

## 換行符號被當成字面文字

使用 `replace_content` 更新內容時，如果 `new_str` 參數包含 `\n`，Notion MCP 會把它當作兩個字面字元 `\` 和 `n`，而不是真正的換行符。結果整個頁面內容會被壓成一行亂碼，非常難以排查。

我一開始以為是 JSON 序列化的問題，花了不少時間在調試字元轉義。後來才發現，正確的做法是**避免使用 `replace_content` 來處理包含多行內容的區塊**。改用 `update_content` 配對 `old_str` 和 `new_str` 會更可靠。

如果非得用 `replace_content`，務必確保傳遞的 JSON 中的換行是真正的換行字元，而不是轉義序列。

## Mermaid 圖表中的引號轉義問題

更棘手的是 Mermaid 相關的陷阱。在 `update_content` 中，如果你在 Mermaid 程式碼區塊裡寫入含有 `\"` 的內容，Notion MCP 會將其存儲為字面的反斜線加引號，導致 Mermaid 解析器完全崩潰：

```
Parse error: Expecting 'SEMI', got 'INVTRAPSTART'
```

這類錯誤訊息往往指向引號位置，但真正的問題在於轉義字元被誤解了。正確的做法是**直接在 Mermaid 節點標籤中使用普通的 `"` 引號，不要手動加反斜線轉義**。讓 JSON 序列化器自然地處理引號，而不是試圖提前轉義。

## 修復的完整流程

遇到這類問題時，我的除錯流程是這樣的：

首先用 `notion-fetch` 確認當前頁面的實際狀態——看看是 Mermaid 解析錯誤還是整頁亂碼。

如果 Mermaid 圖表出現 Parse error 且錯誤指向引號，就用 `update_content` 替換整個 mermaid 程式碼區塊，新內容中的標籤使用正常的 `"` 而不帶反斜線。

如果整個頁面變成一行亂碼（通常是 `\n` 問題），則需要用 `replace_content` 重寫，但這次要特別檢查 JSON 中的換行是否正確序列化。

最後再用 `notion-fetch` 驗證修復結果，確保頁面和圖表都正常渲染。

這些陷阱都源於 Notion MCP 和 JSON 序列化之間的細微差異。只要理解了引號和換行符的處理方式，大多數問題都能迅速解決。
