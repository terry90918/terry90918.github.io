---
title: 'PostgreSQL 查詢取消後的清理反模式'
publishedAt: '2026-04-19T18:45:00+08:00'
status: 'published'
slug: 'postgresql-cancellation-cleanup-anti-pattern'
tags:
  - data-migration
  - postgresql
  - error-handling
  - transactions
---

長時間運行的資料庫操作——比如建立 HNSW 索引、大型批次更新或 VACUUM——有時會因為各種原因被迫中斷。當這些操作被取消後，你會發現磁碟空間似乎沒有被釋放，留下了一些「孤兒」檔案。

很多人第一時間的反應是直接進入 PostgreSQL 的資料目錄，用 `rm -rf` 把這些檔案刪掉。這看起來很理性——既然操作已經取消了，這些檔案也沒用了，為什麼不直接清掉呢？

**但這樣做會害死你的整個 PostgreSQL cluster。**

## 為什麼手動刪除檔案會導致災難

PostgreSQL 的 checkpointer 進程會定期對 dirty buffer 對應的檔案執行 fsync 操作，以確保資料持久化到磁碟。即使一個操作已經被取消了，PostgreSQL 內部的 `RelFileNode` 表仍然記錄著這些檔案的存在。

當你手動用 `rm` 刪掉這些檔案後，inode 消失了。下一次 checkpointer 嘗試 fsync 時，系統呼叫會直接失敗並返回 `ENOENT` 錯誤（找不到檔案）。PostgreSQL 無法保證資料的持久性，所以它採取的唯一安全措施就是：**PANIC 並關閉 cluster**。

你會看到這樣的錯誤訊息：

```
PANIC: could not fsync file "pg_tblspc/<oid>/PG_16_*/<dbid>/<relfilenode>":
  No such file or directory
```

隨之而來的連鎖反應不堪想像：

- 整個 cluster 被迫重啟
- 所有正在進行中的事務——包括其他 session 正在執行的 UPDATE——全部 ROLLBACK
- WAL 重放完成後才能接受新的連線

這不只是一個效能問題，而是一個**資料完整性災難**。

## PostgreSQL 會自動幫你清理

好消息是：你不需要手動做任何事。PostgreSQL 已經設計好了自動清理機制。

取消長操作後，不同類型的清理會自動進行：

| 取消的操作         | PostgreSQL 的自動清理                                       |
| ------------------ | ----------------------------------------------------------- |
| 取消 CREATE INDEX  | 索引被標記為 INVALID，你可以用 `DROP INDEX <name>` 手動移除 |
| ROLLBACK 的 UPDATE | 死 tuple 會由下一次 VACUUM（或 autovacuum）自動回收         |
| 取消 VACUUM        | 部分清理已生效，剩餘部分由下一次 VACUUM 繼續進行            |

## 正確的磁碟空間回收方式

如果你確實需要回收磁碟空間，應該透過 SQL 操作，而不是檔案系統操作：

**`VACUUM (VERBOSE, ANALYZE) <table>`**  
標記表中的空間為可重用。這不會立即縮小堆的物理大小，但下次插入新資料時會重用這些空間。

**`VACUUM FULL <table>`**  
立即縮小表的大小。缺點是會對整個表加寫鎖，在繁忙的資料庫上可能不可行。

**`pg_repack <table>`**（推薦）  
第三方工具，可以邊重組表邊處理查詢，避免了 VACUUM FULL 的長時間鎖定問題。

## 記住這個規則

下一次你想對以下路徑的檔案動手時：

- `<PGDATA>/base/<dbid>/`
- `<PGDATA>/pg_tblspc/`
- 任何 tablespace 對應的目錄

**停下來。** 改用 SQL 操作。PostgreSQL 已經為你想好了如何安全地清理這些檔案。直接用系統工具去刪除它們，只會換來一個宕機的 cluster 和一堆後悔。
