---
title: 'PostgreSQL vector 升級 halfvec 的遷移步驟'
publishedAt: '2026-04-19T18:45:00+08:00'
status: 'draft'
slug: 'postgresql-vector-to-halfvec-update'
tags:
  - data-migration
  - postgresql
  - pgvector
  - migration
  - embeddings
---

pgvector 0.7+ 版本引入了 halfvec（float16）型別，相較於傳統的 vector（float32）型別，儲存空間能減少一半。對於 OpenAI 或 Cohere 等服務產生的 normalized embedding，precision 損失在 1% 以下，是非常值得的權衡。然而，當表格包含 2800 萬筆以上的資料時，這場遷移就需要謹慎規劃。

## 為什麼要升級到 halfvec

在向量資料庫領域，儲存成本往往是長期運營的瓶頸。一個 1536 維度的 float32 向量需要 6KB 空間，而 float16 只需要 3KB。對於大規模 embedding 表，這意味著磁碟使用和記憶體壓力都能顯著降低。更重要的是，更小的向量能加快 HNSW index 的建構速度——通常快 25% 到 30%——因為記憶體利用率翻倍。

## 遷移步驟

我們來逐步走過整個遷移過程。假設目標表名為 `<table>`，embedding 欄位維度為 1536。

**第一步：新增 halfvec 欄位**

```sql
ALTER TABLE <table> ADD COLUMN embedding_half halfvec(1536);
```

這個操作是即時的，不會影響現有資料，只是為新欄位添加 metadata。

**第二步：大型 UPDATE 轉換資料**

這是耗時最久的步驟。建議在單一交易內完成，避免部分完成的狀態。配合以下優化設定：

```sql
SET maintenance_work_mem = '20GB';
SET synchronous_commit = off;
SET max_parallel_workers_per_gather = 0;

UPDATE <table>
SET embedding_half = embedding::halfvec(1536)
WHERE embedding_half IS NULL AND embedding IS NOT NULL;
```

- `maintenance_work_mem = '20GB'` — 讓 PostgreSQL 使用更多記憶體進行 UPDATE，加快執行速度
- `synchronous_commit = off` — 不等待 WAL 寫入磁碟，大幅降低 IO 開銷（但代價是如果伺服器崩潰可能丟失最新資料，不過這在遷移過程中可接受）
- `max_parallel_workers_per_gather = 0` — 禁用平行掃描，保持單一執行計畫穩定

**第三步：驗證資料完整性**

```sql
SELECT count(*) AS total, count(embedding_half) AS with_half FROM <table>;
```

`with_half` 的計數**必須**等於 `total`，否則代表遷移不完整。

**第四步：清理並重新分析**

```sql
VACUUM (VERBOSE, ANALYZE) <table>;
```

VACUUM 會回收 UPDATE 過程中留下的 dead tuple，ANALYZE 會更新統計資訊供查詢優化器使用。

**第五步：在 halfvec 欄位建立 HNSW index**

```sql
CREATE INDEX <name> ON <table>
  USING hnsw (embedding_half halfvec_cosine_ops)
  WITH (m = 24, ef_construction = 200);
```

HNSW index 是向量搜尋的關鍵，參數 `m = 24` 和 `ef_construction = 200` 是常見的平衡點。

**第六步：更新應用程式查詢**

原本的查詢：

```sql
WHERE embedding <=> $1::vector
```

改為：

```sql
WHERE embedding_half <=> $1::halfvec
```

**第七步：移除舊欄位（驗證無誤後）**

```sql
DROP COLUMN embedding;
```

這一步會立即釋放 halfvec 前的儲存空間。

## 真實成本預估

根據實測一個 2800 萬筆資料、1536 維度的表格遷移：

| 項目            | 數值                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| UPDATE 執行時間 | 約 90 分鐘（採用 cx53 伺服器，16 核心、32GB 記憶體，`synchronous_commit=off`）             |
| 資料庫磁碟增長  | +84GB（halfvec 欄位透過 TOAST 儲存）                                                       |
| WAL 日誌增長    | +20GB                                                                                      |
| 堆疊增長        | 微乎其微（vector 本身透過 TOAST pointer 儲存，不會直接複製）                               |
| 進度可見性      | 單一交易內，外部 `COUNT(*)` 查詢看不到部分結果，只能透過 `df -h` 觀察磁碟 delta 來估計進度 |
| HNSW 建構提速   | halfvec 比 vector 快 25-30%（因為記憶體容量翻倍）                                          |

值得注意的是，UPDATE 進行中若想監控進度，`COUNT(*)` 不會幫助（因為交易尚未提交），最實用的方法是觀察磁碟空間變化。

## 何時應該進行升級

升級 halfvec 適合以下場景：

- **表格規模 > 1000 萬筆資料**——儲存成本優勢才夠明顯
- **全部或大部分 embedding 已經是 normalized 向量**——來自 OpenAI、Cohere 等服務
- **伺服器記憶體相對向量大小而言相對緊張**——在記憶體內進行的 HNSW 建構會因為向量變小而釋放容量
- **願意接受 ~90 分鐘/2800 萬筆的 UPDATE 停機時間**——換取長期 50% 儲存節省

## 常見陷阱

以下是遷移過程中容易踩到的坑：

**❌ 只看 shell exit code 或 tmux 日誌認定成功**

必須用 SQL 的 `COUNT()` 驗證實際寫入的資料列數，否則無法確認遷移真的完整。

**❌ 不做 pre-flight 磁碟估算**

UPDATE 會臨時增加 84GB 的資料庫大小。如果沒有預先確認磁碟有足夠空間，UPDATE 中途可能因為磁碟滿而中斷失敗。

**❌ UPDATE 完成後不跑 VACUUM 就反向切換**

Dead tuple 仍留在 heap 中，回滾會導致舊資料混入新資料，破壞一致性。

**❌ UPDATE 失敗後手動清理 PostgreSQL 檔案**

PostgreSQL 的 checkpointer process 會因此進入 PANIC 狀態。正確做法是讓 PostgreSQL 自行恢復，或者透過 `pg_basebackup` 重新初始化。

---

halfvec 升級是一項投資報酬率很高的優化，但需要充分的規劃和驗證。謹慎執行上述步驟，就能順利實現儲存節省和性能提升。
