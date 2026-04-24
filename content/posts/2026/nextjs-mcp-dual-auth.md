---
title: 'Next.js MCP 雙重認證架構'
publishedAt: '2026-03-25T12:24:00+08:00'
status: 'published'
slug: 'nextjs-mcp-dual-auth'
tags:
  - security-error-handling
  - nextjs
  - mcp
  - authentication
---

當你的 Next.js 應用開始集成 MCP Server 時，會遇到一個有趣的認證問題：既有的 NextAuth 認證機制只識別透過瀏覽器傳來的 session cookie，但 MCP Server 代理使用者發起的 API 請求卻沒有這個 cookie。這導致所有 MCP 請求都以 401 未授權的狀態被拒絕。

## 問題的根源

傳統的 Next.js 應用中，`requireAuth()` 函式通常只驗證 NextAuth session：

```typescript
const session = await auth()
if (!session?.user?.id) throw new UnauthorizedError()
```

這個方式對瀏覽器使用者完全適用。但當 MCP Server 作為代理層時，它需要以服務身份向 API 發送請求，同時攜帶被代理使用者的身份資訊。此時就需要一套不同的認證機制——不依賴 cookie，而是透過特定的 header 和內部 API key 來驗證。

## 雙重認證方案

解決這個問題的方法是讓 `requireAuth()` 同時支援兩種認證策略。優先嘗試 MCP 內部認證，失敗才回退到 NextAuth：

```typescript
import { headers } from 'next/headers'

export async function requireAuth(): Promise<AuthenticatedUser> {
  // 1. 先嘗試 MCP 內部請求
  const mcpUser = await tryMcpInternalAuth()
  if (mcpUser) return mcpUser

  // 2. 一般 NextAuth session
  const session = await auth()
  if (!session?.user?.id) throw new UnauthorizedError()
  return { userId: session.user.id, role: session.user.role }
}

async function tryMcpInternalAuth(): Promise<AuthenticatedUser | null> {
  const apiKey = process.env.MCP_INTERNAL_API_KEY
  if (!apiKey) return null

  const h = await headers()
  const auth = h.get('authorization')
  const userId = h.get('x-mcp-user-id')
  if (!auth || !userId) return null

  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token || token !== apiKey) return null

  return { userId, role: 'user' }
}
```

這個實現方案的關鍵在於：

首先檢查是否存在 `MCP_INTERNAL_API_KEY` 環境變數。如果沒有配置，直接跳過 MCP 認證，保持既有行為不變。

然後從請求 header 中提取兩個必要資訊：`Authorization` header（包含 API key）和 `x-mcp-user-id` header（包含被代理的使用者 ID）。

驗證邏輯採用分層防禦：先驗證 API key，只有在 API key 正確的前提下，才信任 `x-mcp-user-id` 這個自訂 header。這防止了偽造身份的風險——攻擊者即使知道某個使用者 ID，也必須同時掌握 API key 才能冒充。

## 安全考量

這個方案的安全性建立在幾個關鍵假設上：

**環境變數隔離**：`MCP_INTERNAL_API_KEY` 必須與 MCP Server 端的環境變數保持一致。在部署時透過環境變數注入，而不是硬編碼到程式碼中。只有內部服務能存取到這個 key。

**頭信息可信性**：`x-mcp-user-id` 只在 API key 驗證通過時被信任。MCP Server 在向 API 發送請求時，應該已經透過 OAuth 2.1 等標準協定驗證過終端使用者的身份，並從後端的 users 表中查詢過該使用者。傳遞的 user ID 代表已驗證的身份。

**最小權限原則**：在 MCP 認證的使用者身上，可以選擇賦予較低的權限級別（例如 `role: "user"`），與瀏覽器直接登入取得的權限區分開來。這樣即便認證通過，也限制了能執行的操作範圍。

## 實際應用場景

這種雙重認證模式適用於以下情況：

當你已經有一套成熟的 Next.js 應用配合 NextAuth，現在要引入 MCP Server 作為中間層時，不需要重寫整個認證系統。只需在既有的 `requireAuth()` 中加入 MCP 認證分支，即可無縫支援兩種請求來源。

對於需要 per-user 資料隔離的場景，這個方案特別有用。MCP Server 在代理請求時會帶上使用者 ID，確保每個請求都能返回該特定使用者的資料，而不是全局或管理員視圖。

整體而言，這是一個輕量級但有效的認證模式——不過度設計，專注於解決實際問題，並且易於在既有架構中實施。
