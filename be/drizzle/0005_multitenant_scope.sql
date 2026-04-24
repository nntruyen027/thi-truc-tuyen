ALTER TABLE "dm_chung"."don_vi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "dm_chung"."linh_vuc" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "dm_chung"."nhom_cau_hoi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "bai_viet" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "file"."file" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."cuoc_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."dot_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem_dot_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."tu_luan_dot_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."de_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
ALTER TABLE "thi"."bai_thi" ADD COLUMN IF NOT EXISTS "workspace_id" integer;
--> statement-breakpoint
UPDATE "dm_chung"."don_vi" d
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND d."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "dm_chung"."linh_vuc" d
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND d."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "dm_chung"."nhom_cau_hoi" d
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND d."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "bai_viet" b
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND b."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "file"."file" f
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND f."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."cuoc_thi" c
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND c."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."dot_thi" d
SET "workspace_id" = c."workspace_id"
FROM "thi"."cuoc_thi" c
WHERE d."cuoc_thi_id" = c."id"
  AND d."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."trac_nghiem" t
SET "workspace_id" = w."id"
FROM "platform"."workspaces" w
WHERE w."code" = 'demo'
  AND t."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."trac_nghiem_dot_thi" t
SET "workspace_id" = d."workspace_id"
FROM "thi"."dot_thi" d
WHERE t."dot_thi_id" = d."id"
  AND t."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."tu_luan_dot_thi" t
SET "workspace_id" = d."workspace_id"
FROM "thi"."dot_thi" d
WHERE t."dot_thi_id" = d."id"
  AND t."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."de_thi" d
SET "workspace_id" = dt."workspace_id"
FROM "thi"."dot_thi" dt
WHERE d."dot_thi_id" = dt."id"
  AND d."workspace_id" IS NULL;
--> statement-breakpoint
UPDATE "thi"."bai_thi" b
SET "workspace_id" = d."workspace_id"
FROM "thi"."de_thi" d
WHERE b."de_thi_id" = d."id"
  AND b."workspace_id" IS NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "don_vi_workspace_ten_idx"
ON "dm_chung"."don_vi" USING btree ("workspace_id", "ten");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "linh_vuc_workspace_ten_idx"
ON "dm_chung"."linh_vuc" USING btree ("workspace_id", "ten");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "nhom_cau_hoi_workspace_ten_idx"
ON "dm_chung"."nhom_cau_hoi" USING btree ("workspace_id", "ten");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_viet_workspace_trang_thai_ngay_dang_idx"
ON "bai_viet" USING btree ("workspace_id", "trang_thai", "ngay_dang", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "file_workspace_thoi_gian_tao_idx"
ON "file"."file" USING btree ("workspace_id", "thoi_gian_tao", "id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cuoc_thi_workspace_thoi_gian_idx"
ON "thi"."cuoc_thi" USING btree ("workspace_id", "thoi_gian_bat_dau", "thoi_gian_ket_thuc");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dot_thi_workspace_cuoc_thi_id_idx"
ON "thi"."dot_thi" USING btree ("workspace_id", "cuoc_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dot_thi_workspace_thoi_gian_idx"
ON "thi"."dot_thi" USING btree ("workspace_id", "thoi_gian_bat_dau", "thoi_gian_ket_thuc");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trac_nghiem_workspace_linh_vuc_nhom_idx"
ON "thi"."trac_nghiem" USING btree ("workspace_id", "linh_vuc_id", "nhom_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trac_nghiem_dot_thi_workspace_dot_thi_id_idx"
ON "thi"."trac_nghiem_dot_thi" USING btree ("workspace_id", "dot_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tu_luan_dot_thi_workspace_dot_thi_id_idx"
ON "thi"."tu_luan_dot_thi" USING btree ("workspace_id", "dot_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "de_thi_workspace_dot_thi_thi_sinh_idx"
ON "thi"."de_thi" USING btree ("workspace_id", "dot_thi_id", "thi_sinh_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_thi_workspace_thi_sinh_trang_thai_de_thi_idx"
ON "thi"."bai_thi" USING btree ("workspace_id", "thi_sinh_id", "trang_thai", "de_thi_id");
