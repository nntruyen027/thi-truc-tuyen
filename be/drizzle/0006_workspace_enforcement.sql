ALTER TABLE "dm_chung"."don_vi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "dm_chung"."linh_vuc" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "dm_chung"."nhom_cau_hoi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "bai_viet" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "file"."file" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."cuoc_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."dot_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem_dot_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."tu_luan_dot_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."de_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "thi"."bai_thi" ALTER COLUMN "workspace_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "dm_chung"."don_vi" ADD CONSTRAINT "don_vi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "dm_chung"."linh_vuc" ADD CONSTRAINT "linh_vuc_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "dm_chung"."nhom_cau_hoi" ADD CONSTRAINT "nhom_cau_hoi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "bai_viet" ADD CONSTRAINT "bai_viet_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "file"."file" ADD CONSTRAINT "file_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."cuoc_thi" ADD CONSTRAINT "cuoc_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."dot_thi" ADD CONSTRAINT "dot_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem" ADD CONSTRAINT "trac_nghiem_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."trac_nghiem_dot_thi" ADD CONSTRAINT "trac_nghiem_dot_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."tu_luan_dot_thi" ADD CONSTRAINT "tu_luan_dot_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."de_thi" ADD CONSTRAINT "de_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
ALTER TABLE "thi"."bai_thi" ADD CONSTRAINT "bai_thi_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "platform"."workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cuoc_thi_workspace_ten_idx"
ON "thi"."cuoc_thi" USING btree ("workspace_id", "ten");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dot_thi_workspace_cuoc_thi_ten_idx"
ON "thi"."dot_thi" USING btree ("workspace_id", "cuoc_thi_id", "ten");
