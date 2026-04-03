import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: '使用者', plural: '使用者' },
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: '系統管理',
  },
  fields: [],
}
