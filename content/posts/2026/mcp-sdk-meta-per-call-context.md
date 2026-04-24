---
title: 'MCP SDK _meta 欄位傳遞 Per-Request Context'
publishedAt: '2026-03-28T14:19:00+08:00'
status: 'draft'
slug: 'mcp-sdk-meta-per-call-context'
tags:
  - business-logic-algorithms
  - mcp
  - sdk
  - context
---

在使用 MCP（Model Context Protocol）時，我們常常會遇到一個有趣的設計問題：如何在 singleton adapter 中傳遞 per-request 的上下文資訊？特別是當我們需要知道「誰在呼叫這個工具」時，這個問題變得尤為重要。

## 問題的根源

通常，InProcessMcpAdapter 會在應用啟動時建立一次，之後就保持不變。這是個合理的設計 — 避免重複初始化開銷。但這也帶來了一個難題：無法在建構時注入每個請求都不同的 userId。

然而，實際的業務邏輯往往需要知道「這個工具呼叫來自哪個用戶」，無論是為了認證、授權還是審計日誌。我們需要一個辦法，在每次 MCP Tool 呼叫時，動態地傳遞使用者身份。

## MCP SDK 的 \_meta 欄位

幸運的是，MCP SDK 為我們提供了一個巧妙的解決方案。在 `CallToolRequestParams` 中，有一個 `_meta` 欄位，它採用了 **loose schema**（`z.core.$loose`）。這意味著自訂的鍵值對不會被驗證器拒絕，而是會被保留並傳遞到 server 端。

### 客戶端：注入上下文

當調用 callTool 時，我們可以透過 `_meta` 欄位傳遞任意的上下文資訊：

```typescript
client.callTool({
  name: 'tool_name',
  arguments: { query: '...' },
  _meta: { userId: 'user-123' }, // 自訂欄位，會通過協議傳遞
})
```

### 伺服器端：讀取上下文

在 tool handler 中，這些資訊會出現在 `extra._meta` 中，我們可以直接讀取：

```typescript
mcpServer.tool('tool_name', schema, async (args, extra) => {
  const userId = (extra._meta as Record<string, unknown>)?.userId as string | undefined
  const client = userId ? apiClient.withUserId(userId) : apiClient
  return client.doSomething(args)
})
```

### 整潔的介面設計

為了讓代碼更清晰，我們可以定義一個明確的上下文介面：

```typescript
interface McpToolContext {
  userId?: string
}

interface McpServerAdapter {
  callTool(
    toolName: string,
    args: Record<string, unknown>,
    context?: McpToolContext
  ): Promise<unknown>
}
```

### 不可變模式處理 userId

當我們需要根據不同的 userId 建立不同的客戶端實例時，應該遵循不可變模式，而不是直接修改現有實例：

```typescript
class ApiClient {
  withUserId(userId: string): ApiClient {
    return new ApiClient(this.baseUrl, this.apiKey, userId)
  }
}
```

這樣做的好處是避免副作用，保持線程安全。

## 什麼時候使用這個模式

這個模式特別適合以下場景：

- **MCP adapter 是 singleton** — 不想在每次請求時重複初始化
- **需要傳遞使用者身份** — 在整個 MCP Tool 呼叫鏈中追蹤是誰在操作
- **需要審計日誌** — 記錄每個工具呼叫的來源用戶
- **InProcess 模式** — 沒有 HTTP 層的 OAuth 認證可用

## MCP 中的三種上下文傳遞機制

MCP SDK 實際上提供了三種不同的方式來傳遞上下文資訊，各有各的適用場景：

1. **`_meta`（per-call，loose schema）** — 適合 InProcess 模式，每次呼叫都可以注入自訂上下文，這是我們討論的方式
2. **`authInfo`（per-session，OAuth）** — 適合外部的 HTTP MCP server，通常由 OAuth 框架提供
3. **`RequestOptions`（client-only）** — 僅在客戶端可用，無法傳遞到 server

選擇正確的機制取決於你的架構和需求。對於 InProcess adapter 的場景，`_meta` 是最合適、最靈活的選擇。
