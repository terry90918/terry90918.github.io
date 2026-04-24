---
title: '架構決策前先評估業界標準'
publishedAt: '2026-04-07T12:05:00+08:00'
status: 'draft'
slug: 'align-with-industry-standards'
tags:
  - debugging-diagnostics
  - architecture
  - decision-making
  - best-practices
---

在架構決策前，我習慣問自己一個關鍵問題：這個功能真的需要嗎？還是只是因為規格說了就實作？

這個問題的重要性，在我審視 LLM agent 架構、對比 Claude Code 和 OpenAI Codex 的設計時，變得格外清晰。我發現許多系統陷入一個常見的陷阱——將規格裡的每個特性都當成必須實作的清單項目，卻忽略了一個事實：**不是每個規格功能在實務中都被用上**。

## 規格與現實的落差

想像一下，你拿到一份全新的協議或 SDK 文件，上面列出了十幾項特性。你可能傾向於「既然都在規格裡，就全部實作吧」。但實際上，很多時候這樣做只會浪費精力，還得承擔額外的維護負擔。

我見過不少例子：

- 實作 Claude Code 的所有權限層級，卻沒搞清楚哪些適用於 Web SaaS，哪些只適用於 CLI
- 因為 MCP 規格定義了 Prompts，就直接實作它，即使 Plugin Skills 已經提供了同樣的功能
- 在架構裡加入 WebSocket 傳輸，只因為 MCP 規格支援它，但實際上業界標準是 stdio 和 HTTP
- 沿用舊 SDK 名稱，只因為原始設計文件寫的就是這樣

## 用三個來源驗證設計決策

在動手實作任何架構決策前，我現在會查證三個來源：

**第一個：官方文件**
用 Context7 查看規格和 SDK 的正式定義。這奠定了基礎——告訴你*規格說了什麼*。

**第二個：實際應用**
透過 deep-research 或 exa，找出 Claude Code、OpenAI Codex 和其他工具*實際上是怎麼用*的。這才是真相的來源——不是理想的設計，而是真實世界的選擇。

**第三個：現有程式碼**
用 Explore agent 看看你的產品*已經怎麼解決*這個問題。有沒有可能已經有相似的功能了？

拿到這三個訊息後，決策變簡單了：

- 如果**內部和外部使用者都有**，就實作
- 如果**只有外部使用者**，看看有沒有實際使用的證據，有就實作
- 如果**根本沒有人用**，不要實作，頂多標為未來工作
- 如果**現有功能已經涵蓋了**（比如 Plugin Skills 和 MCP Prompts），就不要重複

## 一個真實例子

以 MCP Prompts 為例。當時我在評估要不要實作它：

規格告訴我，MCP 有三大原語：Tools、Resources 和 Prompts。聽起來 Prompts 應該是基本功能。

但我查了 Claude Code 和 Codex 的實際使用方式，他們都用 plugin 格式（skills/ 目錄加 .mcp.json），並不用獨立的 MCP Prompts。再看看 JurisLM 現有的 InProcessMcpAdapter，只公開了 listTools 和 callTool，並沒有 listPrompts。

結論很清楚：移出實作範圍。省了不少工作，減少了未來的維護成本。

## 什麼時候該用這個方法

- 目標架構包含某個規格或協議的功能時
- 從 CLI 工具（比如 Claude Code）的概念轉移到 Web SaaS 時
- 在實作「因為規格要求」的功能前
- 評估該用哪個 SDK 或函式庫，而且不確定它有沒有被更新的版本取代時

最後的建議：下次看到架構清單時，問問自己「業界真的在用這個嗎？」答案往往會讓你的設計變得更簡潔、更務實。
