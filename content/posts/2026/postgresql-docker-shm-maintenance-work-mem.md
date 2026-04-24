---
title: 'PostgreSQL Docker shm 與 maintenance_work_mem 設定'
publishedAt: '2026-04-16T11:50:00+08:00'
status: 'published'
slug: 'postgresql-docker-shm-maintenance-work-mem'
tags:
  - data-migration
  - postgresql
  - docker
  - performance
  - configuration
---

在 Docker 容器中運行 PostgreSQL 時，如果你曾經試圖設定一個較大的 `maintenance_work_mem` 來加速索引建構，可能會遇到一個令人困擾的錯誤訊息：

```
could not resize shared memory segment "/PostgreSQL.XXXXXXXX" to 4291857568 bytes: No space left on device
```

這個錯誤看似莫名其妙——明明容器有充足的磁碟空間，卻說沒有空間。其實真正的禍首隱藏在 Docker 的預設配置裡。

## Docker 容器的 /dev/shm 限制

Docker 容器預設只會分配 64MB 的 `/dev/shm`（共享記憶體卷）。而 PostgreSQL 在啟動時預設使用 `dynamic_shared_memory_type = posix`，這表示它會把所有 shared memory segment 儲存在 `/dev/shm` 上。

當你設定 `maintenance_work_mem = 4GB` 時，PostgreSQL 試圖在 `/dev/shm` 上分配 4GB 的空間，但容器只有 64MB 可用，所以就會出現「沒有空間」的錯誤。

還有一個容易踩到的坑：如果你曾試圖透過 `nsenter` 重新掛載 `/dev/shm` 為更大的容量，你會發現 PostgreSQL 現有的 shared memory segment 會在重掛後消失。這導致所有連線都會出現 `could not open shared memory segment: No such file or directory` 的錯誤。而且容器重啟後，nsenter 的掛載也會被還原，所以這根本不是長期解決方案。

## 改用 mmap：繞過容器限制

最直接的解決方案是改變 PostgreSQL 的 shared memory 後端，從 `posix` 改為 `mmap`。這樣一來，PostgreSQL 就會把 shared memory segment 存放在 `/tmp`（本地磁碟）而不是 `/dev/shm`，完全繞過容器的 shm 限制。

執行以下命令：

```bash
# ALTER SYSTEM 不能在 transaction block 中執行，必須用多個 -c 分開
docker exec <container_id> psql -U postgres <dbname> \
  -c "ALTER SYSTEM SET dynamic_shared_memory_type = 'mmap';" \
  -c "ALTER SYSTEM SET maintenance_work_mem = '4GB';"

# dynamic_shared_memory_type 是 postmaster-level 設定，必須重啟才生效
docker restart <container_id>

# 重啟後確認設定
docker exec <container_id> psql -U postgres <dbname> \
  -c "SELECT name, setting FROM pg_settings WHERE name IN ('dynamic_shared_memory_type','maintenance_work_mem');"
```

重啟後，你應該會看到：

```
 dynamic_shared_memory_type | mmap
 maintenance_work_mem       | 4194304   ← 4GB in KB
```

## psql -c 的隱藏陷阱

在上面的解決方案中，我特別強調每個命令都用獨立的 `-c` 參數。這不是多此一舉。當你在一個 `-c` 中包含多個命令時（用分號分隔），psql 會把它們全部包在一個隱式的 transaction block 中執行。這對某些命令來說是致命的：

```
ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block
ERROR: ALTER SYSTEM cannot run inside a transaction block
```

所以，正確的做法是這樣：

```bash
# ❌ 錯誤：多命令在同一 -c 中
psql -c "SET maintenance_work_mem='4GB'; CREATE INDEX CONCURRENTLY ..."

# ✅ 正確：分開 -c，每個命令獨立執行
psql \
  -c "SET maintenance_work_mem='4GB';" \
  -c "CREATE INDEX CONCURRENTLY ..."

# ✅ 或用 PGOPTIONS 在連線時設定（完全不需要 SET 命令）
PGOPTIONS='-c maintenance_work_mem=4GB' psql ... \
  -c "CREATE INDEX CONCURRENTLY ..."
```

使用 `PGOPTIONS` 的好處是，它在連線層就設定了這些參數，完全避免了 transaction block 的問題。

## 何時需要這個設定

這個配置主要適用於以下情況：

- PostgreSQL 運行在 Docker 容器內（而非裸機或虛擬機）
- 你需要 `maintenance_work_mem` 大於 256MB，特別是在進行 HNSW 索引建構、大型 REINDEX 或 VACUUM 時
- 出現了「No space left on device」或其他與 `/dev/shm` 相關的 shared memory 錯誤
- 確認了問題確實來自 posix DSM（執行 `SHOW dynamic_shared_memory_type;` 看看是否回傳 `posix`）

一旦做出這個改動，你就可以充分利用 Docker 容器中 PostgreSQL 的計算能力，而不受容器 shm 限制的束縛。
