---
title: 'LLM 應用程式資料持久化架構設計'
publishedAt: '2026-04-05T22:06:00+08:00'
status: 'draft'
slug: 'llm-app-data-persistence-architecture'
tags:
  - business-logic-algorithms
  - llm
  - architecture
  - database
  - persistence
---

在設計 LLM 應用架構時，我發現一個反覆出現的問題：很多人傾向於在系統架構圖上直接畫出 `LLM <--> DB` 的箭頭，似乎暗示 LLM 可以直接與資料庫互動。然而，這個認知偏差會導致安全邊界模糊，責任分層也不清楚。

## 業界共識：LLM 必須無狀態

實際上，所有成熟的 AI 應用框架和工具都遵循同一個核心原則——**LLM 本身是無狀態的**。所有的資料持久化操作都不由 LLM 直接負責，而是透過中介層（中間抽象層）進行。

這個中介層的職責是連接 LLM 與實際的儲存後端。典型的架構堆疊看起來像這樣：

```
LLM 元件（無狀態）
     ↓
中介抽象層（Checkpointer / StorageContext / Session / onFinish）
     ↓
儲存後端（PostgreSQL / Redis / SQLite / Vector DB）
```

## 各大框架的中介層設計

讓我們看看業界主流框架如何實現這個模式：

| 框架              | 中介層名稱                                 | LLM 對資料庫的感知程度 |
| ----------------- | ------------------------------------------ | ---------------------- |
| LangGraph         | Checkpointer + Store（編譯時注入）         | 零                     |
| LlamaIndex        | StorageContext（建立 index 時注入）        | 零                     |
| Vercel AI SDK     | 開發者自定義 API route + onFinish callback | 零                     |
| OpenAI Agents SDK | Session（Runner.run() 時注入）             | 零                     |
| Claude Code       | Tool System（14 步 pipeline）              | 零                     |

無論是哪個框架，共識都是明確的：LLM 不知道也不應該知道資料儲存在哪裡、如何儲存。這些都是實現細節，由中介層負責隱藏。

## 如何正確繪製架構圖

許多架構圖的問題出在粒度不夠細。讓我們對比一下：

**❌ 錯誤的做法**

```
LLM_Design_Group <--> DB
```

這個 group-level 的箭頭模糊了實際的責任邊界。

**✅ 正確的做法**

用具體的元件級箭頭替代：

- `Conversation History <--> DB`（對話記錄的讀寫）
- `Memory <--> DB`（記憶系統的讀寫）
- `DB --> Instructions`（從 DB 讀取指令，單向流）

關鍵細節是箭頭方向應該遵循資料流的慣例，而不是依賴方向。LLM 可能依賴一個 Session 物件，但 Session 物件才是與資料庫直接互動的那一層。

## 何時應該檢視這個模式

當你正在進行以下工作時，記得檢查架構圖中 LLM 與資料庫的邊界定義：

- 設計新的 LLM 應用系統架構
- Review 他人提出的架構圖時
- 看到有人直接在 LLM 與 DB 之間畫箭頭時
- 討論 LLM 應用的資料存取層設計

這個簡單的觀念——將 LLM 與儲存邊界明確分開——可以讓你的架構設計更清晰，也更容易與團隊溝通。
