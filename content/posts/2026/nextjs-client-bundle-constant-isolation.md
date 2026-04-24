---
title: 'Next.js Client Bundle 常數隔離技巧'
publishedAt: '2026-04-17T20:56:00+08:00'
status: 'draft'
slug: 'nextjs-client-bundle-constant-isolation'
tags:
  - business-logic-algorithms
  - nextjs
  - bundle
  - optimization
---

當你在 Next.js 項目中使用 Client Component，同時需要引用定義在 server-only 模組（例如包含 Prisma 或資料庫連線的檔案）中的常數時，很容易遇到這樣的 build 失敗：

```
Module not found: Can't resolve 'pg'
```

或是其他 Node.js-only 模組找不到的錯誤。這個問題的根源在於 import chain——Client Component 透過某個工具函式引入了 Prisma，而 Prisma 又依賴 Node.js 才能執行的套件。有趣的是，本地開發時 `bun dev` 可能不會報錯（因為編譯是 lazy 的），但 `bun build` 或 `next build` 時就會真正失敗。

## 根本原因

Next.js 的打包流程會嚴格追蹤所有 import，對於 Client Component，它不允許引入任何 Node.js-only 的依賴。當你的 Client Component 間接引入了 server-only 模組時，bundler 就會抗議。

## 解決方案的核心想法

答案很簡單：**把那些 Client Component 真正需要的部分（通常只是常數、設定物件或型別）單獨提取出來**。

建立一個新的檔案，其中：

1. 不包含任何 server-only 的 import（沒有 Prisma、沒有 `fs`、沒有資料庫連線）
2. 只包含 Client Component 會用到的常數或型別
3. 原來的 server-only 模組從這個新檔案重新 export，保持 API 相容性

## 實戰範例

假設你有一個 `tools.ts` 模組，裡面同時定義了常數和非同步函式：

```typescript
// ❌ tools.ts（server-only，含 Prisma）
import { prisma } from '@/lib/prisma'

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  get_stock_price: '查詢股價',
  analyze_document: '文件分析',
}

export async function getStockPrice(symbol: string) {
  // 使用 prisma 查詢資料庫
  const result = await prisma.priceHistory.findFirst({ where: { symbol } })
  return result
}
```

你的 Client Component 其實只需要 `TOOL_DISPLAY_NAMES`：

```typescript
// ❌ ClientComponent.tsx（會導致 build 失敗）
'use client';

import { TOOL_DISPLAY_NAMES } from '@/lib/ai-assistant/tools';

export default function ToolList() {
  return (
    <ul>
      {Object.entries(TOOL_DISPLAY_NAMES).map(([key, label]) => (
        <li key={key}>{label}</li>
      ))}
    </ul>
  );
}
```

修正方式是將常數提取出來：

```typescript
// ✅ tool-display-names.ts（client-safe，完全無依賴）
export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  get_stock_price: '查詢股價',
  analyze_document: '文件分析',
}
```

然後更新原來的 `tools.ts`：

```typescript
// ✅ tools.ts（re-export 保持向下相容）
import { prisma } from '@/lib/prisma'

// 從新檔案 re-export，保持 server 端使用者無感
export { TOOL_DISPLAY_NAMES } from './tool-display-names'

export async function getStockPrice(symbol: string) {
  const result = await prisma.priceHistory.findFirst({ where: { symbol } })
  return result
}
```

現在 Client Component 可以直接 import 新的獨立檔案：

```typescript
// ✅ ClientComponent.tsx（build 成功）
'use client';

import { TOOL_DISPLAY_NAMES } from '@/lib/ai-assistant/tool-display-names';

export default function ToolList() {
  return (
    <ul>
      {Object.entries(TOOL_DISPLAY_NAMES).map(([key, label]) => (
        <li key={key}>{label}</li>
      ))}
    </ul>
  );
}
```

因為 `tool-display-names.ts` 沒有任何 import，bundler 不會嘗試拉入 Prisma 或其他 Node.js-only 的模組。

## 何時使用這個技巧

遇到以下 build 錯誤訊息時：

- `Can't resolve 'pg'`（PostgreSQL driver）
- `Can't resolve '@prisma/client'`
- `Can't resolve 'fs'`、`'net'`、`'tls'`（Node.js built-in）
- 任何標記為 `server-only` 的套件拉不進來

且錯誤來自 Client Component 或其他前端 entry point。

## 診斷步驟

如果不確定是否需要這個模式，可以按照以下步驟：

1. **檢查 build 錯誤訊息** — 確認包含 Node.js-only 模組的名稱（如上列表）
2. **尋找 import 來源** — 使用 `grep -r "import.*tools" src/components/` 找出哪些 Client Component 引用了問題模組
3. **分析實際使用** — 這些 Client Component 到底從該模組用了什麼？通常只是常數或型別
4. **提取常數** — 將被使用的部分移至新的 client-safe 檔案

## 小提示

- 新檔案的命名約定可以用 `<original>-constants.ts`、`<feature>-display-names.ts` 或類似的清楚命名
- 在 server-only 模組中保留 re-export 很重要，這樣 server 端的程式碼不需要改動（保持向下相容）
- 如果常數只是依賴型別定義（沒有 runtime 依賴），也可以安全地用 `import type` 來引入

這個模式看似簡單，但在大型專案中非常實用，能快速解決「我只是想用一個常數，為什麼 bundle 進了整個資料庫驅動」的困境。
