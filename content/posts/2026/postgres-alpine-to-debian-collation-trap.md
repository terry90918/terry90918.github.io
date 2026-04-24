---
title: 'PostgreSQL Alpine 升級 Debian 的 Collation 陷阱'
publishedAt: '2026-03-31T17:01:00+08:00'
status: 'draft'
slug: 'postgres-alpine-to-debian-collation-trap'
tags:
  - data-migration
  - postgresql
  - docker
  - migration
  - collation
---

前陣子在升級 PostgreSQL Docker 鏡像時，遇到一個相當詭異的問題：某些資料明明存在資料庫裡，但查詢時卻查不到。直到深入追查後才發現，罪魁禍首是 **Collation 不匹配**——一個在跨作業系統升級時極容易忽略的陷阱。

## 問題背景

PostgreSQL 官方鏡像（如 `postgres:16-alpine`）和第三方鏡像（如 `pgvector/pgvector:pg16`）最大的區別不是版本號，而是**基礎作業系統**。Alpine Linux 使用 musl libc，而 Debian/Ubuntu 使用 glibc——這兩個 libc 實作對字符排序（Collation）的邏輯完全不同。

關鍵在於 PostgreSQL 的 btree 索引**硬編碼**了建立時的排序規則。當你從 Alpine 換到 Debian 時，存量索引仍然按照 musl 的 `en_US.utf8` 規則排列，但查詢時卻用 glibc 的規則進行二分搜尋。結果就是：

- **索引掃描（Index Scan）走不到資料**——二分搜尋用新規則搜，找不到舊規則排列的位置
- **順序掃描（Seq Scan）能找到資料**——逐行比對時用新規則，反而能匹配

## 症狀現象

如果你的應用出現以下情況，很可能就是中招了：

```sql
-- 同一條查詢，根據執行方式結果不同
SELECT COUNT(*) FROM my_table WHERE text_col = '中文值';
-- Index Scan 結果：0 行（錯誤）

-- 禁用索引後再試
SET enable_indexscan = off; SET enable_bitmapscan = off;
SELECT COUNT(*) FROM my_table WHERE text_col = '中文值';
-- Seq Scan 結果：1 行（正確）
```

更糟的是，這會導致外鍵約束（FK）驗證失敗：

```
ERROR: insert or update on table "orders" violates foreign key constraint
```

但你檢查資料庫後，被參考的紀錄確實存在。同時，`LIKE` 查詢卻能正常找到資料（因為 `LIKE` 不依賴 btree 的排序順序）。

## 診斷方法

遇到疑似 Collation 問題時，診斷很簡單——比較索引掃描和順序掃描的結果：

```sql
-- 1. 用索引查詢
EXPLAIN ANALYZE
SELECT * FROM my_table WHERE text_col = '某個值';

-- 2. 禁用索引後再查
SET enable_indexscan = off;
SET enable_bitmapscan = off;
EXPLAIN ANALYZE
SELECT * FROM my_table WHERE text_col = '某個值';
```

如果第一次回 0 筆，第二次回多於 0 筆，八成就是 Collation 陷阱。

## 解決方案

一旦確認問題，修正也很直接——**重建受影響表的索引**：

```sql
-- 重建特定表的所有索引
REINDEX TABLE my_table;

-- 或一次性重建整個資料庫的索引
REINDEX DATABASE my_database;
```

`REINDEX` 會用當前 libc 的排序規則重新構建索引結構，之後查詢就能正常工作了。

## 預防勝於修復

與其事後補救，不如在升級時就預先出擊：

**切換 PostgreSQL Docker 鏡像的基礎作業系統後，立即對所有包含 text/varchar 的 btree 索引表執行 REINDEX，不要等到出問題。** 這是最保險的做法。

建議在升級指令碼中加入：

```bash
# Dockerfile 或升級腳本中
RUN PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -d $DB_NAME -c "REINDEX DATABASE $DB_NAME;"
```

## 何時會遇到

這個陷阱在以下情況最容易踩中：

- **更換 PostgreSQL Docker 鏡像**：從官方 `postgres:16-alpine` 改到 `pgvector/pgvector:pg16`（基礎 OS 不同）
- **跨 libc 版本的 `pg_upgrade`**：升級時物理遷移資料但未重建索引
- **調查外鍵違反**：資料確實存在但被拒，卻找不到原因
- **調試詭異的查詢結果**：同個值用索引找不到，用全表掃描卻找得到

如果你最近做過 PostgreSQL 版本升級或鏡像切換，不妨檢查一下——一條 `REINDEX DATABASE` 可能會救你的夜班。
