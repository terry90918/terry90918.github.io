# Content

文章儲存在 `posts/<year>/<slug>.md`。

## Frontmatter Schema

```yaml
---
title: '文章標題' # 必填
publishedAt: '2026-04-23T10:00:00+08:00' # 必填，ISO 8601
status: published # 必填：draft | published
excerpt: '文章摘要' # 選填
slug: 'custom-slug' # 選填，預設從檔名推導
tags: # 選填
  - typescript
  - next.js
metaDescription: 'SEO 描述' # 選填，最多 160 字
featureImage: '/images/2026/hero.png' # 選填
---
```

## 寫作流程

1. 在 `content/posts/<year>/` 建立 `<slug>.md`
2. 填寫 frontmatter
3. 用 Markdown 撰寫內容
4. `git commit` → Coolify 自動部署

## 支援語法

- **GFM**：表格、task list、strikethrough、autolink
- **Heading anchors**：自動加 `id` 屬性，支援頁內跳轉
- **Syntax highlighting**：fenced code block 自動高亮，跟隨 dark mode
- **featureImage**：目前前台未渲染，保留供未來使用
