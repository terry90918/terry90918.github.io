import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Rename enum type
  await db.execute(sql`ALTER TYPE "public"."enum_articles_status" RENAME TO "enum_posts_status";`)

  // 2. Rename articles table → posts
  await db.execute(sql`ALTER TABLE "articles" RENAME TO "posts";`)

  // 3. Add reading_time column (new field in Posts collection)
  await db.execute(sql`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "reading_time" numeric;`)

  // 4. Rename articles_rels table → posts_rels
  await db.execute(sql`ALTER TABLE "articles_rels" RENAME TO "posts_rels";`)

  // 5. Update FK constraint on posts_rels to point to posts
  await db.execute(sql`
    ALTER TABLE "posts_rels"
      DROP CONSTRAINT IF EXISTS "articles_rels_parent_fk",
      ADD CONSTRAINT "posts_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "posts"("id") ON DELETE CASCADE;
  `)

  // 6. Rename payload_locked_documents_rels.articles_id → posts_id
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME COLUMN "articles_id" TO "posts_id";
  `)

  // 7. Drop old FK constraint and add new one
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_articles_fk",
      ADD CONSTRAINT "payload_locked_documents_rels_posts_fk"
        FOREIGN KEY ("posts_id") REFERENCES "posts"("id") ON DELETE CASCADE;
  `)

  // 8. Rename indexes on payload_locked_documents_rels
  await db.execute(sql`
    ALTER INDEX IF EXISTS "payload_locked_documents_rels_articles_id_idx"
      RENAME TO "payload_locked_documents_rels_posts_id_idx";
  `)

  // 9. Rename indexes on posts_rels
  await db.execute(sql`
    ALTER INDEX IF EXISTS "articles_rels_order_idx" RENAME TO "posts_rels_order_idx";
    ALTER INDEX IF EXISTS "articles_rels_parent_idx" RENAME TO "posts_rels_parent_idx";
    ALTER INDEX IF EXISTS "articles_rels_path_idx" RENAME TO "posts_rels_path_idx";
    ALTER INDEX IF EXISTS "articles_rels_tags_id_idx" RENAME TO "posts_rels_tags_id_idx";
  `)

  // 10. Rename indexes on posts table
  await db.execute(sql`
    ALTER INDEX IF EXISTS "articles_pkey" RENAME TO "posts_pkey";
    ALTER INDEX IF EXISTS "articles_slug_idx" RENAME TO "posts_slug_idx";
    ALTER INDEX IF EXISTS "articles_created_at_idx" RENAME TO "posts_created_at_idx";
    ALTER INDEX IF EXISTS "articles_updated_at_idx" RENAME TO "posts_updated_at_idx";
    ALTER INDEX IF EXISTS "articles_feature_image_idx" RENAME TO "posts_feature_image_idx";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse: posts → articles
  await db.execute(sql`ALTER TYPE "public"."enum_posts_status" RENAME TO "enum_articles_status";`)
  await db.execute(sql`ALTER TABLE "posts" RENAME TO "articles";`)
  await db.execute(sql`ALTER TABLE "posts_rels" RENAME TO "articles_rels";`)

  await db.execute(sql`
    ALTER TABLE "articles_rels"
      DROP CONSTRAINT IF EXISTS "posts_rels_parent_fk",
      ADD CONSTRAINT "articles_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "articles"("id") ON DELETE CASCADE;
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME COLUMN "posts_id" TO "articles_id";
  `)

  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk",
      ADD CONSTRAINT "payload_locked_documents_rels_articles_fk"
        FOREIGN KEY ("articles_id") REFERENCES "articles"("id") ON DELETE CASCADE;
  `)
}
