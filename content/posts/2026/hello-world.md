---
title: Hello World
excerpt: 第一篇文章，測試 Markdown 渲染、syntax highlighting 與 dark mode 切換。
publishedAt: '2026-04-23T10:00:00+08:00'
status: published
tags:
  - next.js
  - payload-cms
  - typescript
metaDescription: 第一篇文章，測試 Markdown 渲染、syntax highlighting 與 dark mode 切換。
---

這是部落格的第一篇文章。

## 技術棧

| 項目            | 技術                    |
| --------------- | ----------------------- |
| Framework       | Next.js 16 (App Router) |
| Styling         | Tailwind CSS 4          |
| Package Manager | Bun                     |

## 範例程式碼

```typescript
import { getLatestPosts } from '@/lib/posts'

export default async function HomePage() {
  const posts = await getLatestPosts(10)
  return (
    <main>
      {posts.map((post) => (
        <article key={post.slug}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </main>
  )
}
```

## 待辦事項

- [x] 建立 Next.js 專案
- [x] 設定 Tailwind CSS
- [x] 改用 Markdown 作為資料來源
- [ ] 新增更多文章
