---
title: 'PostgreSQL 並行 Worker 的 Server 層級覆寫'
publishedAt: '2026-04-19T14:36:00+08:00'
status: 'draft'
slug: 'postgresql-max-parallel-workers-override'
tags:
  - data-migration
  - postgresql
  - performance
  - parallel
  - configuration
---

在優化 PostgreSQL 的並行處理效能時，我遇到了一個看似矛盾的問題，值得分享給同樣在調校 PostgreSQL 性能的工程師。

## 奇怪的性能瓶頸

前段時間在執行 `CREATE INDEX ... USING hnsw` 於 28M 筆記錄的大表時，我刻意設置了會話層級的參數：

```sql
SET max_parallel_maintenance_workers = 8;
SET maintenance_work_mem = '8GB';
```

理想情況下，應該有 8 個 worker 並行運作，但實際查看 `pg_stat_activity` 卻只看到 7 個活躍的 parallel worker。CPU 使用率卡在 ~777%（在 16 核的 cx53 主機上應該能達到 1500%），明顯沒有充分利用系統資源。

更令人困惑的是，在另一個 psql session 中執行 `SHOW max_parallel_workers` 確實返回 `8`，但實際表現就是不如預期。這背後到底發生了什麼？

## 真相：Server 層級的硬限制

經過調查才發現問題的根源。PostgreSQL 中存在著兩個層級的並行 worker 控制機制：

**`max_parallel_workers`** 是 **server 層級的硬限制**，預設值是 8。這是一個全域設定，無法在會話中透過 `SET` 命令覆寫。即使你在會話層級設置 `max_parallel_maintenance_workers = 100`，系統仍然只會分配 8 個 worker 給你。而且由於 leader process 自己也占用一個 worker 位置，實際可用的 worker 數量是 7。

更複雜的情況還在於 **`max_worker_processes`**，這也是 server 層級的設定，而且**必須透過重啟 PostgreSQL 才能生效**。光是執行 `ALTER SYSTEM SET` 加上 `pg_reload_conf()` 是不夠的——reload 只能應用那些支援線上重載的參數，`max_worker_processes` 不在其中。

## 解決方案

如果你需要充分利用大型伺服器的核心數量進行並行操作，必須在 PostgreSQL 啟動時就配置好這些參數。以下提供三種方法：

### 方法一：Docker 啟動時使用命令列旗標（推薦）

如果你用 Docker 運行 PostgreSQL，最直接的做法是在啟動時傳入參數：

```bash
docker run -d --name shared-db \
  -v /path/to/data:/var/lib/postgresql/data \
  --shm-size=8g --memory=28g \
  pgvector/pgvector:pg16 \
  postgres \
    -c max_parallel_workers=15 \
    -c max_worker_processes=20 \
    -c maintenance_work_mem=12GB \
    -c shared_buffers=4GB \
    -c effective_cache_size=24GB \
    -c statement_timeout=0
```

### 方法二：編輯 `postgresql.conf` 後重啟

如果你的 PostgreSQL 運行在傳統環境中，可以直接編輯設定檔：

```bash
# 在 PGDATA 目錄
echo "max_parallel_workers = 15" >> postgresql.auto.conf
echo "max_worker_processes = 20" >> postgresql.auto.conf
# 必須重啟 PG（reload 不夠！）
pg_ctl restart -D $PGDATA
```

### 方法三：透過 SQL 命令設置後重啟

```sql
ALTER SYSTEM SET max_parallel_workers = 15;
ALTER SYSTEM SET max_worker_processes = 20;
-- 然後重啟 PostgreSQL（pg_reload_conf() 對 max_worker_processes 無效）
```

完成 server 層級的設定後，你才能在具體的操作中設置會話層級的參數：

```sql
SET maintenance_work_mem = '12GB';
SET max_parallel_maintenance_workers = 15;  -- 現在能真的拿到 15 個 worker
SET statement_timeout = 0;
CREATE INDEX ... USING hnsw ... WITH (m=24, ef_construction=200);
```

## 驗證方法

為了確認並行 worker 是否如預期工作，你可以在執行索引建立時開啟另一個 psql session 進行監控：

```sql
SELECT count(*) FROM pg_stat_activity
WHERE backend_type = 'parallel worker' AND state = 'active';
-- 應該看到接近你設定的 max_parallel_maintenance_workers 數量

-- 同時監控 CPU 使用率：
-- docker stats <container>
-- 應該看到 CPU 使用率約為 worker_count × 100%
```

## 何時需要這樣做

以下場景特別適合啟用並行 worker 來提升性能：

- 在大型表上建立平行索引（特別是 HNSW、GIN 等演算法）
- 執行 `VACUUM PARALLEL N` 來加速清理
- 進行涉及大量資料移動的 `ALTER TABLE` 操作
- 執行帶有 `Parallel Seq Scan` 的複雜查詢
- 任何時候想充分利用多核伺服器的計算能力

## 常見陷阱速查表

| 誤解                                                                   | 事實                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 「我在會話中 SET 了 `max_parallel_maintenance_workers = 16` 應該夠了」 | ❌ `max_parallel_workers` 是 server 層級上限，會話層級設定無法突破              |
| 「`ALTER SYSTEM + pg_reload_conf()` 應該生效」                         | ❌ `max_worker_processes` 需要完全重啟（不是 reload）                           |
| 「Leader process 也算一個 worker」                                     | ✅ 正確。所以 16 核伺服器應該設 `max_parallel_workers=15` 留 1 核給 leader      |
| 「`shared_buffers` 越大越好」                                          | ⚠️ 不是。通常分配 RAM 的 25-40% 給 PostgreSQL，其餘留給作業系統檔案快取         |
| 「`maintenance_work_mem` 是每個 worker 分別計算」                      | ⚠️ 取決於操作類型。HNSW 索引建立是 per-worker，但其他操作可能不同，查閱官方文件 |

## 延伸閱讀

- [pgvector 官方文件：HNSW 性能調校](https://github.com/pgvector/pgvector#hnsw)
- [PostgreSQL 官方文件：並行查詢](https://www.postgresql.org/docs/16/parallel-plans.html)
- PostgreSQL 16 預設值參考：`max_parallel_workers=8`、`max_worker_processes=8`、`max_parallel_workers_per_gather=2`、`max_parallel_maintenance_workers=2`

希望這個經驗分享能幫助你順利調校 PostgreSQL 的並行性能。記住，关键在於理解哪些參數在 server 層級、哪些在會話層級，以及它們的變更何時生效。
