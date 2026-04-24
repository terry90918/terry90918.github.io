---
title: 'Next.js Standalone Docker Hostname 設定'
publishedAt: '2026-04-02T16:08:00+08:00'
status: 'published'
slug: 'nextjs-standalone-docker-hostname'
tags:
  - infrastructure-deployment
  - nextjs
  - docker
  - deployment
---

在 Next.js Standalone 模式下部署到 Docker 時，開發者常會遇到一個隱藏的坑：伺服器看似正常啟動，但 Healthcheck 卻不斷失敗，最終導致容器被 Rollback。讓我分享一下我在 Coolify 環境部署中遇到的這個問題及其解決方案。

## 問題的症狀

當我將 Next.js 應用以 Standalone 模式部署到 Docker 容器時，容器日誌清楚地顯示 `Ready in Xms`，伺服器似乎已經成功啟動。但是 Coolify 的 Healthcheck 卻報告「Connection refused」，並在重試 10 次後全部失敗，最終自動回滾到舊版本容器。

這個現象很令人困惑：日誌說一切正常，但健康檢查卻無法連線。

## 根本原因

問題的根源在於 **Next.js Standalone 模式會綁定到容器的 hostname**，而非全局的 `0.0.0.0`。例如，在我的 Alpine 容器內，伺服器實際綁定到像 `3bb881b0fbc1:3000` 或特定的 IPv6 地址（如 `fde4:d481:aa6e::1e:3000`），而不是 `0.0.0.0:3000`。

而 Coolify 的預設 Healthcheck 則使用 `wget localhost:3000`，試圖在 localhost 上連線。當伺服器沒有監聽 localhost 時，連線當然會被拒絕。

這個行為在不同的 Next.js 版本間有所差異。我注意到：

- Next.js 16.1.6 + bun + Alpine：預設綁定 `:::3000`（IPv6 全地址，通常可正常工作）
- Next.js 16.2.1 + bun + Alpine：綁定到特定的 IPv6 地址（觸發此問題）

## 解決方案

解決方法非常直接：在 Dockerfile 的 Runner Stage 中明確設置環境變數：

```dockerfile
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
```

藉由將 `HOSTNAME` 設為 `0.0.0.0`，Next.js Standalone 會綁定到所有可用的網絡介面，讓 Healthcheck 能夠順利透過 localhost 連線。

## 診斷步驟

如果你不確定自己的容器綁定到哪裡，可以進入容器執行以下命令：

```bash
docker exec <container-id> ss -tlnp
```

查看輸出：

- **正常狀態**：看到 `0.0.0.0:3000` 或 `:::3000`（IPv6 通配符）
- **異常狀態**：看到特定的 IPv6 地址，如 `fde4:d481:aa6e::1e:3000`

## 何時應該檢查此問題

1. **使用 `output: 'standalone'` 部署 Next.js 到任何 Docker 環境** — 特別是 Coolify、Railway 或類似的容器編排平台
2. **Healthcheck 失敗但容器日誌顯示「Ready in Xms」** — 這是最明確的症狀
3. **Coolify 在 Healthcheck 重試 10 次後自動回滾** — 說明伺服器本身沒有問題，是連線性問題
4. **升級 Next.js 小版本號後部署突然失敗** — Next.js 版本間的 Standalone 行為可能有差異，值得優先檢查此設定

將此環境變數添加到 Dockerfile，通常能立即解決問題，讓 Healthcheck 順利通過，容器穩定運行。
