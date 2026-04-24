---
title: 'Anthropic Managed Agents 可觀測性實作'
publishedAt: '2026-04-15T10:18:00+08:00'
status: 'draft'
slug: 'anthropic-managed-agents-observability'
tags:
  - business-logic-algorithms
  - anthropic
  - agents
  - observability
---

在開發使用 Anthropic Managed Agents API 的 AI 功能時，我經常遇到一個令人沮喪的問題：不確定 AI 是否真的有呼叫自訂工具、呼叫了幾次，以及傳入了什麼參數。本地沒有任何日誌，也看不到內部事件流，使得調試變得異常困難。

## 問題的根源

當 AI 模型決定要使用你定義的 custom tools 時，這個決策過程對開發者來說是個黑箱。你無法直接觀察 AI 的推理過程、無法看到參數是否正確傳遞、更無法驗證工具執行的順序是否符合預期。特別是在複雜的工作流中，這種不透明性可能導致難以追蹤的 bug。

## 解決方案：利用 Anthropic 的事件歷史 API

好消息是，Anthropic 的後端本身存儲了每個 session 的完整事件歷史。你可以直接查詢這些數據，而無需在本地應用中添加額外的日誌系統。

查詢事件歷史非常簡單：

```bash
curl "https://api.anthropic.com/v1/sessions/{session_id}/events?beta=true" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  | jq '.data[] | {type, name, input, processed_at}'
```

關鍵是取得正確的 `session_id`。在大多數應用中，這個 ID 通常存儲在資料庫中。以我們的 stock 專案為例，可以這樣查詢：

```bash
psql "$DATABASE_URL" -c \
  "SELECT \"sessionId\", title FROM \"AiSession\" WHERE \"sessionId\" IS NOT NULL ORDER BY \"lastUsedAt\" DESC LIMIT 5;"
```

一旦有了 session ID，就可以調用事件 API 查看完整的執行歷史。

## 理解關鍵事件類型

事件歷史中包含多種事件，但對於可觀測性來說，以下幾種最重要：

| 事件類型                  | 觀察目的                                  |
| ------------------------- | ----------------------------------------- |
| `agent.custom_tool_use`   | AI 呼叫了哪個工具、傳入什麼參數           |
| `user.custom_tool_result` | 工具結果已送回給 AI                       |
| `span.model_request_end`  | 模型推論完成，包含 token 使用量           |
| `session.status_idle`     | Session 結束，包含停止原因（stop_reason） |

每個事件都包含時間戳，讓你可以追蹤完整的執行時間線。

## 實際案例：stock 專案的觀察

當用戶在 stock 應用中提問「分析持倉」時，通過查詢事件歷史，我們看到了以下執行順序：

**第一步：** AI 同時發起兩個並行呼叫：

- `get_portfolio_holdings` - 獲取用戶的持倉清單
- `get_user_profile` - 獲取用戶基本信息

**第二步：** 當持倉清單返回後，AI 對返回的每支股票各呼叫一次 `get_stock_price`。在我們的測試中，用戶持有 38 支股票，所以這個步驟產生了 38 次工具呼叫。

**第三步：** 所有工具結果收集完成後，AI 使用這些數據生成最終的分析回覆。

這個觀察告訴我們：AI 能夠並行化獨立的工具呼叫，但會等待前置工具結果才能決定後續的呼叫策略。這正是我們期望的行為。

## 何時使用事件歷史觀察

這個方法特別適合以下情況：

- **懷疑工具未被呼叫** - 當你預期 AI 應該調用某個工具但似乎沒有時
- **驗證工具參數** - 確認 AI 傳入的參數格式是否正確（例如股票代碼格式、日期格式等）
- **排查異常調用** - 發現工具被呼叫的次數超過預期，需要找出原因
- **快速除錯** - 無需修改代碼，直接查看後端數據快速判斷問題所在

與其在本地代碼中添加繁瑣的日誌語句，直接查詢 Anthropic 的事件 API 往往更高效。事件歷史是一個強大的除錯工具，讓你能夠完全透視 AI 的決策過程和工具調用行為。
