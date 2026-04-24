---
title: 'Coolify SSH + tmux 長時間容器操作'
publishedAt: '2026-04-16T12:01:00+08:00'
status: 'published'
slug: 'coolify-ssh-tmux-long-running-container-ops'
tags:
  - infrastructure-deployment
  - coolify
  - ssh
  - tmux
  - docker
---

在 Coolify 管理的基礎設施上，有時候需要執行耗時數小時甚至數天的資料庫操作，比如建立大型索引、執行大規模 ETL，或者進行 schema migration。這些操作對網路穩定性的要求特別高——任何一次連線中斷都可能導致整個操作前功盡棄。

## 遠端連線的危機

當你在本地用 `psql` 直接連到遠端服務器上的容器時，看似平常的操作其實隱藏著風險。如果 macOS 進入睡眠，或是網路短暫中斷，SSH 連線會被斷開，PostgreSQL 後端進程收到 `SIGTERM` 信號，導致正在執行的操作（像是 `CREATE INDEX CONCURRENTLY`）被迫中止，而且索引很可能被標記為 INVALID，白白浪費了所有計算時間。

你可以用一個簡單的 SQL 查詢來檢查連線的真實狀態：

```sql
SELECT pid, usename, client_addr, state
FROM pg_stat_activity
WHERE datname = 'your_database';
```

查看結果中的 `client_addr` 欄位就能判斷：

- **`client_addr` 為空** → 操作在容器本地執行，不受遠端網路影響（安全）
- **`client_addr` 有 IP 位址** → 遠端連線，斷線風險高

## 穩定之道：SSH + tmux

解決方案很優雅：不在本地直接連接，而是 SSH 進 Hetzner 服務器，在服務器上用 tmux 建立一個持久化的終端會話，再從那裡 `docker exec` 進容器執行操作。這樣即使你的本地連線斷開，遠端的 tmux session 還會繼續運行，容器內的操作也不會被打斷。

## 分步驟操作指南

**第一步：取得 SSH private key**

使用 Coolify MCP 工具列出可用的 SSH 密鑰：

```bash
# 這會返回 Coolify 宿主機的 private key
# 通常 id=0 的就是你需要的（name: "localhost's key"）
# user=root, port=22
mcp__plugin_jt_coolify__private_keys action=list
```

**第二步：建立臨時 SSH 連線**

```bash
# 建立臨時目錄
mkdir -p /tmp/coolify_ssh && chmod 700 /tmp/coolify_ssh

# 將 private key 寫入檔案
cat > /tmp/coolify_ssh/id_ed25519 << 'KEYEOF'
-----BEGIN OPENSSH PRIVATE KEY-----
[從上一步取得的 private_key 內容]
-----END OPENSSH PRIVATE KEY-----
KEYEOF
chmod 600 /tmp/coolify_ssh/id_ed25519

# 驗證 SSH 連線是否可用
ssh -i /tmp/coolify_ssh/id_ed25519 -o StrictHostKeyChecking=no root@<hetzner-ip> \
  "echo 'SSH OK' && hostname"
```

**第三步：找出目標容器**

容器名稱通常就是 Coolify 資源的 UUID：

```bash
ssh -i /tmp/coolify_ssh/id_ed25519 -o StrictHostKeyChecking=no root@<hetzner-ip> \
  "docker ps --format '{{.ID}}\t{{.Names}}\t{{.Image}}' | grep pgvector"
```

**第四步：建立 tmux session**

在遠端服務器上建立一個新的 tmux 會話：

```bash
ssh -i /tmp/coolify_ssh/id_ed25519 -o StrictHostKeyChecking=no root@<hetzner-ip> \
  "tmux new-session -d -s <session-name> -x 220 -y 50"
```

**第五步：執行容器內的命令**

透過 tmux 發送命令，在容器內執行你的長時間操作：

```bash
ssh -i /tmp/coolify_ssh/id_ed25519 -o StrictHostKeyChecking=no root@<hetzner-ip> \
  "tmux send-keys -t <session-name> \
    \"docker exec <container-id> psql -U postgres <db> -c 'CREATE INDEX CONCURRENTLY ...'\" Enter"
```

**第六步：監控執行進度**

隨時查看 tmux session 中的輸出，不需要保持 SSH 連線：

```bash
ssh -i /tmp/coolify_ssh/id_ed25519 -o StrictHostKeyChecking=no root@<hetzner-ip> \
  "tmux capture-pane -t <session-name> -p"
```

## JurisLM 專案的快捷設定

為了方便在 JurisLM 專案中使用，以下是預先設定的參數：

| 參數          | 值                  |
| ------------- | ------------------- |
| Hetzner IP    | `46.225.58.202`     |
| SSH 使用者    | `root`              |
| SSH 埠號      | `22`                |
| 本地 SSH 金鑰 | `~/.ssh/id_ed25519` |

**容器對應表：**

| 容器 UUID                  | 資料庫           | 連接埠 |
| -------------------------- | ---------------- | ------ |
| `bsoc4s0w0g0ccwc4804wos80` | entire-shared-db | 5442   |
| `i880ws0cg88cc4ccw4k8skk0` | entire-prod-db   | 5443   |
| `zsc0ocgs008ocggggs4gwscg` | entire-dev-db    | 5444   |

如果 `~/.ssh/config` 已經設定了 `Host hetzner` 的快捷方式，所有 SSH 命令可以簡化為 `ssh hetzner` 替代冗長的完整命令。

## tmux 常用命令速查

```bash
# 若已設定 ~/.ssh/config，最簡單的連線方式
ssh hetzner

# 列出服務器上所有現有的 tmux session
ssh hetzner "tmux list-sessions"

# 查看特定 session 的最後 50 行輸出
ssh hetzner "tmux capture-pane -t <session-name> -p -S -50"

# 在 session 中發送 Ctrl+C 來中止正在執行的操作
ssh hetzner "tmux send-keys -t <session-name> C-c"

# 刪除不再需要的 session
ssh hetzner "tmux kill-session -t <session-name>"
```

## 何時該用這個方法

這套方案特別適合以下場景：

- **任何 Coolify 管理的容器** — 需要在容器內執行長時間操作
- **預期執行時間超過 1 小時** — REINDEX、大型 ETL、schema migration、HNSW 索引建置
- **需要確認操作的本地性** — 務必用 `pg_stat_activity.client_addr` 驗證操作真的在容器本地執行
- **無法保證網路穩定** — 開發環境中有睡眠、網路中斷等突發情況

透過這個模式，你的長時間操作變得可靠和可監控——即使 macOS 休眠、WiFi 斷線，遠端的工作仍會繼續進行。這正是 tmux 這類終端多路複用工具在基礎設施維護中的價值所在。
