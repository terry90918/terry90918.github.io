---
title: 'LLM Inline Citations 架構實作'
publishedAt: '2026-04-21T13:48:00+08:00'
status: 'draft'
slug: 'llm-inline-citations-architecture'
tags:
  - business-logic-algorithms
  - llm
  - citations
  - architecture
---

在構建 RAG 或 agent chat 產品時，一個常見的需求是讓大語言模型的回答中包含可點擊的引用 pills，例如 `[1]` `[2]`，使用者點擊後能回溯到原始資料來源。這個看似簡單的需求，其實涉及前端與後端的架構抉擇，而許多開發者在這一步踩過坑。

## 常見的錯誤方式

最直覺的解法是在前端用正規表達式掃描回應文本中的 `[n]` pattern，然後與 tool result 進行配對。然而這種做法有幾個致命缺陷：

1. **脆弱性高**：LLM 不總是遵守規則，有時會寫出 `[10]`，但實際上只有 3 筆來源，導致映射失敗
2. **無法還原來源類型**：正規表達式只能提取編號，無法知道這個引用指向的是法律條文、判例、還是網頁
3. **無法追蹤來源身份**：無法將編號回溯到具體的資料來源 ID

## 三家官方做法

讓我們看看 Perplexity、OpenAI 和 Anthropic 如何解決這個問題：

| 廠商           | 資料形狀                                                                                               | 編號發配時機                  |
| -------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------- |
| **Perplexity** | 在 prompt 中預先餵入編號化的上下文：`[1] <來源1>` `[2] <來源2>`                                        | 後端（組裝 prompt 時）        |
| **OpenAI**     | `message.content[0].text` + `annotations[]` 陣列，每個 annotation 帶有 URL、標題、以及文本中的字元位置 | 後端（回傳 annotations）      |
| **Anthropic**  | 將 `content[]` 分割成多個 blocks，cite block 附帶 `cited_text`、`document_index`、`start_char_index`   | 前端（遍歷 cite blocks 計數） |

這三家方案雖然形狀不同，但都遵循一個共同的設計哲學。

## 共同原則

1. **模型端約束**：LLM 必須看到「已編號的來源清單」或接收結構化的文件引用，不能任意生成編號
2. **前端拿結構化資料**：前端收到的永遠是「文字 + 結構化引用陣列」的組合，而不是純 markdown 文本
3. **編號映射來自後端**：`[n]` 只是渲染細節，但編號與實際來源的映射表必須由後端掌控

## 建議的混合方案

結合 MCP tool 架構的特性，這是一個適用於多數場景的實作模式：

**後端職責**：在處理 tool result 時，將所有結果依序編號，組成結構化的引用陣列

```typescript
const citations = toolResults.flatMap((result, i) =>
  result.items.map((item, j) => ({
    index: /* 跨越所有 results 的全序編號 */,
    type: item.kind, // "law" | "judgment" | "web"
    refId: item.id,
    sourceLabel: item.title,
    anchorStart?: item.charOffset,
    anchorEnd?: item.charOffset + item.length,
  }))
);
```

**Prompt 約束**：在系統提示中明確告訴 LLM「引用來源時在句尾加 `[n]`，n 與 tool result 的第 n 筆對應」。

**前端渲染**：使用 rehype plugin 掃描文本中的 `[n]` pattern，查表替換為可點擊的 Citation Pill 元件

```typescript
function citationPlugin(citations) {
  return (tree) => {
    visit(tree, 'text', (node) => {
      // 將 [n] 替換為 <CitationPill index={n} citation={citations[n-1]} />
      // 若 index 超出範圍則 fail silent（不崩潰）
    })
  }
}
```

## 適用場景

這個架構最適合以下情境：

- **RAG / agent chat 產品**：需要在回答中嵌入可交互的引用 pills
- **結構化資料已知**：來源資料（tool result、檢索文件）結構清晰可用
- **需要回源追蹤**：使用者點擊 pill 後能跳轉到來源面板或詳細資訊
- **決策點明確**：團隊需要在「前端 regex 配對」與「後端結構化引用」間做出選擇

## 避免的反模式

純前端 regex 匹配 `\[(\d+)\]`，然後從 assistant message 的 tool calls 中反向查找——三家官方廠商都未採用這種方案，正是因為 LLM hallucination 會導致編號超出實際來源數量的情況。信任 LLM 生成的編號會比信任後端掌控的映射表風險高得多。
