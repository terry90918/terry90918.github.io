---
title: 'Notion API 無法建立表單檢視的限制'
publishedAt: '2026-03-25T14:46:00+08:00'
status: 'published'
slug: 'notion-form-api-limitations'
tags:
  - tooling-workflow
  - notion
  - api
  - limitations
---

如果你正在用 Notion 作為後端搭建應用程式，可能會遇到一個令人沮喪的限制：Notion API 無法建立表單檢視。

## 問題的根源

Notion API（2026-03-11 版本）明確不支援建立表單檢視。當你嘗試用 `create-view` 且指定 type 為 `form` 時，API 會直接拋出 500 Internal Server Error。官方文件也坦白地說明了這一點：「Managing views is not currently supported in the API.」

除此之外還有幾個限制：Notion 免費方案的表單無法隱藏欄位或設定預設值，而且 URL 格式也不一致。工作區 URL（`notion.so/...` 格式）需要登入才能訪問，但公開嵌入 URL（`https://{workspace}.notion.site/ebd/{page-id}` 格式）則可以匿名存取。

## 實際解決方案

既然 API 無法建立表單檢視，最務實的做法是混合使用 API 和手動操作。

首先，透過 Notion API 建立資料庫和其結構——這部分完全沒問題。然後，在 Notion UI 中手動建立表單檢視。具體步驟是：進入資料庫 → 點擊「Add view」→ 選擇「Form」。接著在 Notion 設定中將表單權限設為「Anyone can submit」，讓任何人都能提交。

最關鍵的一步是取得公開嵌入 URL。在 Notion UI 中點選「Share form」，你會得到像 `https://{workspace}.notion.site/ebd/{page-id}` 這樣的 URL。這個 URL 就是你需要在應用中使用的。

在 Next.js 中，把這個 URL 嵌入 iframe 很簡單：

```tsx
<iframe
  src={NOTION_FORM_URL}
  className="w-full rounded-lg border"
  style={{ height: '800px' }}
  title="Form title"
  allowFullScreen
/>
```

## 容易踩坑的地方

如果你使用 Notion MCP（Model Context Protocol）來管理檢視，`FORM OPEN` 和 `FORM ANONYMOUS` 這些 DSL 指令可以透過 `update-view` 來修改既有的表單檢視，但不能用於新建。`SHOW` 指令在表單檢視上也可能不夠可靠，特別是在隱藏欄位時。

另外，Notion 表單本身就有標題和描述欄位，不要再用 PageHero 元件重複顯示這些內容，會顯得很冗贅。還有一個小細節：iframe 的頂部會有約 200 像素的空白區域，那是 Notion 預留給自己的標頭區域，在設計佈局時要把這個算進去。

## 什麼時候用這個方案

如果你在建立潛在客戶獲取表單，並用 Notion 作為後端，這個模式就很適用。或者當你的專案已經在用 Notion MCP，但又需要公開表單接收用戶提交，這也是一個實用的折衷方案。

這個解決方案的核心思想是：承認 API 的限制，轉而利用 Notion 本身既有的功能和公開分享機制來達成目標。有時候，不是所有事都要完全自動化，適度地結合手動操作和程式化流程，往往能更快地交付價值。
