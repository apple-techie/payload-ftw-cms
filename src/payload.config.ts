import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, Plugin } from 'payload'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { BlogPosts } from './collections/BlogPosts'
import { Services } from './collections/Services'
import { Packages } from './collections/Packages'
import { Addons } from './collections/Addons'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Only enable blob storage if token is provided
const plugins: Plugin[] = []
if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      enabled: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
  )
}

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | Free The Wellness CMS',
    },
  },
  collections: [Admins, Media, Pages, BlogPosts, Services, Packages, Addons],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.POSTGRES_URL || '',
    },
  }),
  plugins,
  cors: ['https://free-the-wellness.vercel.app', 'http://localhost:3000'],
})
