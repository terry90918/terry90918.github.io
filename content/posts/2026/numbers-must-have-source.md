---
title: '數字必須附來源：df -h 輸出的斷言紀律'
publishedAt: '2026-04-24T10:52:00+08:00'
status: 'draft'
slug: 'numbers-must-have-source'
tags:
  - debugging-diagnostics
  - debugging
  - discipline
  - verification
---

在技術規劃文件中引用具體的數字——磁碟空間、資料量、執行時間、成本——是很常見的做法。但這些數字往往潛藏一個問題：它們來自哪裡？

一個真實的案例是這樣的。2026 年 4 月 19 日至 20 日，我在撰寫 Hetzner 資料庫操作 playbook 時，文件裡寫著「Volume 剩餘空間 132 GB」。基於這個數字，我推導出「HNSW index 需要 178 GB，肯定裝不進 Volume，必須使用 NVMe 本地 tablespace」。於是整個設計計劃圍繞這個結論展開——phase 5b 設計在 cx53 的 NVMe 上建立 local_ts，phase 6b 再反向搬回 pg_default。

直到真正執行 `df -h /mnt/HC_Volume_104577270` 時才發現：Volume 剩餘空間實際上是 **266-311 GB**，HNSW 其實是塞得進去的。整個迂迴的設計步驟都不需要。

那次修正耗費了 2-3 小時重新規劃、撤銷設計、改寫文件。更糟的是，如果沒有使用者 review 抓出來，這個錯誤的方向可能就直接走進 production 操作了。

---

## 數字必須可驗證

解決方案很簡單：**所有寫進文件的數字都必須附上可驗證的命令出處**。

不同類型的數字有不同的取得方式：

| 數字類型                       | 是否必須有出處  | 驗證方式                                                   |
| ------------------------------ | --------------- | ---------------------------------------------------------- |
| 磁碟剩餘空間 / 已用空間        | ✅ 必須         | `df -h /mount`、`du -sh directory`                         |
| 資料表 / index 大小            | ✅ 必須         | `pg_size_pretty(pg_relation_size())`、`pg_class.reltuples` |
| 伺服器 RAM / CPU 核心數        | ✅ 必須         | `free -h`、`nproc`、Hetzner API                            |
| 建置 / 遷移耗時                | ✅ 必須         | log 時間戳、`time` 命令、`pg_stat_activity.query_start`    |
| 成本（歐元/月、美元/操作）     | ✅ 必須         | Hetzner 定價頁面 URL、Cloudflare/AWS 計算機                |
| 行數（百萬級以上）             | ✅ 必須         | `pg_class.reltuples::bigint`（避免 `COUNT(*)`）            |
| 全球缺貨、不支援某特性         | ✅ 必須         | API 回應 + 控制面板截圖雙驗證                              |
| 概念性效能比較（X 比 Y 快 N%） | ⚠️ 標註「估計」 | 來自外部論文或廠商文件 + 連結                              |

---

## 實際寫法

每個關鍵數字後面加上方括號，記錄出處：

```markdown
- HNSW 建置時間：5 小時 45 分鐘 [PG log: 2026-04-23 01:23 → 07:08 UTC]
- Volume 剩餘空間：266 GB [df -h /mnt/HC_Volume_104577270 @ 2026-04-19]
- 2,800 萬個 vector [pg_class.reltuples for documents_051]
- CAX31 月費：€15.84 [hetzner.com/cloud/pricing 2026-04-23]
```

或者用專屬章節「Sources of Numbers」集中列出所有查詢命令。

**應該避免的寫法包括**：

- ❌ 寫「應該是 X」或「大概 X」卻用精確數字呈現
- ❌ 從別人或早期文件複製數字而沒有重新驗證
- ❌ 提案前沒實測就用估算值，事後卻當成既定事實
- ❌ 混淆預估值和實測值，都寫得一樣精確而沒標註

**正確的做法**：

- ✅ 預估值要明確標註「預估 3-5 小時」並記錄 TODO 待實測完成後補上實際數字
- ✅ 涉及重大決策的臨界點（go/no-go threshold），必須用新鮮的 `df -h` 等實測數據支撐
- ✅ 當數字過時時（例如伺服器規格、定價），更新時順帶補上新的出處

---

## 具體案例

**錯誤的做法**（從記憶推論）：

```
HNSW 178 GB 估算 > Volume 132 GB 剩餘空間
→ 必須使用本地 NVMe tablespace
→ Phase 5b: 在 cx53 NVMe 建立 local_ts
→ Phase 6b: reverse swap 前執行 ALTER INDEX SET TABLESPACE pg_default
```

事後發現數字錯誤，整段設計報廢。

**正確的做法**（實測驅動）：

```
Volume 剩餘空間 [df -h /mnt/HC_Volume_104577270 2026-04-19 03:00 UTC]: 266 GB
HNSW 估算 [pgvector docs: 28M × 1536 × 4 byte ≈ 178 GB raw + 30% overhead ≈ 230 GB]: 230 GB

結論：230 < 266 → Volume 能容納 HNSW，無需 local_ts 繞路
```

---

## 應用場景

這個原則適用於以下情況：

- 撰寫 OpenSpec proposal、design doc、spec
- Playbook 或 journey log
- README、CLAUDE.md
- 重大操作前的檢查清單文件
- 任何需要用技術數據支撐決策的文件

**特別的觸發點**：當你讀到自己寫的文件，心裡浮出「這個數字哪來的？」的疑問時，立刻補上出處。在 PR review 時看到沒標註來源的具體數字，也要要求補充。發現數字錯誤時，不只要改數字，還要補出處，並寫進 journey log 防止以後重蹈覆轍。

這個習慣看似多了幾分鐘的驗證工作，但它避免的是小時級的規劃返工，甚至更嚴重的 production 決策錯誤。
