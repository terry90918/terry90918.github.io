---
title: '檔案狀態重構為 DB 的設計模式'
publishedAt: '2026-03-21T15:20:00+08:00'
status: 'draft'
slug: 'state-management-refactor-pattern'
tags:
  - testing-quality
  - refactoring
  - database
  - architecture
---

系統架構演進的過程中，狀態管理常常會成為一個痛點。當你的應用程式從檔案系統的狀態追蹤逐步遷移到資料庫時，如何優雅地重構程式碼結構，往往決定了日後維護的難度。今天我想分享一個實踐過的設計模式。

## 從混亂到秩序

想像一下，你有一個負責管理狀態的類別——比如說 StatusManager。它有 746 行程式碼，裡面糅合了：

- 檔案 I/O 操作
- Pipeline 邏輯的核心演算法
- 狀態彙總和推斷
- 各種業務規則

乍看之下，這些功能都「屬於」狀態管理，所以放在一起好像很合理。但隨著系統演進，問題就浮現了：

- **新增一個 pipeline**？需要在 StatusManager 內寫出新的邏輯分支
- **改變儲存方式**（比如從檔案改成資料庫）？需要修改每一個 pipeline 邏輯相關的程式碼
- **并行執行多個實例**？檔案鎖定無法保證原子性，程式碼變得脆弱

這就是典型的「god class」問題——職責越來越多，邊界越來越模糊。

## 分離的藝術

解決方案其實不複雜，但需要清晰的設計思維：**儲存層應該是通用的，業務邏輯應該各自獨立**。

重構後的結構看起來像這樣：

```
改前：StatusManager（746 行）
      = 檔案 I/O + 所有 pipeline 邏輯 + 彙總 + 推斷

改後：StatusManager（~200 行）
      = 純 CRUD 操作（seedTasks / updateStatus / getTasks / getProgress）

      PipelineA 類別
      = 邏輯 A（phase 順序、skip 條件、依賴關係）

      PipelineB 類別
      = 邏輯 B（phase 順序、skip 條件、依賴關係）
```

這樣做的好處是什麼？假設你新增一個 Pipeline C，你不需要改動 StatusManager，只需要寫一個新的 PipelineC 類別，呼叫相同的 CRUD 介面。當儲存方式從檔案改成資料庫時，只需要改一個地方——StatusManager 的內部實現。

## 決策框架

在進行這樣的重構時，有幾個重要原則值得遵守：

**1. 不要合併成 god class**  
多個 pipeline 的邏輯混在一起會導致複雜度指數級增長。每個 pipeline 都有自己的 phase 順序、skip 條件、依賴關係——這些細節應該局限在各自的類別內。

**2. 不做過度的抽象繼承**  
你可能會想建立一個 `BasePipeline` 或 `PipelineInterface`。但如果各 pipeline 的差異不在「介面」而在「使用方式」（phase 名稱不同、邏輯差異大），抽象反而增加認知負擔。不如就讓它們各自獨立。

**3. 儲存層只做 CRUD**  
StatusManager 應該只負責五件事：新建任務、更新狀態、查詢任務、查詢進度、刪除記錄。不要在這裡塞入任何業務邏輯推斷。

**4. Pipeline 邏輯留在 pipeline class**  
每個 pipeline 自己知道：本管線有哪些 phase、哪些狀況下可以跳過某個 phase、上游 phase 的結果如何影響下游。

**5. 通用表設計**  
資料庫表應該通用，用 `pipeline` 欄位區分類型，用 `resource_id` 代替具體的欄位名稱（不叫 `fileset_id` 或 `document_id`），這樣一張表可以支撐多種 pipeline。

## 重構 vs 新建

重構時還要考慮一個決策：究竟是改造現有的 StatusManager，還是建立一個全新的類別？

- **重構現有類別**：當職責實質沒變（都是追蹤狀態），且有很多地方呼叫它（13 個以上）——改內部實現，保持介面穩定
- **新建類別**：當職責有本質不同，或者需要新舊並存過渡期——但最終還是要淘汰舊的

在這個案例中，選擇重構 StatusManager 是對的，因為它的職責沒變（追蹤狀態），只是儲存方式從檔案改成資料庫。

## 資料庫表設計

真實的表結構長這樣：

```sql
CREATE TABLE pipeline_tasks (
  id SERIAL PRIMARY KEY,
  pipeline VARCHAR(20) NOT NULL,        -- "extraction" / "validation" / "enrichment"
  resource_id VARCHAR(100) NOT NULL,    -- 通用識別符，不綁定特定 pipeline 名稱
  parent_id VARCHAR(100),               -- 支援階層結構（可選）
  phase VARCHAR(30) NOT NULL,           -- 各 pipeline 自訂的 phase 名稱
  model VARCHAR(50),                    -- nullable（不是所有 phase 都需要 model）
  status VARCHAR(20) NOT NULL,          -- "pending" / "running" / "completed" / "skipped" / "failed"
  checkpoint JSONB DEFAULT '{}',        -- 精細的恢復點（支援斷點續傳）
  metadata JSONB DEFAULT '{}',          -- 各 pipeline 自訂的額外資料
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

`pipeline` 和 `resource_id` 組成唯一識別，使得多個 pipeline 可以共用這張表。`checkpoint` 和 `metadata` 的靈活性允許不同 pipeline 記錄各自需要的資訊。

## 什麼時候適用

這個模式在幾種情況下特別有用：

- 你的系統有檔案系統的狀態追蹤（status.json、checkpoint 檔案等），現在想遷移到資料庫
- 狀態管理類別已經超過 300 行，且混雜了多個業務邏輯
- 系統中有多個 pipeline 或 workflow，它們共用狀態管理但邏輯差異大
- 需要支援多個實例的并行執行——檔案鎖定不夠強大，需要資料庫的原子操作

如果只是簡單的單線程 file-based 狀態管理，這個模式就顯得過度工程化了。但一旦你的系統開始複雜化，投入這點重構的成本，會給日後的迭代帶來巨大的回報。
