---
title: 'Coolify 服務 vs 應用程式部署差異'
publishedAt: '2026-04-07T22:00:00+08:00'
status: 'draft'
slug: 'coolify-service-vs-application-deployment'
tags:
  - infrastructure-deployment
  - coolify
  - deployment
  - docker
---

在使用 Coolify 進行應用程式部署時，有不少細節容易忽視，導致部署失敗或環境配置混亂。這篇文章整理了在 Coolify 上部署應用程式和服務時的常見陷阱和最佳實踐。

## Coolify 中的 Service 和 Application 有何不同？

很多人會把 Coolify 中的 **Service** 和 **Application** 混淆，導致配置錯誤。其實兩者的更新方式完全不同：

**Application：** 可以直接透過 API 更新 `domains` 欄位。注意這裡用的是 `domains`（複數），不是 `fqdn`。如果你傳入 `fqdn` 欄位，Coolify 會拒絕並返回 422 錯誤。

**Service：** 只能更新以下三個欄位：`name`（名稱）、`description`（描述）和 `docker_compose_raw`（原始 Docker Compose 配置）。如果想改變 Service 的域名，必須編輯 `docker_compose_raw` 中的 Traefik labels，而不是直接設定 `domains`。

## 部署前的檢查清單

在用 Coolify 建立新資源之前，先花點時間列出現有的配置狀態。特別是要注意 DNS 記錄和通配符（wildcard）配置：

- 查詢當前 DNS 記錄
- 列出現有的 applications 和 services
- 檢查是否有 wildcard 規則（如 `*.jurislm.com`）會與新資源衝突

這個簡單的步驟能避免許多難以追蹤的部署問題。

## 環境變數的陷阱：Build-time vs Runtime

在使用 Next.js 和 Payload CMS 這類框架時，環境變數的時機很重要。

**問題所在：** Next.js 在 `next build` 時會根據 build 環境的環境變數生成 importMap.js。如果 build 環境和 runtime 環境的變數不同，應用程式啟動後找不到元件映射，導致白屏。

**Coolify 的 ARG 注入機制：** Coolify 在執行 `docker build` 時會自動注入環境變數作為 Docker `ARG`。這表示所有環境變數在 builder stage 都可用，但也表示你無法透過簡單的 shell override 來改變它們。

**正確做法：** 在 Dockerfile 中明確指定 build-time 的環境變數值，而不是依賴 Coolify 注入的值：

```dockerfile
RUN DATABASE_URL=postgresql://placeholder \
    PAYLOAD_SECRET=build-placeholder-must-be-at-least-32-chars-long \
    bun run build
```

這樣可以確保 build 階段使用的是預設值，而 runtime 再根據實際的環境變數運作。

## Nixpacks 和自訂 Dockerfile 的套件管理衝突

如果你的 repo 同時存在 `package-lock.json` 和 `bun.lock`，Nixpacks 會自動偵測到並選擇使用 npm，這會導致構建失敗（因為你可能想用 bun）。

**解決方案：** 確保 repo 中只有一種 lock 檔。如果你決定使用 bun，就刪除 `package-lock.json`；反之亦然。

當從 Nixpacks 遷移到手寫 Dockerfile 時，別忘了這個檢查清單：

1. 在 `next.config.ts` 中加入 `output: 'standalone'`，確保 Next.js 生成的產物可以獨立運行
2. Dockerfile 的 runner stage 需要設定 `ENV HOSTNAME=0.0.0.0`（Next.js 16.2+ 在 Docker 中的綁定問題）
3. 刪除 `nixpacks.toml`
4. 在 Coolify 中移除 `NIXPACKS_NODE_VERSION` 環境變數
5. 改用 Coolify UI 管理 health check，不要在 Dockerfile 中寫 `HEALTHCHECK` 指令

## Runner Stage 不要直接複製 node_modules

使用 bun workspace 時，symlinks 結構很脆弱。如果在 Dockerfile 中直接複製 builder stage 的 `node_modules` 到 runner stage，這些 symlinks 會被破壞，導致 `Cannot find package` 錯誤。

**正確做法：** 在 runner stage 重新執行 `bun install --production`，讓 bun 重新建立正確的 symlinks。

## Release Please 的版本管理

使用 Release Please 自動化版本發佈時，commit 訊息的前綴決定版本號碼的變化：

- `feat:` → MINOR 版本
- `fix:` → PATCH 版本
- `feat!:` 或 `fix!:` → MAJOR 版本

**避免的陷阱：** 使用「簡單模式」時，component name 的推導是隱式的，容易出錯。改用「Manifest 模式」並設定 `include-component-in-tag: false` 可以避免 tag 前綴不匹配的問題。

## 資料庫遷移的安全步驟

修改資料庫 schema 時，絕不要跳過任何步驟。正確的遷移流程是：

1. 備份相關欄位的資料
2. 建立完整的資料備份
3. 刪除舊的 constraint
4. 執行資料轉換邏輯
5. 驗證轉換結果（確保沒有異常資料）
6. 建立新的 constraint

**最重要的原則：** 永遠先建立 migration 檔案，再執行 `db migrate` 命令。絕不要手動執行 SQL 指令（如 `CREATE TABLE`）。如果手動執行了，補救方法是更新 migrations 表中的記錄，把實際執行的 SQL 和其 SHA256 checksum 寫入資料庫。

## Staging 環境的三層防護

在將應用程式部署到 staging 環境前，務必啟用保護機制，防止搜尋引擎索引和無關訪問：

1. **HTTP Basic Auth：** 當 `STAGING=true` 時啟用
2. **robots.txt：** 在 `Disallow:` 中列出所有路徑
3. **X-Robots-Tag header：** 返回 `noindex` 指令

特別要注意的是，`/api/*` 路由應該豁免認證要求，這樣 Coolify 的 health check 才能正常工作。

## Health Check 和 Basic Auth 的衝突

如果應用程式啟用了 middleware-level 的 Basic Auth（如 `STAGING=true`），Coolify 的 health check 路徑**必須**選擇一個不需要認證的端點，否則會導致部署回滾。

**例子：**

- `path: /` → 返回 401 Unauthorized → health check 失敗 → 部署回滾
- `path: /api/health` → 返回 200 OK（因為 `/api/*` 豁免認證）→ 部署成功

診斷時，如果 Coolify 部署日誌顯示 `wget: can't connect` 或 `Connection refused`，先用 `ss -tlnp` 確認 hostname binding 是否正確，再用 `curl -v localhost:PORT/path` 測試認證問題。

## 避免 HEALTHCHECK 雙重機制

Dockerfile 中的 `HEALTHCHECK` 指令和 Coolify UI 的 health check 設定不應該同時啟用。原因是當 Coolify UI health check 啟用時，Coolify 會注入自己的檢查格式（`curl` 或 `wget`），覆蓋 Dockerfile 中的設定。

**正確做法：** 選擇啟用 Coolify UI health check，並在 Dockerfile 中移除 `HEALTHCHECK` 指令。如果想診斷當前使用的是哪個機制，執行：

```bash
docker inspect <container-name> --format '{{json .Config.Healthcheck}}'
```

## Coolify 資料庫和 Hetzner 防火牆的同步

在 Coolify 上建立新資料庫時，如果指定了 `public_port`（公開連接埠），**必須**同步驗證 Hetzner 防火牆設定，否則外部連接會逾時。

建立資料庫時的檢查清單：

1. 查詢防火牆當前規則，找出 PostgreSQL 允許的連接埠範圍
2. 如果新連接埠超出範圍，立即更新防火牆規則
3. 驗證連通性：`nc -z -w 3 46.225.58.202 <port>`

這是一個容易遺漏但會造成大量除錯時間浪費的步驟。

## Drizzle Push Schema 的 Schema 衝突

當使用 Drizzle 搭配 Payload CMS 時，如果 dev 資料庫中有舊的 schema（如 articles），但代碼改了 collection 名稱（如改為 Posts），執行 `push: true` 會導致 Drizzle 要求互動確認，進而讓背景進程掛死。

**解決方案：** 清空舊 schema 並重新建立：

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO <user>;
```

然後重啟應用程式。診斷時查看伺服器日誌，如果看到 `Is ... created or renamed` 這類訊息，就代表需要手動處理 schema 衝突。

---

這些經驗教訓來自於在生產環境中部署應用程式時累積的教訓。掌握這些細節能顯著減少部署失敗和環境配置問題的發生率。
