---
title: 'Claude Code 擴充套件選擇指南'
publishedAt: '2026-03-28T14:18:00+08:00'
status: 'draft'
slug: 'claude-code-extension-selection'
tags:
  - claude-code-tools
  - claude-code
  - extensions
  - setup
---

Claude Code 提供了相當豐富的擴充機制，但也正因為選項眾多，初次接觸的開發者往往面臨一個核心問題：何時該使用哪一種？在實務開發中，我發現這個決策牽涉到 context 成本、規則可重用性、和執行的自動化程度。今天我想分享一套決策框架，幫助你快速判斷。

## 七種擴充機制，何時用哪一種？

Claude Code 核心提供了七種擴充機制：CLAUDE.md、Skills、Subagents、Agent Teams、MCP、Hooks 和 Plugins。初看起來可能令人困惑，但其實各有明確的適用場景。

以下是最直白的決策表：

| 需求                       | 使用                   | 原因                        |
| -------------------------- | ---------------------- | --------------------------- |
| 「每次都要遵守 X 規則」    | **CLAUDE.md**          | 每個 session 自動載入       |
| 「參考這份 API 文檔」      | **Skill**              | 按需載入，不浪費 context    |
| 「執行部署流程」           | **Skill**（`/deploy`） | 可觸發的工作流程            |
| 「查詢我的 DB」            | **MCP**                | 連接外部服務                |
| 「研究這個問題的多個面向」 | **Agent Teams**        | 隊友獨立探索 + 相互討論     |
| 「讀很多檔案但只要摘要」   | **Subagent**           | Context 隔離，只回傳結果    |
| 「每次編輯後跑 lint」      | **Hook**               | 確定性腳本，零 context 成本 |
| 「打包分享給其他專案」     | **Plugin**             | 封裝 skills + hooks + MCP   |

看起來簡單，但理解它們的深層差異才是關鍵。

## CLAUDE.md 與 Skill 的取捨

這是最常見的困惑點。兩者都可以存放「指引」，那為什麼要分開？

**CLAUDE.md** 是你的「專案憲法」——每個 session 開始時就會自動載入整個檔案。這很適合存放**每次都必須遵守的規則**：coding style、git workflow、禁止事項、quick reference 等。但也正因為每個請求都會帶著它，一旦超過 200 行，就開始吞噬有限的 context window。

**Skill** 則像是「按需提供的參考資料」。你只有在明確使用它時（或我主動判斷需要它時），內容才會被載入。最適合用來存放：API 文檔、查詢範本、部署流程、複雜的決策樹。一份好的 Skill 可以被多個專案重複使用，且不會在無關的請求中產生 context 成本。

所以實務上的做法是：

- **CLAUDE.md** 放規則和原則（< 200 行）
- **Skill** 放工作流程和參考資料（300+ 行沒問題）
- 超過 500 行的 CLAUDE.md？拆成多個 Skill 或使用 `.claude/rules/` 目錄結構

## Subagent 與 Agent Teams：平行探索的不同層級

假設你需要研究一個問題，但它有多個面向——有人該查 API 文檔、有人該掃 codebase、有人該驗證假設。這時你有兩條路。

**Subagent** 是同一個 session 內的幫手。他們各自去執行任務，然後回傳結果給你。context 被隔離（他們的思考不會佔用你的 token），他們也不會互相溝通——只有你和每個 subagent 之間有對話。這種模式很省 token，適合「簡單的分工」：一個 agent 讀文件摘要、一個 agent 掃 codebase、一個 agent 驗證。

**Agent Teams** 是升級版。每個隊友有獨立的 session，他們可以互相留言、互相引用彼此的發現、甚至互相質疑。這比較像真實團隊運作，但 token 成本也高得多——因為每個 session 都是獨立的對話記錄。

選擇的轉折點很清楚：**如果 subagents 需要互相溝通、討論、協商，就該升級為 Agent Teams。**

## MCP 與 Skill 的搭配

MCP（Model Context Protocol）是連接外部系統的通道。它的責任是「連接」——無論是資料庫、GitHub API、或內部工具。Skill 的責任是「教會你怎麼用」。

它們是互補的：MCP 提供能力，Skill 提供智慧。一個完整的設定看起來像這樣：

- **MCP**：連接到 PostgreSQL，提供 query 和 mutation 工具
- **Skill**：教你正確的 schema（哪些表、哪些欄位）、常見的查詢模式、和最佳實踐

光有 MCP 不知道怎麼用？那是 Skill 的工作。光有 Skill 但沒有 MCP？那也白搭——沒辦法執行。

## 四種機制的 Context 成本對比

這是實務決策的核心。每種機制佔用 context 的方式完全不同：

| 機制      | 載入時機     | Context 成本                            |
| --------- | ------------ | --------------------------------------- |
| CLAUDE.md | Session 開始 | 每次請求都在 context 中                 |
| Skills    | 使用時       | 低（description 常駐，內容按需）        |
| MCP       | Session 開始 | 低（tool names 常駐，詳細 schema 按需） |
| Subagents | 觸發時       | 零（完全隔離 context）                  |
| Hooks     | 觸發時       | 零（外部執行，不經過 Claude）           |

這意味著什麼？如果你在做一個 context 緊張的工作（例如處理大型 codebase 或長篇內容），優先考慮用 Subagent 或 Hook 來卸載工作。CLAUDE.md 保持精簡。Skills 用來存放體積大的參考資料。

## 覆蓋順序與合併規則

Claude Code 有一套優先順序邏輯。理解它能幫助你避免設定衝突。

- **CLAUDE.md**：累疊生效（user 全域的 + project 級別的都會載入）
- **Skills**：同名覆蓋（managed > user > project）
- **MCP**：同名覆蓋（local > project > user）
- **Hooks**：合併（來自各層級的 hooks 都會觸發，順序按 PostToolUse 優先）

實際例子：如果你在全域 Skills 定義了 `deploy`，然後在專案級別又定義了同名的 `deploy` Skill，專案級別的會覆蓋全域的。但 CLAUDE.md 不一樣——user 全域的規則和 project 級別的規則都會在 session 開始時載入，形成累疊效果。

## 實務建議：選擇的思考流程

當你考慮新增任何擴充時，可以按這個順序自問：

1. **這是一條規則，還是一份參考資料？**
   - 規則 → CLAUDE.md（頻繁應用）
   - 參考 → Skill（按需使用）

2. **這需要連接外部系統嗎？**
   - 是 → 優先 MCP
   - 否 → 考慮 Skill 或 Subagent

3. **這應該自動執行嗎？**
   - 是（每次編輯後 lint、每次提交前檢查）→ Hook
   - 否 → Skill 或手動觸發

4. **這個操作會佔用很多 token 嗎？**
   - 是 → 用 Subagent 隔離 context
   - 否 → 直接操作或 Skill 都可以

5. **我想打包分享給其他專案嗎？**
   - 是 → Plugin（整合 skills + hooks + MCP）
   - 否 → 保持鬆散的 Skill / Hook

## 結尾：建立自己的擴充生態

Claude Code 的設計理念是「按需載入」。好的設定不是把所有東西都塞進 CLAUDE.md，而是分散到合適的層級，讓每個機制各司其職。

開始一個新專案時，可以這樣逐步構建：

- 第一步：寫基礎的 CLAUDE.md（100-150 行的核心原則）
- 第二步：識別出體積較大的參考資料或流程 → 拆成 Skills
- 第三步：需要連接外部服務 → 配置 MCP
- 第四步：有重複的編譯、檢查工作 → 加入 Hooks
- 第五步：多個專案共享這套設定 → 打包成 Plugin

這樣不只能讓單個 session 更高效，也能逐步建立一套個人或團隊的 Claude Code 生態。
