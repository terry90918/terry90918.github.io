---
title: 'Vitest Setup 中環境變數覆寫的陷阱'
publishedAt: '2026-03-22T16:57:00+08:00'
status: 'published'
slug: 'vitest-setup-env-override'
tags:
  - testing-quality
  - vitest
  - testing
  - environment
---

在整合測試中，你可能遇到過一個令人困擾的問題：某些測試能正常運作，但當你真正呼叫外部 API（如 Anthropic 或 OpenAI）時，卻莫名其妙地收到 401 認證失敗。你確信 API 金鑰已經正確設定，環境變數也沒問題，但測試還是失敗了。這種情況往往會讓人陷入漫無目的的除錯迷宮，懷疑是 SDK 版本問題、瀏覽器偵測邏輯有誤，或者是某個 adapter 設定不對。

其實，問題的根源往往出在你的 Vitest 測試設定檔上。

## 環境變數被無聲地覆蓋了

大多數專案為了保護單元測試，會在 `tests/setup.ts` 中故意用假的 API 金鑰來覆蓋 `process.env` 變數。這個做法本身沒有問題——它確保單元測試不會意外呼叫真實的外部服務。

但當整合測試和單元測試在同一個 Vitest 進程中執行時，麻煩就來了。整合測試會無聲地沿用被覆蓋的假金鑰，而 `process.env.API_KEY` 會顯示類似 `sk-ant-test-api-key-12345` 這樣的虛假值，而不是你期望的真實金鑰。結果，所有嘗試使用真實 API 的測試都會因為認證失敗而崩潰。

常見的症狀包括：

- 第一個使用 runner 且關鍵字相符的測試通過；第二個直接呼叫 API 的測試卻以 401 錯誤失敗
- `process.env.API_KEY` 顯示的是測試用的假金鑰，而不是真實的金鑰
- 因為看起來都和認證有關，所以很容易誤以為是 SDK 版本不相容、瀏覽器偵測邏輯有誤，或是某個 adapter 的設定問題

## 跳過 process.env，直接讀取環境檔案

解決方案很直接：不要信任 `process.env`，而是直接從環境檔案讀取真實的 API 金鑰。這樣就能繞過 `setup.ts` 的覆蓋：

```typescript
function readEnvFromShared(key: string): string | null {
  try {
    const envContent = readFileSync(resolve(__dirname, '../../../../.env.shared'), 'utf-8')
    const match = envContent.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return match?.[1]?.trim() ?? null
  } catch {
    return null
  }
}

const REAL_API_KEY = readEnvFromShared('ANTHROPIC_API_KEY')

describe.skipIf(!REAL_API_KEY)('real API tests', () => {
  // 在這裡使用 REAL_API_KEY，而不是 process.env.ANTHROPIC_API_KEY
  test('should call Anthropic API successfully', async () => {
    const client = new Anthropic({ apiKey: REAL_API_KEY })
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Hello' }],
    })
    expect(response.content).toBeDefined()
  })
})
```

這個做法有幾個優勢：

1. **清晰的意圖**：直接從 `.env.shared` 讀取，讓後續維護者立即明白這些是真實的、不被覆蓋的金鑰
2. **自動跳過**：如果金鑰不存在（例如在 CI 環境或開發者沒有 `.env.shared` 檔案的機器上），`describe.skipIf()` 會自動跳過這些測試，避免偽陽性失敗
3. **隔離單元測試和整合測試**：單元測試仍然使用被覆蓋的環境，整合測試則使用真實的金鑰，兩者互不干擾

## 什麼時候該用這個方案

這個方案特別適合以下情況：

- **整合測試呼叫真實的外部 API**：包括 LLM 服務（Anthropic、OpenAI）、支付系統、或任何第三方 API
- **你的專案有 `tests/setup.ts` 來覆蓋環境變數**：特別是為了保護單元測試的完整性
- **你在調試看似應該成功的 API 呼叫，卻一直收到 401 或 403 錯誤**：這往往暗示著你正在用被覆蓋的虛假金鑰

總之，別讓設定檔的聰明設計反而成為測試的絆腳石。有時候，最直接的方法——讀取真實的檔案——往往是最可靠的。
