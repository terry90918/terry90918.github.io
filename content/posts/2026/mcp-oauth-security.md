---
title: 'MCP Server OAuth 安全設計'
publishedAt: '2026-03-25T10:08:00+08:00'
status: 'draft'
slug: 'mcp-oauth-security'
tags:
  - security-error-handling
  - mcp
  - oauth
  - security
---

在實作 MCP Server 的 OAuth 2.1 認證時，安全往往是最容易被忽視的細節。一個看似小的配置疏漏，就可能導致 CSRF 攻擊、token 洩漏或時序攻擊。根據我最近的實踐經驗，我整理出 11 項常見的安全陷阱，希望能幫助你在開發過程中避免踩坑。

## 高危風險（必須修正）

### 1. PKCE 比較必須採用 timing-safe 算法

PKCE（Proof Key for Public Clients）是現代 OAuth 2.1 的核心防護機制，用來驗證授權碼是否來自同一個用戶端。然而，許多開發者在驗證時會直接比較字符串：

```javascript
if (hash === challenge) {
  // 核准授權碼
}
```

這種簡單的字符串比較存在 timing oracle 漏洞。攻擊者可以通過測量比較耗時的差異，逐字節推測正確的 hash 值，最終偽造 PKCE 驗證。

正確的做法是使用 `timingSafeEqual`，確保無論字符串是否相等，比較耗時保持一致：

```javascript
import crypto from 'crypto'
crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(challenge))
```

### 2. OAuth state 參數必須附加 HMAC 簽名

`state` 參數是防止 CSRF 攻擊的最後防線。它應該由授權伺服器生成，經過用戶端往返，最後驗證其完整性。

許多實作會將 state 簡單地用 base64 編碼，然後存放在 session 中。但這有個問題：如果攻擊者猜測到 state 的生成規律（例如 timestamp + 幾位隨機數），他就可以偽造 state，繞過 CSRF 保護。

解決方案是對 state 進行 HMAC 簽名：

```javascript
const hmac = crypto.createHmac('sha256', secret)
hmac.update(state)
const signed = hmac.digest('hex')
```

驗證時，攻擊者即便知道 state 的值，也無法偽造簽名（除非他獲得了密鑰）。

### 3. OAuth 端點必須實作速率限制

在沒有限流的情況下，攻擊者可以針對 `/register`、`/token`、`/authorize` 等端點發起暴力破解或拒絕服務攻擊。

建議的速率限制策略：

- `/register`：10 次/小時（防止批量註冊濫用帳號）
- `/token`：20 次/分鐘（防止暴力破解 token）
- `/authorize`：30 次/分鐘（防止 DDoS）

可以使用 Redis 或簡單的記憶體計數器實作，根據用戶 IP 或用戶 ID 進行限流。

### 4. X-MCP-User-Id Header 的信任邊界

MCP Server 會在 HTTP 請求中包含 `X-MCP-User-Id` header，用來表示當前用戶。這個 header 很容易被濫用——用戶可以偽造這個 header，假扮另一個用戶。

正確的做法是：**僅信任來自已驗證的 MCP Server 的 header**。也就是說，你的 API 應該首先驗證請求中的 API key 是否有效，確認這個請求確實來自 MCP Server，然後才信任 `X-MCP-User-Id` 的值。換句話說，不要假設所有包含這個 header 的請求都是合法的。

## 中等風險（應該修正）

### 5. Token Store 缺少配置時應該拋出錯誤，而非靜默降級

許多實作會在 token store 配置缺失時，自動降級為記憶體存儲。表面上看起來很友好，但實際上隱藏了一個嚴重的問題：

- 記憶體存儲在伺服器重啟時會完全丟失
- 在分散式部署中，不同伺服器的記憶體是隔離的
- 用戶無法察覺這個降級，可能在生產環境中遭遇驗證失敗

更好的做法是在 token store 未配置時直接拋出錯誤，強制開發者進行正確配置：

```javascript
if (!tokenStore) {
  throw new Error('Token store 必須配置（Redis、PostgreSQL 等）')
}
```

### 6. 如果發送了 refresh token，就必須實作 refresh grant

許多 OAuth 實作會在 token 回應中包含 `refresh_token`，但並不提供用它來取得新 access token 的方法。這會導致兩個問題：

1. 資料庫中會累積無限增長的無用 refresh token
2. 用戶端無法使用 refresh token，只能在 access token 過期後重新授權

正確的做法是要麼不發送 refresh token，要麼必須實作 refresh grant 端點，允許用戶端使用 refresh token 來獲取新的 access token。

### 7. 不要用 email 作為 userId 存入 token 表

Email 是個人身份信息（PII）。將其直接存入 token 表作為主鍵會帶來隱私和安全風險：

- 任何能讀取 token 表的人都能看到用戶的 email 列表
- Email 變更時，主鍵也要跟著變，容易引發外鍵衝突

改用數據庫自動生成的 UUID 或自增 ID 作為 userId，在單獨的 users 表中存儲 email。

### 8. 資料庫連線應使用連線池，而非每次建立新連線

OAuth callback 端點經常需要查詢資料庫（驗證用戶、存儲 token 等）。如果每次請求都建立新連線，會導致：

- 連線建立開銷累積，響應時間增加
- 連線數爆炸式增長，超過資料庫允許的最大連線數
- 資源洩漏（連線未正確關閉）

使用連線池（如 PgBouncer、node-postgres 的 Pool）來重用連線，能大幅提升效能和穩定性。

## 低風險（建議修正）

### 9. /health 端點不應洩漏 activeSessions 計數

`/health` 端點通常用來檢查伺服器是否正常運行。某些實作會在響應中包含 `activeSessions` 計數，目的是提供額外的監控信息。

然而，這個計數可能被濫用：攻擊者可以通過不斷訪問 `/health` 並觀察 `activeSessions` 的變化，推測伺服器的使用者數量、使用時間段等敏感信息。

建議從 `/health` 響應中移除 session 計數，改為只返回簡單的狀態指示（如 `"status": "ok"`）。如果需要監控 session 數量，應將其暴露在受保護的管理端點上。

### 10. Google OAuth 錯誤不要直接反射 query parameter

許多實作會在錯誤情況下，直接將 Google 返回的 `error` query parameter 反射到用戶：

```javascript
const error = req.query.error
res.status(400).json({ error })
```

Google 的錯誤信息可能包含敏感信息，或被攻擊者利用來進行注入攻擊（如果錯誤信息被渲染到 HTML 中）。

正確的做法是使用一個白名單，只允許已知的錯誤類型通過，其他情況統一返回通用錯誤信息：

```javascript
const allowedErrors = ['access_denied', 'server_error', 'temporarily_unavailable']
const error = allowedErrors.includes(req.query.error) ? req.query.error : 'unknown_error'
```

### 11. localhost redirect URI 在開發環境可以接受，但生產必須限制埠號

OAuth 規範允許 `http://localhost` 作為 redirect URI，這對開發環境很方便。然而，在生產環境中，即使限制在 localhost，不同的埠號仍然可能被濫用。

例如，如果你的應用在 `http://localhost:3000`，攻擊者的應用在 `http://localhost:3001` 上，他仍然可能通過某些技巧重定向流量。

建議的做法：

- **開發環境**：允許 `http://localhost:3000` 等靈活的配置
- **生產環境**：只允許特定的、完全限定的 redirect URI（如 `https://yourdomain.com/callback`）

---

實作 OAuth 並不複雜，但安全性的細節卻容易被忽視。透過檢查這 11 項要點，你能夠大幅降低 MCP Server 的安全風險。建議在每次新增 OAuth 端點或 review 含 OAuth 的 PR 時，都逐項驗證一遍。
