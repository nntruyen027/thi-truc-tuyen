CREATE INDEX IF NOT EXISTS "tu_luan_dot_thi_dot_thi_id_idx"
ON "thi"."tu_luan_dot_thi" USING btree ("dot_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_thi_thi_sinh_trang_thai_de_thi_idx"
ON "thi"."bai_thi" USING btree ("thi_sinh_id", "trang_thai", "de_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_viet_trang_thai_ngay_dang_idx"
ON "bai_viet" USING btree ("trang_thai", "ngay_dang", "id");
