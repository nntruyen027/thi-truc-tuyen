CREATE SCHEMA "platform";
--> statement-breakpoint
CREATE TABLE "platform"."workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"ten" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_platform_workspace_code" UNIQUE("code"),
	CONSTRAINT "uq_platform_workspace_slug" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "platform"."workspace_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"domain" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_platform_workspace_domain" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "platform"."workspace_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"khoa" varchar(200) NOT NULL,
	"gia_tri" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_platform_workspace_setting" UNIQUE("workspace_id","khoa")
);
--> statement-breakpoint
ALTER TABLE "auth"."users" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
CREATE INDEX "workspace_domains_workspace_id_idx" ON "platform"."workspace_domains" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "workspace_settings_workspace_id_idx" ON "platform"."workspace_settings" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "auth_users_workspace_id_idx" ON "auth"."users" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "auth_refresh_tokens_workspace_id_idx" ON "auth"."refresh_tokens" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "auth_refresh_tokens_user_id_idx" ON "auth"."refresh_tokens" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "auth"."users" ADD CONSTRAINT "uq_auth_users_workspace_username" UNIQUE("workspace_id","username");
--> statement-breakpoint
UPDATE "platform"."workspaces"
SET "is_default" = false
WHERE "is_default" = true;
--> statement-breakpoint
INSERT INTO "platform"."workspaces" ("code", "ten", "slug", "status", "is_default")
VALUES ('demo', 'Demo', 'demo', 'active', true)
ON CONFLICT ("code")
DO UPDATE SET
    "ten" = EXCLUDED."ten",
    "slug" = EXCLUDED."slug",
    "status" = EXCLUDED."status",
    "is_default" = true,
    "updated_at" = now();
--> statement-breakpoint
INSERT INTO "platform"."workspace_domains" ("workspace_id", "domain", "is_primary")
SELECT w."id", 'localhost', true
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
ON CONFLICT ("domain") DO NOTHING;
--> statement-breakpoint
INSERT INTO "platform"."workspace_domains" ("workspace_id", "domain", "is_primary")
SELECT w."id", '127.0.0.1', false
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
ON CONFLICT ("domain") DO NOTHING;
--> statement-breakpoint
UPDATE "auth"."users" u
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND u."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "auth"."refresh_tokens" rt
SET "workspace_id" = COALESCE(u."workspace_id", w."id")
FROM "auth"."users" u
CROSS JOIN (
    SELECT "id"
    FROM "platform"."workspaces"
    WHERE "code" = 'demo'
    LIMIT 1
) w
WHERE rt."user_id" = u."id"
  AND rt."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "auth"."users" u
SET "role" = 'super_admin'
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND u."workspace_id" = w."id"
  AND u."role" = 'admin';
