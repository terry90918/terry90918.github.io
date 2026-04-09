import { en } from '@payloadcms/translations/languages/en'
import { zhTw } from '@payloadcms/translations/languages/zhTw'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} environment variable is required`)
  }
  return value
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | Terry Chen',
    },
  },

  i18n: {
    supportedLanguages: { en, 'zh-TW': zhTw },
    fallbackLanguage: 'en',
  },

  collections: [Posts, Tags, Media, Users],

  editor: lexicalEditor({}),

  secret: requireEnv('PAYLOAD_SECRET'),

  graphQL: {
    disablePlaygroundInProduction: true,
  },

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  db: postgresAdapter({
    push: process.env.NODE_ENV === 'development',
    prodMigrations: migrations,
    pool: {
      connectionString: requireEnv('DATABASE_URL'),
    },
  }),

  sharp,

  plugins: [],
})
