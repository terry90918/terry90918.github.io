import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { zhTw } from '@payloadcms/translations/languages/zhTw'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Articles } from './collections/Articles'
import { Tags } from './collections/Tags'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Validate required environment variables
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
      titleSuffix: ' | 劉尹惠律師事務所',
    },
  },

  i18n: {
    supportedLanguages: { 'zh-TW': zhTw },
    fallbackLanguage: 'zh-TW',
  },

  collections: [Articles, Tags, Media, Users],

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

  plugins: [
    ...(process.env.S3_ACCESS_KEY_ID
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: requireEnv('S3_BUCKET'),
            config: {
              forcePathStyle: true,
              credentials: {
                accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
                secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
              },
              region: process.env.S3_REGION || 'us-east-1',
              endpoint: process.env.S3_ENDPOINT,
            },
          }),
        ]
      : []),
  ],
})
