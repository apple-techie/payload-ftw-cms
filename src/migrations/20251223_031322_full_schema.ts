import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Create ENUMs if they don't exist
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_admins_role" AS ENUM('admin', 'editor');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_cms_posts_category" AS ENUM('wellness', 'education', 'self-care', 'massage-therapy', 'athletic-recovery');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_cms_posts_status" AS ENUM('draft', 'published');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_cms_services_category" AS ENUM('modern_massage', 'holistic_bodywork', 'athletic_recovery');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE "public"."enum_cms_packages_type" AS ENUM('credit', 'specific');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create tables if they don't exist
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admins_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "created_at" timestamp(3) with time zone,
      "expires_at" timestamp(3) with time zone NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "admins" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "role" "enum_admins_role" DEFAULT 'editor',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "email" varchar NOT NULL,
      "reset_password_token" varchar,
      "reset_password_expiration" timestamp(3) with time zone,
      "salt" varchar,
      "hash" varchar,
      "login_attempts" numeric DEFAULT 0,
      "lock_until" timestamp(3) with time zone
    );

    CREATE TABLE IF NOT EXISTS "media" (
      "id" serial PRIMARY KEY NOT NULL,
      "alt" varchar NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "url" varchar,
      "thumbnail_u_r_l" varchar,
      "filename" varchar,
      "mime_type" varchar,
      "filesize" numeric,
      "width" numeric,
      "height" numeric,
      "focal_x" numeric,
      "focal_y" numeric
    );

    CREATE TABLE IF NOT EXISTS "pages" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "content" jsonb,
      "meta_description" varchar,
      "meta_image_id" integer,
      "status" "enum_pages_status" DEFAULT 'draft',
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_posts_tags" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "tag" varchar
    );

    CREATE TABLE IF NOT EXISTS "cms_posts" (
      "id" serial PRIMARY KEY NOT NULL,
      "title" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "excerpt" varchar,
      "cover_image_id" integer,
      "content" jsonb NOT NULL,
      "category" "enum_cms_posts_category",
      "author" varchar DEFAULT 'Free The Wellness',
      "status" "enum_cms_posts_status" DEFAULT 'draft',
      "published_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_services_benefits" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "benefit" varchar
    );

    CREATE TABLE IF NOT EXISTS "cms_services" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar NOT NULL,
      "long_description" jsonb,
      "image_id" integer,
      "category" "enum_cms_services_category" NOT NULL,
      "duration" numeric NOT NULL,
      "price" numeric NOT NULL,
      "credit_value" numeric DEFAULT 1,
      "is_active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_packages" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar,
      "type" "enum_cms_packages_type" NOT NULL,
      "price_in_cents" numeric NOT NULL,
      "credit_amount" numeric,
      "related_service_id" integer,
      "session_count" numeric,
      "valid_days" numeric DEFAULT 365,
      "is_active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_addons" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "slug" varchar NOT NULL,
      "description" varchar,
      "price_in_cents" numeric NOT NULL,
      "additional_minutes" numeric DEFAULT 0 NOT NULL,
      "is_active" boolean DEFAULT true,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "cms_addons_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "cms_services_id" integer
    );

    CREATE TABLE IF NOT EXISTS "payload_kv" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar NOT NULL,
      "data" jsonb NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents" (
      "id" serial PRIMARY KEY NOT NULL,
      "global_slug" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_locked_documents_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "admins_id" integer,
      "media_id" integer,
      "pages_id" integer,
      "cms_posts_id" integer,
      "cms_services_id" integer,
      "cms_packages_id" integer,
      "cms_addons_id" integer
    );

    CREATE TABLE IF NOT EXISTS "payload_preferences" (
      "id" serial PRIMARY KEY NOT NULL,
      "key" varchar,
      "value" jsonb,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "payload_preferences_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "admins_id" integer
    );

    CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
  `)

  // Add missing columns to existing tables (for incremental updates)
  // This handles cases where tables exist from previous deployments but lack new columns
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_posts_id" integer;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_services_id" integer;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_packages_id" integer;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cms_addons_id" integer;
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `)

  // Add foreign keys (ignore if they exist)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "admins_sessions" ADD CONSTRAINT "admins_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "pages" ADD CONSTRAINT "pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_posts_tags" ADD CONSTRAINT "cms_posts_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_posts" ADD CONSTRAINT "cms_posts_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_services_benefits" ADD CONSTRAINT "cms_services_benefits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cms_services"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_services" ADD CONSTRAINT "cms_services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_packages" ADD CONSTRAINT "cms_packages_related_service_id_cms_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."cms_services"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_addons_rels" ADD CONSTRAINT "cms_addons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_addons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "cms_addons_rels" ADD CONSTRAINT "cms_addons_rels_cms_services_fk" FOREIGN KEY ("cms_services_id") REFERENCES "public"."cms_services"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cms_posts_fk" FOREIGN KEY ("cms_posts_id") REFERENCES "public"."cms_posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cms_services_fk" FOREIGN KEY ("cms_services_id") REFERENCES "public"."cms_services"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cms_packages_fk" FOREIGN KEY ("cms_packages_id") REFERENCES "public"."cms_packages"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cms_addons_fk" FOREIGN KEY ("cms_addons_id") REFERENCES "public"."cms_addons"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create indexes (ignore if they exist)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "admins_sessions_order_idx" ON "admins_sessions" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "admins_sessions_parent_id_idx" ON "admins_sessions" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "admins_updated_at_idx" ON "admins" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "admins_created_at_idx" ON "admins" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_idx" ON "admins" USING btree ("email");
    CREATE INDEX IF NOT EXISTS "media_updated_at_idx" ON "media" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "media_created_at_idx" ON "media" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "media_filename_idx" ON "media" USING btree ("filename");
    CREATE UNIQUE INDEX IF NOT EXISTS "pages_slug_idx" ON "pages" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "pages_meta_meta_image_idx" ON "pages" USING btree ("meta_image_id");
    CREATE INDEX IF NOT EXISTS "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "pages_created_at_idx" ON "pages" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "cms_posts_tags_order_idx" ON "cms_posts_tags" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "cms_posts_tags_parent_id_idx" ON "cms_posts_tags" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "cms_posts_slug_idx" ON "cms_posts" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "cms_posts_cover_image_idx" ON "cms_posts" USING btree ("cover_image_id");
    CREATE INDEX IF NOT EXISTS "cms_posts_updated_at_idx" ON "cms_posts" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "cms_posts_created_at_idx" ON "cms_posts" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "cms_services_benefits_order_idx" ON "cms_services_benefits" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "cms_services_benefits_parent_id_idx" ON "cms_services_benefits" USING btree ("_parent_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "cms_services_slug_idx" ON "cms_services" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "cms_services_image_idx" ON "cms_services" USING btree ("image_id");
    CREATE INDEX IF NOT EXISTS "cms_services_updated_at_idx" ON "cms_services" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "cms_services_created_at_idx" ON "cms_services" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "cms_packages_slug_idx" ON "cms_packages" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "cms_packages_related_service_idx" ON "cms_packages" USING btree ("related_service_id");
    CREATE INDEX IF NOT EXISTS "cms_packages_updated_at_idx" ON "cms_packages" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "cms_packages_created_at_idx" ON "cms_packages" USING btree ("created_at");
    CREATE UNIQUE INDEX IF NOT EXISTS "cms_addons_slug_idx" ON "cms_addons" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "cms_addons_updated_at_idx" ON "cms_addons" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "cms_addons_created_at_idx" ON "cms_addons" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "cms_addons_rels_order_idx" ON "cms_addons_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "cms_addons_rels_parent_idx" ON "cms_addons_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "cms_addons_rels_path_idx" ON "cms_addons_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "cms_addons_rels_cms_services_id_idx" ON "cms_addons_rels" USING btree ("cms_services_id");
    CREATE UNIQUE INDEX IF NOT EXISTS "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_admins_id_idx" ON "payload_locked_documents_rels" USING btree ("admins_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cms_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_posts_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cms_services_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_services_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cms_packages_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_packages_id");
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_cms_addons_id_idx" ON "payload_locked_documents_rels" USING btree ("cms_addons_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
    CREATE INDEX IF NOT EXISTS "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "payload_preferences_rels_admins_id_idx" ON "payload_preferences_rels" USING btree ("admins_id");
    CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "admins_sessions" CASCADE;
  DROP TABLE IF EXISTS "admins" CASCADE;
  DROP TABLE IF EXISTS "media" CASCADE;
  DROP TABLE IF EXISTS "pages" CASCADE;
  DROP TABLE IF EXISTS "cms_posts_tags" CASCADE;
  DROP TABLE IF EXISTS "cms_posts" CASCADE;
  DROP TABLE IF EXISTS "cms_services_benefits" CASCADE;
  DROP TABLE IF EXISTS "cms_services" CASCADE;
  DROP TABLE IF EXISTS "cms_packages" CASCADE;
  DROP TABLE IF EXISTS "cms_addons" CASCADE;
  DROP TABLE IF EXISTS "cms_addons_rels" CASCADE;
  DROP TABLE IF EXISTS "payload_kv" CASCADE;
  DROP TABLE IF EXISTS "payload_locked_documents" CASCADE;
  DROP TABLE IF EXISTS "payload_locked_documents_rels" CASCADE;
  DROP TABLE IF EXISTS "payload_preferences" CASCADE;
  DROP TABLE IF EXISTS "payload_preferences_rels" CASCADE;
  DROP TABLE IF EXISTS "payload_migrations" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_admins_role";
  DROP TYPE IF EXISTS "public"."enum_pages_status";
  DROP TYPE IF EXISTS "public"."enum_cms_posts_category";
  DROP TYPE IF EXISTS "public"."enum_cms_posts_status";
  DROP TYPE IF EXISTS "public"."enum_cms_services_category";
  DROP TYPE IF EXISTS "public"."enum_cms_packages_type";`)
}
