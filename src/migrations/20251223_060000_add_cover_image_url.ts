import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Add coverImageUrl column to cms_posts table
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "cms_posts" ADD COLUMN "cover_image_url" varchar;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "cms_posts" DROP COLUMN IF EXISTS "cover_image_url";
  `)
}
