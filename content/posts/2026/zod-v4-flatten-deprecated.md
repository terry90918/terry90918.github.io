---
title: 'Zod v4 flatten() 棄用的遷移方式'
publishedAt: '2026-03-18T18:25:00+08:00'
status: 'draft'
slug: 'zod-v4-flatten-deprecated'
tags:
  - business-logic-algorithms
  - zod
  - typescript
  - migration
---

Zod 是一個廣泛使用的 TypeScript 模式驗證庫，而在最新的 v4 版本中，有一項重要的 API 變更值得注意：`.flatten()` 方法已被棄用。如果你正在升級或維護 Zod v4 專案，這篇文章將幫助你快速完成遷移。

## 問題：flatten() 不再被推薦

在使用 Zod 的 API 路由中，驗證失敗後通常需要將錯誤物件轉換成可序列化的格式。過去常見的做法是這樣寫的：

```typescript
const parsed = schema.safeParse(data)
if (!parsed.success) {
  const fieldErrors = parsed.error.flatten().fieldErrors
  // 處理欄位錯誤
}
```

在 Zod v4 中，這種方式會產生棄用警告，提示開發者使用新的 API。

## 新的方式：使用 z.flattenError()

Zod v4 提供了一個新的靜態函式 `z.flattenError()` 來替代執行個體方法。遷移非常簡單——只需將 `error.flatten()` 改為 `z.flattenError(error)`：

```typescript
// 舊方式（Zod v4 中已棄用）
parsed.error.flatten().fieldErrors

// 新方式
z.flattenError(parsed.error).fieldErrors
```

## 大規模遷移技巧

如果你的專案中有多個 API 路由需要更新，可以使用 `sed` 來批量替換。假設你的變數名是 `parsed`、`result` 或其他名稱，以下命令可以幫助你快速完成遷移：

```bash
find app/api -name "route.ts" -exec grep -l "\.flatten()" {} \; \
  | xargs sed -i '' 's/\([a-zA-Z]*\)\.error\.flatten()\.fieldErrors/z.flattenError(\1.error).fieldErrors/g'
```

這個命令會：

1. 在 `app/api` 目錄下找出所有包含 `.flatten()` 的 `route.ts` 檔案
2. 使用 `sed` 進行正則表達式替換，將舊的模式轉換為新的方式

## 驗證修改

完成替換後，建議驗證一下修改是否正確。你可以用以下 Node.js 程式碼快速測試：

```bash
node --input-type=module <<'EOF'
import { z } from '/path/to/node_modules/.bun/zod@x.x.x/node_modules/zod/index.js';
const r = z.object({ name: z.string() }).safeParse({});
if (!r.success) console.log(JSON.stringify(z.flattenError(r.error)));
EOF
```

## 何時需要進行這項遷移

當你在以下情況時，需要考慮進行 Zod v4 的 `flatten()` 遷移：

- **升級到 Zod v4**：如果你正在將現有專案升級到 Zod v4，會收到棄用警告
- **LSP 提示**：你的編輯器或語言伺服器在提示 `.flatten()` 已棄用
- **批次檢查**：執行 `grep -r "\.flatten()" app/` 發現多處使用

好消息是，這項遷移非常直接，不涉及複雜的邏輯改變，只是 API 的層級調整。花幾分鐘完成遷移，就能讓你的程式碼與最新版本保持同步，避免未來的相容性問題。
