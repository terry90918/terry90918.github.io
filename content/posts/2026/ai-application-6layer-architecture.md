---
title: 'AI 應用程式六層架構設計'
publishedAt: '2026-04-02T11:52:00+08:00'
status: 'published'
slug: 'ai-application-6layer-architecture'
tags:
  - business-logic-algorithms
  - ai
  - architecture
  - llm
---

在設計 AI 應用時，我們經常面臨一個棘手的問題：業務邏輯與核心系統之間的邊界在哪裡？無論是法律 AI、醫療 AI，還是電商 AI，大多數開發者會將 domain 知識散布在各個層次裡，導致當業務需求變化時，整個核心系統都需要跟著改動。這不僅增加了維護成本，也讓品質評估、檢索改善和編排策略調整的影響面變得難以控制。

一個更好的方法是建立一個 **domain-agnostic 的六層架構**，將業務邏輯清晰地隔離到特定層次，讓核心系統保持通用性和穩定性。

## 六層架構概覽

整個 AI 應用可以分解為六個清晰的層次，每層各司其職：

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Intent Router                         │
│  ▸ 意圖分類（使用 Haiku 等輕量模型）              │
│  ▸ 決定進入哪個 Skill 或 Agent                   │
├─────────────────────────────────────────────────┤
│  Layer 2: Skill / Context Composition           │  ← Domain 知識只在此層注入
│  ▸ 組裝 system prompt（SKILL.md + tools）        │
│  ▸ 注入 domain 指令和記憶體                      │
├─────────────────────────────────────────────────┤
│  Layer 3: Orchestrator Loop（LLM ↔ tool_use）   │
│  ▸ LLM 推理 → 呼叫 tool → 結果回傳 → 繼續推理   │
│  ▸ 最多 N 輪，stop_reason 為 end_turn 時終止    │
├─────────────────────────────────────────────────┤
│  Layer 4: Tool Execution / MCP                  │
│  ▸ 每個 tool 代表一個 capability 介面            │
│  ▸ 不知道 LLM 的存在，只做參數驗證和執行         │
├─────────────────────────────────────────────────┤
│  Layer 5: Retrieval / Memory / Knowledge        │
│  ▸ 混合檢索（Vector + BM25）                    │
│  ▸ CRAG 品質閘、Reranking、SAC                  │
├─────────────────────────────────────────────────┤
│  Layer 6: Evaluation / Guardrails               │
│  ▸ Groundedness、Recall@K、MRR 評估              │
│  ▸ Safety 檢查、Logging、Feedback loop           │
└─────────────────────────────────────────────────┘
```

### Layer 1：意圖路由

最頂層負責對用戶的輸入進行意圖分類。使用輕量級模型（如 Haiku）快速判斷請求屬於哪個 Skill 或代理，這個層次保持 domain-agnostic，只關心路由邏輯本身。

### Layer 2：Skill 與上下文組裝

這是**唯一允許 domain 知識進入的層次**。在這一層，我們組裝 system prompt（結合 SKILL.md 和相關 tools），注入 domain-specific 的指令、記憶體和上下文。當業務需求變化時，主要修改的也是這一層。

```
Skill = Instructions + Metadata + Resources（scripts、templates、Knowledge Base）
```

核心層（Layer 1 和 3-6）完全不知道 domain 的存在，這樣就實現了真正的分離。

### Layer 3：編排循環

這一層負責 LLM 與 tool 調用的循環。LLM 推理、呼叫 tool、接收結果、再次推理...每個循環可以設定最大輪數限制，當 LLM 返回 stop_reason 為 `end_turn` 時，循環終止。編排邏輯本身與 domain 無關，它只是一個通用的狀態機。

### Layer 4：Tool 執行與 MCP

每個 tool 都是一個獨立的 capability 介面。這一層的 tool 完全不知道上層是否有 LLM 存在，它們只做參數驗證和執行。通過 MCP（Model Context Protocol）標準化這些介面，我們實現了高度的解耦。

### Layer 5：檢索、記憶與知識

這一層處理所有的知識獲取。除了向量搜尋，我們還需要 BM25 這類傳統全文檢索，透過混合檢索提高召回率。CRAG（Corrective Retrieval-Augmented Generation）提供品質閘，Reranking 改進排序，SAC（Self-Adaptive Correction）根據反饋動態調整。

### Layer 6：評估與安全守衛

最後一層負責評估和把守質量。我們在這裡測量 Groundedness（事實性）、Recall@K、MRR（Mean Reciprocal Rank）等指標，執行安全檢查，記錄詳細日誌，並收集用戶反饋來改進系統。

## 實踐案例：JurisLM

讓我用一個真實的例子說明這六層在生產環境中的樣子：

| Layer | 實作模組               | 職責                                        |
| ----- | ---------------------- | ------------------------------------------- |
| 1     | `intent-router.ts`     | 用 Haiku 分類用戶的法律查詢 Skill           |
| 2     | `prompt-composer.ts`   | 組裝法律 SKILL.md + MCP tools，注入案例文本 |
| 3     | `orchestrator-loop.ts` | 管理最多 15 輪的 LLM-tool 循環              |
| 4     | `entire_mcp`           | 13 個 tool（合約搜尋、判例查詢等）          |
| 5     | `search-pipeline.ts`   | BM25 + Vector 混合檢索，帶 CRAG 品質檢查    |
| 6     | `evaluate.impl.ts`     | 計算 Recall、MRR、NDCG 指標                 |

當律師需要使用系統查詢某個法律問題時，請求會經過這六層，每層各司其職，domain 知識完全侷限在 Layer 2。

## 常見的斷線問題

在實際開發中，最容易犯的錯誤是讓 Layer 5 的實作出現分裂：

```
❌ 斷線情況
Layer 3 → Layer 4（MCP）→ API Route → search-service（舊版本）→ DB（純向量搜尋）

✅ 正確做法
Layer 3 → Layer 4（MCP）→ API Route → search-pipeline.ts → DB
```

舊版本的 `search-service` 可能只做了純向量檢索，而新的 `search-pipeline` 引入了混合搜尋和 CRAG。如果兩個版本並行存在，系統會用錯的那個，導致品質下降且難以排查。

解決方式是統一 Layer 5 的入口，在 pipeline 中加入 `searchTarget` 選項，將 service layer 改為透過 pipeline 呼叫，確保所有請求都走同一條檢索路徑。

## 何時應用這個架構

這個六層模型特別適用於以下場景：

- **新 AI 應用的初期設計**：無論是法律、醫療還是電商領域，用這個框架可以從一開始就清晰地分離 domain 邏輯
- **系統設計評審時發現 domain 邏輯混亂**：當你感覺「業務知識滲入了核心」時，可以對照這六層來重新檢視架構
- **品質問題的根本原因分析**：當系統出現問題時，按層次分析可以快速定位是哪一層的責任
- **擴展新的 Skill 或 Domain**：確認新功能只需要修改 Layer 2，其他層保持不變

通過這樣的分層設計，你的 AI 應用將更易於維護、擴展和迭代，核心系統的穩定性也能得到保證。
