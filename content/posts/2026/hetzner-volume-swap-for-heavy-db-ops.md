---
title: 'Hetzner Volume Swap 加速大型 DB 操作'
publishedAt: '2026-04-19T14:35:00+08:00'
status: 'draft'
slug: 'hetzner-volume-swap-for-heavy-db-ops'
tags:
  - infrastructure-deployment
  - hetzner
  - postgresql
  - performance
  - volume
---

當我們在 Hetzner 上經營一套 PostgreSQL 資料庫，時常會遇到一個棘手的問題：某些資料庫操作（比如在 2,800 萬向量上建立 HNSW 索引、執行 VACUUM FULL，或跑 pg_repack）耗時數小時，而現有的 server 規格根本無法在合理的時間內完成這些工作。

## 傳統方案的困境

我最近就面臨過這個場景。一台 Hetzner ARM server（CAX31，8 核心、16GB 記憶體）需要對一個 425GB 的 PostgreSQL 16 資料庫建立 HNSW 索引。按照保守估計，在現有規格上要花 8 到 16 個小時。直覺上，我們會想著升級 server 規格，但問題接踵而至：

- **跨架構限制**：Hetzner 不支援 ARM 和 x86 之間的 rescale，系統會直接拋出 `invalid_server_type` 錯誤
- **型號缺貨**：全球範圍內高規格的 ARM server（CAX41）缺貨，無法在同架構內升級
- **遷移複雜**：完整搬遷意味著要在 Coolify 上重新構建、遷移其他專案的資料庫，複雜度爆表
- **網路傳輸瓶頸**：透過網路搬運 425GB 資料，以家中的 95 Mbps 上傳速度，需要超過 10 小時；即使用同資料中心的 pg_basebackup（只需 7 分鐘），IO 瓶頸仍然存在

而且資料持續成長，越拖越難搬。

## Volume Swap：0 資料搬運的妙計

Hetzner 的 Volume（磁碟儲存）有一個被許多人忽視的特性——**它可以在不同的 server 之間自由轉移，而且不涉及任何資料複製**。我的解決方案便建立在這個基礎之上：

1. 停掉原 server 上的資料庫
2. 從原 server detach 掉 Volume
3. 建立一台臨時的高規格 x86 server（同地區）
4. 把 Volume attach 到新 server
5. 在新 server 上跑重型操作（HNSW build、VACUUM 等）
6. 完成後把 Volume 換回原 server

**整個過程只涉及 metadata 操作，0 位元組的資料在網路上傳輸**。

## 為什麼這招有效？

這個方案成立的前提有三個：

**首先，Hetzner Volume 本身是架構無關的**。它是底層的區塊儲存，不關心上面連接的是 ARM 還是 x86 server。

**其次，PostgreSQL 的資料檔案在相同的主版本和字節序下是跨架構相容的**。ARM aarch64 和 x86_64 都採用 little-endian 和 64 位元整數，所以同一套資料檔案可以在兩種架構的 PostgreSQL 16 實例上直接讀寫，無需轉換。

**第三，Docker 映像本身支援多架構**。拉取 `pgvector/pgvector:pg16` 時，Docker 會自動根據 host 的架構選擇合適的映像，所以在新的 x86 server 上，你會自動拿到 x86 版本。

唯一的限制是：**Volume 必須與 server 位於同一地區**。跨地區的 detach/attach 操作不被允許。

## 實際操作步驟

以下是完整的操作流程：

```bash
# 0. 確保原 server 上的資料庫已完全停止，避免資料損毀
docker stop <db-container>
umount /mnt/HC_Volume_<id>  # OS 層級 detach

# 1. 用 Hetzner API detach Volume
curl -X POST "https://api.hetzner.cloud/v1/volumes/$VOL_ID/actions/detach" \
  -H "Authorization: Bearer $HETZNER_API_TOKEN"
sleep 8  # 等待 metadata 更新完成

# 2. 在同地區建立臨時高規格 server
# cx53 = 16 核心 x86 / 32GB / €0.043/小時
hetzner create server hnsw-build-temp \
  --type cx53 --image ubuntu-22.04 --location nbg1 \
  --ssh-key <existing-key>

# 3. Attach Volume 到新 server
curl -X POST "https://api.hetzner.cloud/v1/volumes/$VOL_ID/actions/attach" \
  -H "Authorization: Bearer $HETZNER_API_TOKEN" \
  -d '{"server":<NEW_SERVER_ID>,"automount":false}'

# 4. SSH 進新 server，mount Volume 並啟動 PostgreSQL
ssh root@$NEW_IP
mount /dev/sdb /mnt/HC_Volume_<id>
docker run -d --name shared-db \
  -v /mnt/HC_Volume_<id>/postgres-data:/var/lib/postgresql/data \
  --shm-size=8g --memory=28g \
  pgvector/pgvector:pg16 \
  postgres -c max_parallel_workers=15 -c max_worker_processes=20 \
           -c maintenance_work_mem=12GB -c shared_buffers=4GB

# 5. 執行重型操作（HNSW 索引建立、VACUUM、重組等）
docker exec -i shared-db psql -U postgres -d <db> <<EOF
SET maintenance_work_mem = '12GB';
SET max_parallel_maintenance_workers = 15;
SET statement_timeout = 0;
CREATE INDEX ... USING hnsw ... WITH (m=24, ef_construction=200);
EOF

# 6. 完成後反向交換：停止 container → umount → detach → attach 回原 server
docker stop shared-db
umount /mnt/HC_Volume_<id>
curl -X POST .../detach
curl -X POST .../attach -d '{"server":<ORIGIN_ID>,"automount":false}'
ssh origin "mount /dev/sda /mnt/HC_Volume_<id> && docker start <db>"

# 7. 刪除臨時 server
curl -X DELETE "https://api.hetzner.cloud/v1/servers/$NEW_SERVER_ID" \
  -H "Authorization: Bearer $HETZNER_API_TOKEN"
```

## 成本計算

用 cx53（16 核心、32GB）跑 6 小時的 HNSW 建立，成本為 €0.043/小時 × 6 小時 = **€0.26**。相比永久升級一台 server，這幾乎可以忽略不計。而且一旦操作完成，server 立即刪除，不會有後續的維護成本。

## 何時該用這招

這個方案最適合以下場景：

- PostgreSQL 資料存在 Hetzner Volume 上，需要執行「一次性的大型 CPU/記憶體工作」（建立索引、VACUUM FULL、pg_repack、向量索引建立等）
- 只想用一次高規格 server，不值得永久升級
- 需要跨架構但不想做完整遷移
- 原 server 上還有其他服務在運行
- 資料量巨大（GB 級以上），網路傳輸不可行

## 何時不該用

反過來說，以下情況就不適合：

- 資料不在 Hetzner Volume 上，而是在 server 本地的 NVMe SSD
- Volume 跨越不同的地區
- 資料庫必須保持在線，無法容忍操作期間的停機
- 原 server 上其他服務正在連接這個資料庫，中斷會造成問題

## 必須注意的細節

在實際執行時，有幾個容易踩的坑：

**優雅停止很關鍵**。用 `docker stop` 向 PostgreSQL 發送 SIGTERM，它會執行 fast shutdown checkpoint，安全地關閉。絕對不能直接 power off server 或拔掉插頭，否則資料檔案會損毀。

**作業系統層級的 umount 不能漏**。即使 container 已經停止，Linux 的 mount 仍然活躍，Volume detach 會失敗。必須在原 server 上執行 `umount /mnt/HC_Volume_<id>`。

**PostgreSQL 資料檔案跨架構相容性有前提**。同一個 major version（比如都是 PG 16）且同一字節序的情況下才能相容。跨大版本（PG 14 升到 PG 16）就不行，必須用 pg_upgrade 或類似工具。

**新 server 的 PostgreSQL 版本要對應**。如果原資料是 PG 16，就要用 `pgvector/pgvector:pg16`，而不是 `pg17` 或其他版本。

**Volume swap 期間的 mount 衝突**。如果原 server 的 fstab 設定自動 mount 這個 Volume，在 swap 期間可能導致開機卡在選單。最好是手動 mount，避免 auto-mount 帶來的麻煩。

這招雖然看起來複雜，但一旦理解了原理，執行起來其實相當直接。對於需要在 Hetzner 上運行大型資料庫操作的團隊來說，它能夠大幅節省時間和成本。
