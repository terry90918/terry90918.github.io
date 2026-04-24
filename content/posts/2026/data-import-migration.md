---
title: '資料匯入的 CSV 清理與 Migration Checksum'
publishedAt: '2026-03-21T11:23:00+08:00'
status: 'published'
slug: 'data-import-migration'
tags:
  - data-migration
  - csv
  - migration
  - postgresql
  - data-import
---

資料匯入看似直接，實際上隱藏了許多陷阱。從 CSV 清理、日期驗證、到資料庫遷移，每一步都可能導致批量操作失敗或資料損壞。我在處理過大規模資料匯入的專案中學到了這些教訓，希望能幫你避免踩坑。

## CSV 解析的防禦要領

外部資料的格式永遠不可信。第一步是清理 CRLF 換行符：

```typescript
const cleanText = text.replace(/\r/g, '')
```

接下來，放棄正則表達式解析。當你寫下 `/^\d{8}$/` 驗證欄位數量時，下一個資料來源已經改變了欄位結構。真正的做法是：

1. 先下載真實資料樣本，仔細觀察實際格式
2. 基於位置（position-based）而非結構假設來提取欄位
3. 寫完 parser 後，用 100% 真實資料進行完整匹配率驗證

這看起來有點保守，但它能救你數小時的 debug 時間。

## 日期驗證陷阱：格式不等於有效

字符串 `20210231` 通過了 `/^\d{8}$/` 的正則檢查，但 2 月沒有 31 日。如果你用 PostgreSQL 的 UNNEST 進行批次 INSERT，一筆壞日期會導致整批回滾。

正確的做法是驗證日期的實際有效性：

```typescript
function isValidDate(year: number, month: number, day: number): boolean {
  const maxDays = new Date(year, month, 0).getDate()
  return day <= maxDays
}
```

這利用了 JavaScript 的日期物件，自動處理閏年。在 INSERT 前，先過濾掉不合法的記錄並記錄跳過的數量：

```typescript
const validRecords = records.filter((r) => {
  if (!isValidDate(r.year, r.month, r.day)) {
    logger.warn(`Skipping invalid date: ${r.year}-${r.month}-${r.day}`)
    return false
  }
  return true
})
```

## Migration Checksum 的隱形炸彈

當你手動執行 `CREATE TABLE` 後，為了「同步」而補登到 migrations 表時，常見的錯誤是使用 MD5（32 字元），但系統期望 SHA256（64 字元）。結果是遷移系統永遠認為你的 migration 沒有執行過。

正確的流程永遠是：

1. 先建立 migration 檔
2. 執行 `db migrate`
3. 讓系統自動計算和記錄 checksum

如果已經出現不一致，補救方法是直接更新 migrations 表：

```sql
UPDATE migrations
SET checksum = '<64-character SHA256 hex>',
    sql_content = '<complete SQL>'
WHERE migration_name = '...'
```

## 用 pg_class 快速估計大表行數

當表有 21M+ 行時，`COUNT(*)` 可能耗時數十秒。更好的方案是查詢 PostgreSQL 的系統目錄：

```sql
SELECT reltuples::bigint FROM pg_class WHERE relname = $1
```

這會在毫秒內回傳結果。但要注意，如果表從未執行過 ANALYZE，`reltuples` 會返回 -1。此時先執行：

```sql
ANALYZE tablename
```

然後再查詢。

## PostgreSQL 陣列字面量的隱藏字符問題

使用 postgres.js 的 `sql.array()` 時，如果陣列元素包含括號或逗號（例如「民事委任狀（附委任狀）」），會破壞 PostgreSQL 的陣列字面量格式，導致 `malformed array literal` 錯誤。同時，同批次中重複的值會觸發 `ON CONFLICT DO UPDATE cannot affect row a second time`。

解決方案有兩種：

**方案一：改用逐筆 INSERT**
每筆記錄獨立一個 parameterized query，完全避免陣列格式問題。

**方案二：匯入前去重複**

```typescript
const seen = new Set()
const uniqueRecords = records.filter((r) => !seen.has(r.name) && seen.add(r.name))
```

對於大規模匯入，方案一更穩健，因為每筆都是獨立的資料庫事務。

## Bun 伺服器的逾時陷阱

Bun.serve 的預設 `idleTimeout` 是 10 秒。如果你的應用需要查詢遠端資料庫（例如雲端的 PostgreSQL），網路延遲可能導致連線在查詢完成前被斷開。設定足夠的超時時間：

```typescript
export default {
  serve: Bun.serve({
    // ...
    idleTimeout: 120, // 120 秒
  }),
}
```

特別是在處理資料匯入任務時，這個設定至關重要。

---

資料匯入的成功在於細節。每一個驗證步驟、每一個陷阱的迴避，都能讓你的系統更穩健。下次處理 CSV 或批次遷移時，記住這些模式——它們會幫你減少深夜的 debug 時間。
