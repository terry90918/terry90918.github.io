---
title: 'Dev Mock 分支紀律：測試環境隔離'
publishedAt: '2026-04-22T16:43:00+08:00'
status: 'published'
slug: 'dev-mock-branch-discipline'
tags:
  - testing-quality
  - testing
  - mocking
  - git
  - branch
---

在開發 JurisLM 或其他採用 dev-mock + real DB 雙路徑架構的 Next.js 應用時，有一個隱形的陷阱特別容易踩到：當你新增任何會打 Database 的 query、API 或 source detail fetcher 時，一不小心就會在開發環境裡炸鍋。

## 隱形的測試環境差異

JurisLM 在 `NODE_ENV !== "production"` 時預設走 `lib/dev-mock/store.ts` 的 in-memory Map，完全不連接真實的 Database。這個設計很聰明——開發時無須調整密碼或連線字串，點開 UI 立刻能看到 mock 數據。但代價是什麼呢？一旦新增了 DB 操作卻忘了加 `if (isMockMode()) return mockXxx(...)` 的分支，問題就會浮現：

**GET 請求**會導整頁 500，因為 postgres 連線失敗或回傳空陣列。  
**POST/PATCH/DELETE 請求**會報 404 或 422，因為 mock store 裡沒有對應的 row。  
**Source page 像 `/sources/[type]/[id]`** 會觸發 `notFound()`，整個頁面變成 404。  
而最狡猾的部分是：**單元測試用 `vi.mock` 假造 DB 時，測試會過**。你看著綠燈心想一切安好，實際上打開瀏覽器點 UI 時，開發伺服器已經在崩潰邊緣。

我在這個 session 內就連續踩了四次坑：

- `updateConversationByUuid` 無 mock 分支 → 重命名對話的 PATCH 請求回傳 404
- `deleteConversationByUuid` 同樣缺少 mock 分支 → 刪除對話的 DELETE 請求回傳 404
- `getLawDetail` 只查真 DB 且強制 numeric id → source page 全部 404
- `getJudgmentDetail` 同樣問題

## 防禦性設計：雙路徑模式

解決方案其實很直接，但需要紀律：**新增 DB query 時立刻實作雙路徑**。

首先在你的 query 函式最頂端檢查 mock mode：

```typescript
// lib/db/xxx-queries.ts
import { isMockMode } from "@/lib/dev-mock/store";

export async function updateXxxByUuid(uuid: string, userId: string, patch: Partial<Xxx>) {
  if (isMockMode()) {
    return mockUpdateXxxByUuid(uuid, userId, patch);  // ← 必須同步 export from store.ts
  }
  // Real DB path
  const result = await db.update(xxx).set(patch).where(...).returning();
  return result[0] ?? null;
}
```

同時在 `lib/dev-mock/store.ts` export 對應的 mock helper：

```typescript
export function mockUpdateXxxByUuid(uuid: string, userId: string, patch: Partial<MockXxx>) {
  const row = state.xxxByUuid.get(uuid)
  if (!row || row.userId !== userId) return null
  // 也要模擬 CASCADE：若刪 conversation 要一併清 messages + shares
  return applyPatch(row, patch)
}
```

這裡最重要的細節是：**mock 的邏輯也要模擬真 DB 的行為**。如果真 DB 在刪除 conversation 時會級聯刪除 messages 和 shares，mock 版本也必須做同樣的事，否則 UI 會看到不一致的狀態。

建立新 query 時可以用這份檢查清單：

1. ✅ 函式第一行有 `if (isMockMode()) return mockXxx(...)`
2. ✅ `lib/dev-mock/store.ts` 有對應的 `mockXxx` export
3. ✅ Mock helper 模擬 FK CASCADE（例如刪 conversation 時也清 messages、shares、bookmarks）
4. ✅ `__resetMockStore()` 函式中的 `state.xxx.clear()` 有處理新欄位
5. ✅ Mock 回傳的型別與真 DB row 一致（用 `as unknown as Xxx` 轉型是允許的，但要加註解說明）

## 實戰案例：Source Detail 的特殊情況

我在這個 session 修正的 commit 中，其中一個有趣的例子是處理 source detail。這類 query 通常有個特殊問題：ID 可能既可以是數字形式的 embedding_id，也可以是使用者看到的 title 字串。

```typescript
export async function getLawDetail(id: string): Promise<LawSourceDetail | null> {
  if (isMockMode()) return mockLawDetail(id);  // Mock 接受任意字串

  const embeddingId = Number.parseInt(id, 10);
  if (Number.isNaN(embeddingId)) return null;   // Real DB 只接 numeric
  // ...query real DB
}

function mockLawDetail(id: string): LawSourceDetail {
  const decoded = decodeURIComponent(id);
  const preset = { "民法 第 184 條": { ... }, ... };
  return preset[decoded] ?? fallbackFixture(decoded);
}
```

注意這裡的分歧：真 DB 只能用 numeric ID 查詢，所以無法找到字串形式的項目時回傳 `null`。但 mock 版本可以更寬鬆——它接受字串，並從預設 fixture 中尋找或生成回傳值。這樣開發時測試各種 source 會輕鬆得多，同時也確保了型別檢查的一致性。

## 何時需要這個模式

**必須使用的場景：**

在 JurisLM `entire_app/` 內新增或修改 `lib/db/*-queries.ts` 的任何 async 函式。
新增 `/api/[...]` route 的 server handler 會呼叫 Database。
新增 `lib/sources/get-source-detail.ts` 這類的讀取 path。
當 Playwright E2E 測試通過但你手動點 UI 卻看到 404 或 500 時，第一時間就應該懷疑是 mock 分支漏寫。

**需要警惕的紅旗：**

單元測試用 `vi.mock("@/lib/db")` 後會完全蒙蔽 mock 分支的缺失——綠燈測試根本保證不了開發伺服器能動。你必須真的打開瀏覽器測試一遍。

「Next.js 熱重載後 bug 還在」這種情況，有時候不是代碼問題，而是 `globalThis.__jurislmDevMockStore` 缺少新欄位。此時需要**完整重啟 dev server**，讓 globalThis 重新初始化——熱重載無法解決這類全域狀態的問題。

驗收時務必實際 `fetch(url)` 檢查 HTTP 狀態碼，不能只看 `<a href>` 存在就假設沒問題。在這個 session 中，用戶質疑「你確定真的可以點擊到資訊了嗎？」才讓我抓到四個 source 都回傳 404 的問題。

**可以跳過的場景：**

`/api/public/*` 這類公開 API，通常採用混合模式。
純工具函式沒有 Database 調用。
測試 helper，因為它們本就在測試的上下文中。

---

這個紀律看起來繁瑣，但一旦內化成習慣，就能完全避免開發環境和單元測試綠燈、但實際點 UI 炸鍋的尷尬局面。每新增一個 query，花十秒鐘加上 mock 分支，勝過花十分鐘除錯「為什麼測試過但 UI 不通」。
