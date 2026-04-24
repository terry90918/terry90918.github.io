---
title: 'Monorepo 死代碼系統化清理流程'
publishedAt: '2026-03-29T14:10:00+08:00'
status: 'draft'
slug: 'monorepo-dead-code-cleanup'
tags:
  - testing-quality
  - monorepo
  - refactoring
  - dead-code
---

在大型 TypeScript Monorepo 中，隨著時間推移，死代碼會不斷累積：未使用的檔案、孤立的依賴、重複的函數、不必要的匯出。手動識別這些問題既容易出錯又耗時，系統化的清理流程能大幅提高效率和安全性。

## 識別問題的根源

死代碼在 Monorepo 環境中尤其難以管理，因為：

- 未使用的檔案可能隱藏在多個 Package 中
- 依賴間的複雜引用關係容易掩蓋真正的孤立依賴
- 重複的工具函數分散在不同工作空間，難以統一
- 過度匯出的類型和函數增加了 API 複雜性

## 系統化清理的五階段流程

### 第一階段：檢測

使用兩個專門工具完成初步掃描：

```bash
# 檢測未使用的檔案、依賴和匯出
npx knip --no-progress

# 檢測重複代碼（務必排除 node_modules）
npx jscpd --min-lines 8 --min-tokens 50 \
  --ignore "**/{node_modules,dist,.next}/**" \
  --format "typescript,tsx" \
  src/ packages/
```

**關鍵坑點**：jscpd 如果沒有設定 `--ignore node_modules`，會報告來自巢狀工作空間依賴的數千個誤報。另外，knip 對某些檔案的檢測可能存在誤判：

- 根目錄的 `eslint.config.js`（被 lint-staged 使用）
- `bun-types`（在 tsconfig 的 `types` 欄位中引用）
- `@vitest/coverage-v8`（被 test:coverage 指令使用）
- `lint-staged`（被 .husky/pre-commit hook 使用）

這些通常會被 knip 誤報為未使用，實際上它們都有明確的用途。

### 第二階段：分類風險等級

並非所有死代碼都該以相同方式處理。根據風險程度，我們可以將檢測結果分為三個等級：

| 等級     | 典型例子                                 | 處理方式             |
| -------- | ---------------------------------------- | -------------------- |
| **安全** | 未使用的檔案、未使用的依賴、測試輔助函數 | 可以自信地刪除       |
| **謹慎** | 組件、API Route、重新匯出的模組          | 需驗證是否有動態導入 |
| **危險** | 設定檔案、入口點、CLI 命令               | 觸碰前必須深入調查   |

這個分類能幫助我們優先處理低風險項目，逐步建立信心。

### 第三階段：安全刪除迴圈

執行安全刪除的最佳實踐是建立一個可復原的迴圈：

1. 建立測試基線（記錄當前通過的測試數量）
2. 並行刪除安全類的項目（使用多個代理分別處理檔案和依賴）
3. 執行完整測試套件
4. 如果測試失敗 → 復原並跳過該項目

這個迴圈能確保即使某個刪除導致問題，我們也能快速復原而不影響整個流程。

### 第四階段：重複代碼整合

當 jscpd 報告重複代碼時，優先級應該是：

**第一優先：跨 Package 的重複**
比如某個 Package 中的 `auth.ts` 與 `@entire/auth` 重複，應該改用代理模式，統一指向中央實現：

```typescript
// packages/worker/src/auth.ts（刪除）
export const authenticate = (...) => { ... }

// packages/worker/src/index.ts（改用重新匯出）
export { authenticate } from '@entire/auth'
```

**第二優先：跨檔案的輔助函數**
比如 `findEmbedDirs()` 在三個 Worker 中都出現，應該提取到共享工具庫：

```typescript
// lib/embed-helpers.ts（新建）
export function findEmbedDirs(path: string) { ... }

// packages/worker-{1,2,3}/src/index.ts（改用導入）
import { findEmbedDirs } from '@entire/lib/embed-helpers'
```

**第三優先：檔案內的重複**
只有在重複的代碼超過 15 行且出現 3 次以上時，才值得提取為本地輔助函數。

**跳過 JSX 結構重複**
React 中的結構性重複（少於 10 行，出現 2 次）是正常模式，不值得抽象化。過度抽象會損害可讀性。

### 第五階段：匯出精簡

這個階段分為三個子步驟，應該按順序進行：

**子步驟 1：移除未使用的重新匯出**
在 `index.ts` 檔案中移除無人引用的重新匯出（最安全，不改變行為）：

```typescript
// 移除前
export { Foo } from './foo'
export { Bar } from './bar'
export { Baz } from './baz'

// 移除後（只保留被使用的）
export { Foo } from './foo'
export { Bar } from './bar'
```

**子步驟 2：移除內部函數的 `export` 關鍵字**
將模組內部的函數和類型改為非匯出（`export function` → `function`）：

```typescript
// 改變前
export function internalHelper() { ... }

// 改變後
function internalHelper() { ... }
```

**子步驟 3：刪除真正的死代碼**
刪除那些僅僅因為 `noUnusedLocals` 檢查而保持匯出的函數。

**重要坑點**：有些測試會透過字符串搜尋檢查代碼（例如 `source.indexOf("export type Foo")`），當你移除 `export` 關鍵字時這些測試會失敗。修復方式是更新測試，使其能匹配沒有 `export` 的版本。

另一個微妙的問題：當介面作為函數參數類型使用時，移除 `export` 可能導致 `noUnusedLocals` 錯誤（如果該介面只在本地使用）。這通常表示該介面是作為繞過 lint 檢查的變通而保持匯出的。解決方案是要麼保留匯出，要麼完全刪除該死介面。

## 什麼時候進行這個流程

- **定期維護**：每季度進行一次，保持代碼庫整潔
- **主版本發布前**：清理死代碼能簡化 API 表面
- **構建性能惡化時**：死代碼可能是構建變慢或包體積增大的隱藏原因
- **大型 Feature 分支合併後**：多次合併容易遺留孤立的代碼片段

通過系統化的流程，Monorepo 的死代碼問題不再是被動應對，而是主動管理的過程。
