---
title: 'OpenAI Batch API 檔案大小限制與分批策略'
publishedAt: '2026-04-01T21:21:00+08:00'
status: 'draft'
slug: 'openai-batch-api-file-size-limit'
tags:
  - business-logic-algorithms
  - openai
  - batch-api
  - optimization
---

OpenAI Batch API 提供了大規模批量處理嵌入向量的能力，但它有一個往往被忽視的隱性限制：輸入檔案不能超過 200MB。如果你正在處理大量文本資料（例如我最近處理的 2,600 萬筆司法文件片段），這個限制會成為一個需要認真對待的問題。

## 為什麼默默失敗最危險

Batch API 會在提交時接受你的請求，呼叫看似成功，但約 1 分鐘後才會失敗。此時所有批次中的項目都會被丟棄，這意味著你無法立即察覺問題所在。更糟的是，錯誤訊息是 `maximum_input_file_size_exceeded`，而你可能根本沒想到檔案大小會是問題——因為你的估算通常是錯的。

## 中文和多位元組字元的陷阱

這裡的關鍵在於對文本大小的測量方式。大多數開發者會用 `LENGTH()` 函數，特別是在 PostgreSQL 中：

```sql
SELECT LENGTH(chunk_text) FROM documents;
```

但這個方法完全不適用於包含中文、阿拉伯文或其他多位元組字元的內容。`LENGTH()` 統計的是 Unicode 字元數量，例如 500 個字元。但實際的 UTF-8 位元組數卻遠更大——一個中文字元等於 3 個位元組。

想像一批 50,000 個文件片段，每個平均 3,500 個中文字元：

- **幼稚的估計**：50K × 500 字 = 25MB ✓（看起來安全）
- **實際大小**：50K × 1,500 位元組 × 3（JSON 額外開銷）≈ 540MB ✗（遠超 200MB）

這種差異足以讓你的批次反覆失敗。

## 正確的測量方法

要解決這個問題，我採用了三步驟的方法。

**第一步：在 PostgreSQL 中測量實際位元組分佈**

```sql
SELECT
  percentile_cont(0.50) WITHIN GROUP (ORDER BY OCTET_LENGTH(chunk_text)) AS p50,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY OCTET_LENGTH(chunk_text)) AS p95,
  MAX(OCTET_LENGTH(chunk_text)) AS max_bytes
FROM document_embeddings_051
WHERE embedding IS NULL
LIMIT 100000;
```

注意這裡用的是 `OCTET_LENGTH()` 而不是 `LENGTH()`。`OCTET_LENGTH()` 才是你真正需要的——它計算的是實際的位元組數量。

**第二步：估計 JSONL 項目的大小**

Batch API 會將每個請求序列化為 JSONL 格式。每一行看起來像這樣：

```json
{
  "custom_id": "...",
  "method": "POST",
  "url": "/v1/embeddings",
  "body": { "model": "text-embedding-3-small", "input": "<text>" }
}
```

所以實際項目大小應該是：

```
項目位元組 ≈ 文本的 OCTET_LENGTH + 300 字節（JSON 封套開銷）
```

**第三步：計算安全的批次大小**

```
安全批次大小 = floor(200,000,000 / 最大項目位元組數) × 0.9
```

那個 0.9 乘數是 10% 的安全邊界，用來應對估計的偏差。

## 從真實資料得出的數字

我在司法文件片段（document_embeddings_051）上實施這個方法，得到了這些測量值：

- **中位數（p50）**：1,153 位元組
- **95 百分位數（p95）**：6,432 位元組
- **最大值**：10,830 位元組
- **加上 JSON 封套**：10,830 + 300 = 11,130 位元組

根據這些數字：

- 理論最大：floor(200,000,000 / 11,130) ≈ 17,970
- **安全批次大小**：**15,000**（應用了安全邊界）

相比之下，法律條文數據集（law_article_embeddings）要小得多：

- 平均：約 200 位元組
- 5,000 條文 × 500 位元組 = 2.5MB → **50,000 是安全的**

## 實踐建議

在設定 `batchSize` 參數之前，一定要進行這個測量。特別是在以下情況：

- 你的文本包含非 ASCII 字元（中文、阿拉伯文、emoji 等）
- 文本長度差異很大（法律文件、新聞文章、混合內容）
- 批次在提交後 1-2 分鐘內神祕地失敗，沒有明顯的用戶端錯誤

核心法則很簡單：**永遠測量 `OCTET_LENGTH`，永遠不要用 `LENGTH()`**，當你在為多位元組字元資料估計檔案大小時。

對於司法文本，使用 `batchSize=15000`。對於法律條文這樣的較小內容，`batchSize=50000` 是安全的。這樣的具體數字是基於測量而非猜測，會大大提高你的批次成功率。
