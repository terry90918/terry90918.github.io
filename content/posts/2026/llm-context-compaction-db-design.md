---
title: 'LLM Context Compaction 的資料庫設計'
publishedAt: '2026-04-01T13:42:00+08:00'
status: 'published'
slug: 'llm-context-compaction-db-design'
tags:
  - data-migration
  - llm
  - postgresql
  - schema
  - context
---

## 長對話壓縮的核心挑戰

建置 LLM chatbot 或 agent 系統時，開發者經常面臨一個棘手的問題：LLM 的 context window 有上限（Claude 是 200k tokens）。當對話內容超過這個上限時，必須把舊訊息壓縮成摘要，只保留近期的原文。

但問題隨之而來：**第三次壓縮時該怎麼辦？要同時保存第一次摘要和第二次摘要嗎？**答案是**不需要**。聰明的做法是讓每次壓縮都吸收前一次的摘要，這樣資料庫裡永遠只有一條最新的摘要。

## 核心設計：compaction_events 表 + Append-only messages

這個問題有個優雅的解決方案，核心思想是分離關注點：

- **messages 表**：存放所有訊息，只 INSERT 永不刪除（Append-only 的設計）
- **compaction_events 表**：記錄每一次壓縮事件，每次壓縮 INSERT 一筆新紀錄

```sql
-- 訊息主表：只 INSERT，永不刪除
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID NOT NULL,
    seq         INT NOT NULL,      -- 嚴格遞增序號
    role        TEXT NOT NULL,     -- user / assistant / tool / system
    content     JSONB NOT NULL,
    token_count INT,
    created_at  TIMESTAMP DEFAULT now()
);
CREATE UNIQUE INDEX ON messages(session_id, seq);

-- 壓縮事件：每次壓縮 INSERT 一筆
CREATE TABLE compaction_events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id        UUID NOT NULL,
    covers_up_to_seq  INT NOT NULL,   -- 此摘要涵蓋到第幾條訊息
    summary_text      TEXT NOT NULL,  -- LLM 生成的摘要（吸收了前次摘要）
    tokens_before     INT,
    tokens_after      INT,
    compacted_at      TIMESTAMP DEFAULT now()
);
```

這個設計的妙處在於：每次壓縮時，新的 `summary_text` 會包含前一次摘要的精華，然後直接存為新的摘要。你不需要保留歷史摘要，因為最新的摘要已經包含了所有必要的訊息。

## 查詢流程：永遠讀最新摘要加近期原文

每輪對話前，你需要執行兩個查詢來組裝 API context：

```sql
-- 1. 取最新一次壓縮
SELECT covers_up_to_seq, summary_text
FROM compaction_events
WHERE session_id = $1
ORDER BY compacted_at DESC
LIMIT 1;
-- 若無記錄 → 無壓縮，直接取全部訊息

-- 2. 取壓縮之後的近期原文
SELECT role, content
FROM messages
WHERE session_id = $1
  AND seq > $covers_up_to_seq
ORDER BY seq;

-- 送給 LLM API：[System("摘要")] + [近期原文]
```

簡單來說，查詢邏輯就是：**找到最新的壓縮事件，取它的摘要文本，然後把該摘要之後的所有訊息拼接上去**。

## 多輪壓縮的實際資料流

讓我們用一個具體例子來看多輪壓縮是如何運作的：

```
壓縮 1：INSERT compaction_events(covers_up_to_seq=100, summary="摘要A")
壓縮 2：INSERT compaction_events(covers_up_to_seq=200, summary="摘要B，含摘要A精華")
壓縮 3：INSERT compaction_events(covers_up_to_seq=300, summary="摘要C，含摘要B精華")

messages 表：訊息 1~300 全部保留，永不刪除
查詢邏輯：永遠取最新一筆 compaction_events → 只讀該摘要之後的 messages
```

每當觸發第二次壓縮時，LLM 會收到：

- 最新的 `compaction_events.summary_text`（前一次的摘要）
- `messages` 表中 `seq > covers_up_to_seq` 的所有原文訊息

LLM 就能基於前一次摘要的上下文，生成包含所有精華的新摘要，然後你直接 INSERT 一筆新的 `compaction_events` 記錄即可。舊摘要會被自動「淘汰」，因為查詢永遠只會取最新的那一筆。

## 簡化版本：不需歷史回溯

如果你的使用場景不需要保留壓縮歷史（比如純粹是為了節省 token），有個更簡潔的方案：

```sql
CREATE TABLE sessions (
    id          UUID PRIMARY KEY,
    messages    JSONB NOT NULL,   -- 壓縮後當前狀態，直接 UPDATE
    token_count INT,
    updated_at  TIMESTAMP
);
-- 壓縮時：UPDATE sessions SET messages = $compacted WHERE id = $id
```

這種做法直接覆寫 `messages` 欄位，犧牲了歷史可追溯性，但換來的是更簡單的實現。選擇哪種方案取決於你是否需要後續 debug 壓縮過程。

## 什麼時候該用這個模式

這個設計最適合以下場景：

- 你正在建置需要處理超過 context window 限制的長對話系統
- 需要設計 session 持久化的資料庫 schema，並預期會有多次壓縮
- 遇到「為什麼 LLM 忘記了某件早期的事情」這類 debug 問題時（`compaction_events` 可以回溯每一次壓縮的邊界）
- 想要量化壓縮的效果（比較 `tokens_before` 和 `tokens_after`）

## 業界經驗與觸發點

根據實際使用經驗，壓縮的觸發時機很重要。Claude Code 的實作中，摘要會吸收前次摘要的 rolling 模式。而業界建議通常在 **85~90%** context 滿載時觸發壓縮，因為等到 95% 才壓縮經常會在任務中途被迫中斷。

## 進階：三層架構的長期記憶

如果你需要支援跨 session 的長期記憶，可以在上述設計基礎上疊加：

- **Tier 2 Episodic**：把壓縮摘要存為 `pgvector` 向量，供語義搜尋查詢相關的舊對話
- **Tier 3 Semantic**：從對話內容萃取實體和關係，存入圖資料庫（如 Neo4j）用於知識管理
- **Tier 4 Archival**：`messages` 表本身就是完整的 Source of Truth，可用於長期存檔和審計

這樣設計讓你既能應對短期的 context 限制，也能為未來的記憶增強功能預留擴展空間。
