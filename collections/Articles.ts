import type { CollectionConfig } from 'payload'

/** 將文字轉為 URL-safe slug（支援中文字元） */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff\u3400-\u4dbf-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: '文章', plural: '文章' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'updatedAt'],
    group: '內容管理',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data?.title && !data?.slug) {
          data.slug = slugify(data.title)
        }
        return data
      },
    ],
  },
  access: {
    read: ({ req }) => {
      // 已登入使用者可讀取所有文章
      if (req.user) return true
      // 未登入使用者僅可讀取已發佈的文章
      return { status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'title',
      label: '標題',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: '網址代稱',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: '儲存時從標題自動生成',
      },
    },
    {
      name: 'content',
      label: '內容',
      type: 'richText',
      required: true,
    },
    {
      name: 'excerpt',
      label: '摘要',
      type: 'textarea',
      maxLength: 300,
    },
    {
      name: 'featureImage',
      label: '封面圖片',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tags',
      label: '標籤',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
    },
    {
      name: 'status',
      label: '狀態',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: '草稿', value: 'draft' },
        { label: '已發佈', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      label: '發佈日期',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'metaDescription',
      label: 'SEO 描述',
      type: 'textarea',
      maxLength: 160,
      admin: {
        position: 'sidebar',
        description: '搜尋引擎顯示的描述文字（最多 160 字）',
      },
    },
  ],
}
