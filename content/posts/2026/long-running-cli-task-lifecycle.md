---
title: '長時間 CLI 任務的生命週期管理'
publishedAt: '2026-04-05T14:45:00+08:00'
status: 'published'
slug: 'long-running-cli-task-lifecycle'
tags:
  - tooling-workflow
  - cli
  - background-tasks
  - lifecycle
---

在處理嵌入、分塊或同步等耗時的 CLI 背景任務時，我們常常面臨啟動、監控、診斷和恢復的一系列挑戰。這篇文章整理了多次實戰經驗中的最佳實踐，希望能幫助你更有信心地管理那些需要跑上好幾個小時甚至好幾天的背景任務。

## 正確啟動任務

啟動長時間 CLI 任務的方式看似簡單，但細節決定成敗。使用 `nohup` 搭配重定向是經過驗證的標準做法：

```bash
nohup cmd > /tmp/task-name.log 2>&1 &
echo "PID: $!"
```

這樣做能確保進程在終端關閉後仍繼續執行，並將所有輸出寫入日誌檔案。記錄下輸出的 PID，以便稍後查詢進程狀態。

一個容易被忽視的陷阱是使用管道操作。千萬不要這樣做：

```bash
# ❌ 錯誤做法
cmd | head -5 &
cmd | tail -10 &
cmd | grep "error" &
```

當使用管道時，如果管道另一端的進程提前結束，會發送 `SIGPIPE` 信號導致整個任務被殺死。始終讓任務獨立執行，稍後再檢查日誌檔案。

## 啟動後的三項驗證

任務啟動後的前 5 分鐘至關重要。在這個窗口內進行三項檢查，能快速發現大多數初始化錯誤：

**1. 進程是否活著？**

```bash
ps aux | grep "task-name" | grep -v grep
```

確認進程確實在運行，而不是立即崩潰退出。

**2. 資料庫有無變化？**

```bash
psql -c "SELECT COUNT(*) FROM target_table;"
```

檢查目標表的行數是否在增長。如果一直停留在原數字，說明任務要麼根本沒執行，要麼執行過程中失敗了。

**3. 日誌有無正常記錄？**

```bash
tail -5 data/logs/latest_task.jsonl
```

檢查最近的日誌行是否顯示正常的進度記錄，而不是堆棧追蹤或空白。

三項檢查都通過後，你可以放心地讓任務在背景運行。如果有任何一項失敗，立即進行診斷。

## 失敗診斷：先查日誌

當任務失敗或行為異常時，第一個反應就是檢查日誌。不要猜測，日誌裡有所有答案。

對於結構化日誌（JSON Lines 格式），使用 `grep` 直接查詢：

```bash
# 找出所有 ERROR 級別的日誌
grep '"level":"ERROR"' data/logs/*.jsonl | tail -5

# 只看特定任務的日誌
grep '"logger":"task-name"' data/logs/*.jsonl | tail -5
```

這樣你能快速定位問題所在。常見的問題包括：API 配額超限、資料庫連線失敗、外部服務超時等。

## 監控遠端狀態

如果你的任務涉及與外部 API（如 OpenAI Batch）的互動，在重啟之前必須檢查遠端的執行狀態。這能避免重複提交批次或發生其他意外情況。

以 OpenAI Batch 為例：

```bash
curl -s "https://api.openai.com/v1/batches?limit=10" \
  -H "Authorization: Bearer $KEY"
```

查看是否有進行中的批次。如果你發現有未完成的批次，應該等待其完成或明確取消，而不是盲目重啟任務。

## 中斷恢復的自動機制

設計良好的任務管理系統應該支持從中斷點恢復。我們的 CLI 工具實現了基於遊標（cursor-based）的自動恢復機制。

分塊任務會自動從上次停止的位置繼續：

```bash
jurislm chunk judicial --category 051
```

嵌入任務則自動讀取狀態檔案（state file）以恢復進度，無需額外的 `--resume` 標籤：

```bash
jurislm embed judicial --category 051
```

這種設計的優勢在於操作簡單——無論是首次運行還是恢復運行，命令都相同。

## 處理超大資料集的 COUNT(\*) 超時

當你的 pgvector 表超過 5 百萬行時，執行 `COUNT(*)` 可能導致 25-28 秒的超時。此時，有一個更聰明的替代方案：使用狀態檔案估算。

### 步驟 1：讀取已完成批次

```bash
cat data/batch-state/judicial-051-text-embedding-3-small.json | jq '.stats.totalProcessed'
```

查看狀態檔案中記錄的已完成嵌入數。

### 步驟 2：估算新增數量

假設上次確認已完成 5,605,248 個嵌入，這次新增執行了 5 個批次，每批 15,000 個記錄：

```
5,605,248 + (5 × 15,000) = 5,680,248
```

### 步驟 3：長期方案

對於長期監控，改用 PostgreSQL 系統表的統計資訊，避免昂貴的 `COUNT(*)` 操作：

```bash
psql -c "SELECT reltuples::bigint FROM pg_class WHERE relname = 'document_embeddings_051';"
```

`pg_class.reltuples` 提供了表行數的統計估計，通常精度足以用於監控，而且完全避免了掃描成本。

## SQL 效能調整

當你對查詢進行優化時，始終使用 `EXPLAIN ANALYZE` 來驗證執行計畫是否改善：

修改前：

```bash
EXPLAIN ANALYZE SELECT ... ;
```

修改後再執行一次，對比執行計畫和耗時。

一個容易踩到的坑是部分索引（partial index）與綁定參數的相互作用。當你使用綁定參數時，查詢規劃器無法確定參數值是否滿足索引的 WHERE 條件，進而無法使用該索引。此時，改用 SQL 字面量（literal）通常能解決問題——儘管需要更小心地防止 SQL 注入。

## 總結

管理長時間 CLI 任務的核心原則是：**啟動時謹慎，監控時主動，診斷時依賴日誌，恢復時信任機制**。通過這份清單，你能更自信地應對背景任務的全生命週期。
