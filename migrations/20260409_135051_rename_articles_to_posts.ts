import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Rename enum type
  await db.execute(sql`ALTER TYPE "public"."enum_articles_status" RENAME TO "enum_posts_status";`)

  // 2. Rename articles table → posts
  await db.execute(sql`ALTER TABLE "articles" RENAME TO "posts";`)

  // 3. Rename PK constraint (ALTER INDEX renames the index; RENAME CONSTRAINT renames the constraint)
  await db.execute(sql`ALTER TABLE "posts" RENAME CONSTRAINT "articles_pkey" TO "posts_pkey";`)

  // 4. Add reading_time column (new field in Posts collection)
  await db.execute(sql`ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "reading_time" numeric;`)

  // 5. Rename articles_rels table → posts_rels
  await db.execute(sql`ALTER TABLE "articles_rels" RENAME TO "posts_rels";`)

  // 6. Update FK constraint on posts_rels to point to posts (rename rather than drop/add)
  await db.execute(sql`
    ALTER TABLE "posts_rels"
      RENAME CONSTRAINT "articles_rels_parent_fk" TO "posts_rels_parent_fk";
  `)

  // 6a. Rename remaining constraints that still carry "articles" name
  await db.execute(
    sql`ALTER TABLE "posts" RENAME CONSTRAINT "articles_feature_image_id_media_id_fk" TO "posts_feature_image_id_media_id_fk";`
  )
  await db.execute(
    sql`ALTER TABLE "posts_rels" RENAME CONSTRAINT "articles_rels_pkey" TO "posts_rels_pkey";`
  )
  await db.execute(
    sql`ALTER TABLE "posts_rels" RENAME CONSTRAINT "articles_rels_tags_fk" TO "posts_rels_tags_fk";`
  )

  // 7. Rename payload_locked_documents_rels.articles_id → posts_id
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME COLUMN "articles_id" TO "posts_id";
  `)

  // 8. Rename FK constraint on payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_articles_fk"
      TO "payload_locked_documents_rels_posts_fk";
  `)

  // 9. Rename index on payload_locked_documents_rels
  await db.execute(sql`
    ALTER INDEX IF EXISTS "payload_locked_documents_rels_articles_id_idx"
      RENAME TO "payload_locked_documents_rels_posts_id_idx";
  `)

  // 10. Rename indexes on posts_rels
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_rels_order_idx" RENAME TO "posts_rels_order_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_rels_parent_idx" RENAME TO "posts_rels_parent_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_rels_path_idx" RENAME TO "posts_rels_path_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_rels_tags_id_idx" RENAME TO "posts_rels_tags_id_idx";`
  )

  // 11. Rename indexes on posts table
  await db.execute(sql`ALTER INDEX IF EXISTS "articles_slug_idx" RENAME TO "posts_slug_idx";`)
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_created_at_idx" RENAME TO "posts_created_at_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_updated_at_idx" RENAME TO "posts_updated_at_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "articles_feature_image_idx" RENAME TO "posts_feature_image_idx";`
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reverse index renames on payload_locked_documents_rels
  await db.execute(sql`
    ALTER INDEX IF EXISTS "payload_locked_documents_rels_posts_id_idx"
      RENAME TO "payload_locked_documents_rels_articles_id_idx";
  `)

  // Reverse index renames on posts_rels
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_rels_order_idx" RENAME TO "articles_rels_order_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_rels_parent_idx" RENAME TO "articles_rels_parent_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_rels_path_idx" RENAME TO "articles_rels_path_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_rels_tags_id_idx" RENAME TO "articles_rels_tags_id_idx";`
  )

  // Reverse index renames on posts table
  await db.execute(sql`ALTER INDEX IF EXISTS "posts_slug_idx" RENAME TO "articles_slug_idx";`)
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_created_at_idx" RENAME TO "articles_created_at_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_updated_at_idx" RENAME TO "articles_updated_at_idx";`
  )
  await db.execute(
    sql`ALTER INDEX IF EXISTS "posts_feature_image_idx" RENAME TO "articles_feature_image_idx";`
  )

  // Rename column before recreating FK (articles_id must exist before FK references it)
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME COLUMN "posts_id" TO "articles_id";
  `)

  // Rename FK constraint on payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      RENAME CONSTRAINT "payload_locked_documents_rels_posts_fk"
      TO "payload_locked_documents_rels_articles_fk";
  `)

  // Drop reading_time before renaming posts → articles
  await db.execute(sql`ALTER TABLE "posts" DROP COLUMN IF EXISTS "reading_time";`)

  // Rename PK constraint before renaming table
  await db.execute(sql`ALTER TABLE "posts" RENAME CONSTRAINT "posts_pkey" TO "articles_pkey";`)

  // Rename tables (must happen before any FK that references articles)
  await db.execute(sql`ALTER TABLE "posts_rels" RENAME TO "articles_rels";`)
  await db.execute(sql`ALTER TABLE "posts" RENAME TO "articles";`)

  // Rename FK constraint on articles_rels (table already renamed)
  await db.execute(sql`
    ALTER TABLE "articles_rels"
      RENAME CONSTRAINT "posts_rels_parent_fk" TO "articles_rels_parent_fk";
  `)

  // Reverse additional constraint renames (6a)
  await db.execute(
    sql`ALTER TABLE "articles_rels" RENAME CONSTRAINT "posts_rels_pkey" TO "articles_rels_pkey";`
  )
  await db.execute(
    sql`ALTER TABLE "articles_rels" RENAME CONSTRAINT "posts_rels_tags_fk" TO "articles_rels_tags_fk";`
  )
  await db.execute(
    sql`ALTER TABLE "articles" RENAME CONSTRAINT "posts_feature_image_id_media_id_fk" TO "articles_feature_image_id_media_id_fk";`
  )

  // Reverse enum rename
  await db.execute(sql`ALTER TYPE "public"."enum_posts_status" RENAME TO "enum_articles_status";`)
}
