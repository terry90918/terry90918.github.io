---
title: 從 Payload CMS 遷移到 Markdown
excerpt: 為什麼移除資料庫、改用 Markdown 檔案作為文章來源，以及遷移過程中的技術決策。
publishedAt: '2026-04-22T14:00:00+08:00'
status: published
tags:
  - architecture
  - next.js
  - markdown
metaDescription: 從 Payload CMS + PostgreSQL 遷移到純 Markdown 的完整過程與技術決策。
---

個人部落格不需要資料庫。這篇文章記錄遷移過程。

## 為什麼遷移

Payload CMS + PostgreSQL 提供了完整的 CMS 功能，但對個人部落格來說過重：

- 需要維護資料庫連線
- 每次部署都要跑 migration
- 增加基礎設施成本

## 新架構

```
content/
  posts/
    2026/
      hello-world.md
      markdown-migration.md
```

每篇文章是一個 Markdown 檔案，frontmatter 存放 metadata。

## 技術選擇

使用 unified 生態系處理 Markdown：

```typescript
const result = await unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypePrettyCode, {
    theme: { dark: 'github-dark-dimmed', light: 'github-light' },
  })
  .use(rehypeStringify)
  .process(content)
```

## 結論

移除 Payload CMS 之後，`bun build` 不再需要資料庫連線，部署更簡單可靠。
