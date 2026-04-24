---
title: 'GPT-5 Max Completion Tokens 的設定陷阱'
publishedAt: '2026-03-30T10:16:00+08:00'
status: 'published'
slug: 'openai-gpt5-max-completion-tokens'
tags:
  - business-logic-algorithms
  - openai
  - gpt
  - tokens
---

最近在處理 OpenAI API 的時候，遇到一個容易踩坑的問題：**GPT-5.4 及 GPT-5.4-mini 模型不支援傳統的 `max_tokens` 參數**。

## 問題現象

當你用 OpenAI TypeScript SDK 呼叫 GPT-5.4-mini，並帶上 `max_tokens` 參數時，API 會回傳 400 錯誤：

```
Unsupported parameter: 'max_tokens' is not supported with this model.
Use 'max_completion_tokens' instead.
```

這個錯誤看起來很直白，但它經常會被 try-catch 悄悄吞掉。特別是在那些不記錄失敗細節的地方，功能看起來完全正常——API 回傳了 200 OK，但實際上返回的內容全是空字符串。我在同一個 session 裡至少踩過兩次（在 golden-set-generator 和 contextual-prepender 這兩個模組），才意識到這個圈套。

## 正確做法

簡單來說：**改用 `max_completion_tokens` 替代 `max_tokens`**。

```typescript
// ❌ 錯誤（會拋出 400 錯誤）
await openai.chat.completions.create({
  model: 'gpt-5.4-mini',
  max_tokens: 300,
})

// ✅ 正確
await openai.chat.completions.create({
  model: 'gpt-5.4-mini',
  max_completion_tokens: 300,
})
```

## 預防隱藏的失敗

更重要的是，不要在 catch 區塊裡靜默吞掉錯誤。至少記錄前幾次失敗，這樣才能及時發現問題：

```typescript
let skippedCount = 0

try {
  // 呼叫 API
} catch (err) {
  skippedCount++
  const msg = err instanceof Error ? err.message : String(err)
  if (skippedCount <= 3) {
    console.error(`[module] 失敗: ${msg}`)
  }
}
```

這樣做的好處是：即使有大量的失敗，你也不會被日誌淹沒，但至少能看到前幾個失敗訊息。這往往足以診斷出問題來源。

## 何時需要注意

- 使用 OpenAI API 的 GPT-5.4 或 GPT-5.4-mini 模型
- 從 GPT-4o-mini 升級到 GPT-5.4-mini 時（這是最容易遺漏的情況）
- API 回傳 400 錯誤，且錯誤訊息提到 `max_tokens` 不支援
- 功能看似成功但返回結果全為空（HTTP 200 卻沒有有效資料）

一旦你碰到這類詭異的情況——程式碼邏輯沒錯，但結果就是空的——第一個要檢查的就是 API 參數名稱有沒有對上新模型的要求。
