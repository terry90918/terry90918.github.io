---
title: '安全的錯誤處理：不洩漏內部資訊'
publishedAt: '2026-03-20T11:02:00+08:00'
status: 'published'
slug: 'security-error-handling'
tags:
  - security-error-handling
  - security
  - error-handling
  - api
---

許多開發者在實現錯誤處理時會犯一個常見的錯誤——過度隱藏錯誤訊息。但其實，真正的安全錯誤處理不是靜默吞掉錯誤，而是以對的方式，在對的地方，向對的人揭露對的資訊。

## 在正式環境中隱藏技術細節

寫法上看似簡單，但細節很關鍵：

```typescript
// ❌ 錯誤做法
if (process.env.NODE_ENV !== 'development') {
  // 隱藏錯誤訊息
}

// ✅ 正確做法
if (process.env.NODE_ENV === 'production') {
  // 隱藏錯誤訊息
}
```

為什麼要區分？因為在測試環境（`test`）中，我們同樣需要看到真實的錯誤，以便快速定位問題。用 `!== "development"` 會把測試環境也涵蓋進去，這樣在執行測試套件時，錯誤訊息會被隱藏，反而增加除錯難度。

前端部分，不要直接向使用者暴露後端的技術棧細節。建立一個 `toUserFriendlyError()` 函數，將系統層的錯誤映射成人類可以理解的訊息：

```typescript
function toUserFriendlyError(error: Error): string {
  // 內部：詳細的技術訊息，用於日誌記錄
  console.error('[Internal]', error.message)

  // 外部：簡潔、安全的訊息
  return '發生了一個錯誤，請稍後重試'
}
```

## 根據 HTTP 狀態碼分類錯誤

不同的錯誤需要不同的使用者訊息和重試策略。相同的「請重試」訊息不適合所有場景：

```typescript
const API_ERROR_MESSAGES = {
  429: {
    message: '請求過於頻繁，請稍後再試',
    retryable: true,
    suggestedDelay: 5000, // 5 秒後重試
  },
  500: {
    message: '服務暫時不可用，我們正在處理此問題',
    retryable: true,
    suggestedDelay: 30000, // 30 秒後重試
  },
  503: {
    message: '服務維護中，請稍後造訪',
    retryable: true,
    suggestedDelay: 60000, // 1 分鐘後重試
  },
}
```

429（Rate Limit）代表用戶請求太頻繁，應該用指數退避策略；而 500+（Server Error）代表伺服器出了問題，應該給使用者一個友善的訊息，並在後端記錄詳細日誌。

## 消毒內容：替換而非刪除

當發現敏感資訊進入日誌或錯誤堆棧時，直覺做法是把它刪掉。但這樣反而會失去除錯的線索：

```typescript
// ❌ 直接刪除
function sanitize(str: string): string {
  return str.replace(/password=\w+/g, '')
}
// 日誌變成：URL 是 "https://api.example.com?password=XXX"，
// 但我們不知道原本有多長，這會讓除錯變複雜

// ✅ 替換成佔位符
function sanitize(str: string): string {
  return str.replace(/password=\w+/g, 'password=[REDACTED]')
}
// 日誌變成：URL 是 "https://api.example.com?password=[REDACTED]"，
// 一目瞭然，而且方便安全審計
```

同時，正規化空白時要保留換行符，方便檢視結構化的日誌：

```typescript
const WHITESPACE_PATTERN = /[^\S\n]+/g // 保留 \n，替換其他空白
message = message.replace(WHITESPACE_PATTERN, ' ')
```

## 正規表達式的隱藏陷阱

帶有 `g`（global）flag 的正規表達式會有一個難以察覺的問題——`test()` 方法會改變 `lastIndex` 的位置：

```typescript
const pattern = /error/g

// 第一次呼叫
pattern.test('error occurred') // true，lastIndex 現在是 5
pattern.test('error occurred') // false！（從位置 5 開始找，找不到）

// ✅ 正確做法：使用前重設
pattern.lastIndex = 0
pattern.test('error occurred') // true
pattern.lastIndex = 0
pattern.test('error occurred') // true
```

這個 bug 很難追蹤，因為第一次呼叫會成功，後續呼叫卻莫名失敗。如果在迴圈中使用同一個 `g` flag regex，就會出現間歇性的匹配失敗。

## 安全地截斷字串

表情符號和 CJK 字元用多個 code unit 表示。用 `String.slice()` 直接截斷可能會切斷表情符號，留下無法顯示的碎片：

```typescript
const text = '你好😀世界'

// ❌ 錯誤做法
text.slice(0, 4) // '你好😀' 會變成 '你好?' 或亂碼

// ✅ 正確做法
Array.from(text).slice(0, 4).join('')
// Array.from() 會按 Unicode code point 分割，
// 所以 emoji 被視為單一字元，不會被切斷
```

## 非同步操作的 try-catch 嵌套

使用流式 API（如 Fetch 的 `ReadableStream`）時，必須確保 cleanup 操作（例如 `controller.close()`）一定會被執行：

```typescript
async function fetchStream() {
  const controller = new AbortController()

  try {
    const response = await fetch(url, { signal: controller.signal })
    try {
      const reader = response.body?.getReader()
      // 處理串流...
    } finally {
      reader?.cancel()
    }
  } finally {
    controller.abort() // 一定會執行，即使上面發生例外
  }
}
```

每一層操作都有自己的 `try-finally` 確保對應的 cleanup 不會被跳過。

## API 重排驗證：三層檢查

當客戶端發送一個 ID 陣列來重排資料時，別只檢查陣列是否存在。需要三個驗證步驟：

```typescript
function validateReorderIds(ids: string[], dbItems: Item[]): boolean {
  // 1️⃣ 無重複 ID
  if (new Set(ids).size !== ids.length) {
    throw new Error('包含重複的 ID')
  }

  // 2️⃣ 所有 ID 都存在於資料庫
  const dbIds = new Set(dbItems.map((item) => item.id))
  for (const id of ids) {
    if (!dbIds.has(id)) {
      throw new Error(`ID ${id} 不存在`)
    }
  }

  // 3️⃣ 完整集合（不能多也不能少）
  if (ids.length !== dbItems.length) {
    throw new Error(`提供 ${ids.length} 個 ID，但資料庫有 ${dbItems.length} 項目`)
  }

  return true
}
```

如果漏掉任何一項檢查，某些項目可能會「無聲地消失」——它們不在新的 ID 陣列中，最終被從資料庫中刪除或遺漏。

## 環境變數範本不能包含真實密碼

`.env.example` 是檢入版本控制的範本檔案，所有開發者和 CI/CD 都可以看到。千萬不要在裡面放真實的密碼：

```bash
# ❌ 危險
DATABASE_URL=postgresql://user:real_password_123@db.example.com/proddb

# ✅ 安全
DATABASE_URL=postgresql://user:password@localhost/mydb
```

即使後來在 git 歷史中刪除了真實密碼，有經驗的攻擊者仍然可以檢視舊版本找到它。一旦洩露，密碼應該立即輪換，並排查是否有未授權的存取記錄。

---

安全的錯誤處理不是隱藏所有訊息，而是在正確的層級揭露正確的資訊。向使用者展示友善的訊息，同時在伺服器端記錄詳細日誌供除錯之用。這樣既保護了系統的安全性，又不犧牲可維護性。
