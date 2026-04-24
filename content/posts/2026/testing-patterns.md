---
title: 'Vitest 與 Playwright 測試模式彙整'
publishedAt: '2026-03-29T20:37:00+08:00'
status: 'published'
slug: 'testing-patterns'
tags:
  - testing-quality
  - vitest
  - playwright
  - testing
---

在設置測試基礎設施時，許多開發者會遇到一些微妙的陷阱。無論是 Vitest 的命令混淆、Playwright 的斷言誤區，還是 mock 資料格式不匹配，這些問題往往在看似完成的測試中悄悄隱藏。本文彙整我在實踐中遇到的關鍵測試模式，希望能幫助你避免常見的坑。

## Vitest 的命令區分

最容易犯的第一個錯誤，就是混淆 `bun run test` 和 `bun test`。前者調用 Vitest 框架，後者是 Bun 內建的測試運行器，兩者的行為完全不同。當你在 package.json 配置了 Vitest，務必使用 `bun run test` 來執行測試。

除此之外，Vitest 提供了兩種清理方式，用途各異：

- `vi.clearAllMocks()` 只清除 mock 的呼叫記錄，模組狀態保持不變
- `vi.resetModules()` 重置整個模組的緩存

當測試涉及環境變數時，應該使用 `vi.resetModules()` 以確保每個測試都從乾淨的模組狀態開始。

## 測試完成的紀律

「完成」不是一個模糊的概念。在聲稱測試完成前，必須滿足三個條件：

```bash
bun run test       # 所有單元測試和整合測試通過
bun run typecheck  # TypeScript 無型別錯誤
bun run lint       # ESLint 無風格問題
```

這三個檢查不是可選的裝飾，而是程式碼品質的護欄。任何一項失敗都代表工作未完成。

## Playwright 與 Vitest 的共存

當你在同一個專案中同時使用 Playwright E2E 測試和 Vitest 單元測試時，ESLint 會產生衝突。Playwright 使用 `use(page)` 句法來注入測試上下文，但 `react-hooks/rules-of-hooks` 規則會把它誤判為違反 hook 規則。

解決方案是安裝 `eslint-plugin-playwright` 並在 ESLint 配置中針對 E2E 測試目錄關閉 React hooks 檢查，同時保留其他規則的保護。

同時，vitest.config.ts 必須明確排除 E2E 測試目錄：

```typescript
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
})
```

注意不要用 `exclude: ['tests/e2e/**']` 直接覆蓋預設值，這樣會丟失其他重要的排除規則。

## Playwright Assertion 的隱藏陷阱

Playwright 的斷言看似簡單，但有幾個容易踩到的地雷：

**吞掉失敗的 `.catch()`** — 如果你寫了 `expect(x).toBeVisible().catch(() => {})` 來處理可能失敗的情況，結果是斷言的失敗被默默吞掉，測試永遠不會失敗。正確做法是分開處理邏輯和斷言。

**可見性斷言的習慣用語** — `not.toBeVisible()` 在技術上正確，但語義上 `toBeHidden()` 更清晰，避免了雙重否定的認知負擔。

**缺少必要的斷言** — Playwright 的 ESLint 外掛 `playwright/expect-expect` 會檢查每個 test 是否至少有一個斷言。沒有斷言的測試形同虛設。

**非同步 matcher 必須 await** — `expect().toHaveClass()` 等非同步 matcher 返回 Promise，必須使用 `await`。`playwright/missing-playwright-await` 規則會自動檢查這一點。

## Mock 資料格式必須匹配 API 型別

一個常見的運行時崩潰來自於 mock 資料格式與實際 API 回傳型別不一致。比如 API 返回 `{ taiex: {...}, otc: {...} }` 的物件結構，但你的 mock 返回了 `[{...}]` 的陣列，那麼在存取 mock 資料時就會出現 `undefined.name` 的崩潰。

寫 mock 前的最佳實踐是先讀 API route handler 的回傳型別定義，或者從 TypeScript 型別定義反推 mock 的結構。這樣可以避免測試通過但實際程式碼崩潰的尷尬局面。

## useSyncExternalStore 的 Snapshot 穩定性

`useSyncExternalStore` hook 要求 `getSnapshot` 回傳的值在邏輯上不變時，物件引用也必須保持不變（使用 `Object.is()` 比較）。如果你每次都返回新物件，React 會認為狀態改變，導致無限重新渲染，最終拋出「Maximum update depth exceeded」錯誤。

解決方案是快取原始字串和解析後的結果，只在原始字串改變時才創建新物件：

```typescript
let cachedRaw = null
let cachedParsed = null

function getSnapshot() {
  const raw = externalStore.get()
  if (raw !== cachedRaw) {
    cachedRaw = raw
    cachedParsed = JSON.parse(raw) // 新物件
  }
  return cachedParsed // 返回快取的物件引用
}
```

## $transaction 與 Race Condition

Prisma 中先檢查再建立的模式有 race condition 風險。當兩個並行請求同時通過計數檢查，它們都可能執行 create 操作，導致超過預期的上限。

正確做法是將整個邏輯包在 `prisma.$transaction()` 內，確保計數和建立是原子操作：

```typescript
await prisma.$transaction(async (tx) => {
  const count = await tx.model.count({ where: {...} });
  if (count < limit) {
    await tx.model.create({...});
  }
});
```

## $transaction 的 Mock 模式

當程式碼改用 `prisma.$transaction(async (tx) => {...})` 後，測試必須配合修改 mock。簡單地 mock `prisma.model.method` 在 transaction 內不會被呼叫，因為實際呼叫的是 `tx.model.method`。

正確的 mock 模式是：

```typescript
const mockTx = {
  model: {
    count: vi.fn().mockResolvedValue(5),
    create: vi.fn(),
  },
}

vi.mocked(prisma.$transaction).mockImplementation(async (cb) => cb(mockTx))
```

在 callback 內部，code 會接收 `tx` 物件，因此 mock 的應該是 `tx.model` 的方法。

## vi.hoisted 與 class mock 的 SDK 建構子模式

當你需要 mock 需要用 `new` 關鍵字建構的 SDK 類（如 OpenAI、Cohere）時，Vitest 的 hoist 機制會造成微妙的時序問題。

`vi.mock()` 被 Vitest 提升到模組頂部，早於其他程式碼執行。如果你在 mock factory 外定義 mock 函式，該函式在 hoist 時尚未初始化，導致不可靠的行為。

**正確方案** — 使用 `vi.hoisted()` 確保 mock 物件在 factory 前可用：

```typescript
const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockCreate } }
  },
}))
```

這樣 `new MockOpenAI()` 就能正確存取 `mockCreate`。每個測試可以用 `mockCreate.mockResolvedValueOnce()` 配置不同的回傳值。

**避免的做法** — 不要在 vi.mock factory 內用 `vi.fn().mockImplementation()` 偽造建構子，這種模式在 `new` 時的行為不可靠。

---

這些模式累積自實戰中的多次踩坑。遵循它們不會讓你的測試變成藝術品，但會大幅減少那些「測試通過卻產品崩潰」的驚嚇時刻。
