ALTER TABLE "auth"."users" DROP COLUMN IF EXISTS "avatar";
--> statement-breakpoint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'cauA'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'caua'
    ) THEN
        EXECUTE 'ALTER TABLE "thi"."trac_nghiem" RENAME COLUMN "cauA" TO "caua"';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'cauB'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'caub'
    ) THEN
        EXECUTE 'ALTER TABLE "thi"."trac_nghiem" RENAME COLUMN "cauB" TO "caub"';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'cauC'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'cauc'
    ) THEN
        EXECUTE 'ALTER TABLE "thi"."trac_nghiem" RENAME COLUMN "cauC" TO "cauc"';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'cauD'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'caud'
    ) THEN
        EXECUTE 'ALTER TABLE "thi"."trac_nghiem" RENAME COLUMN "cauD" TO "caud"';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'dapAn'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'thi'
          AND table_name = 'trac_nghiem'
          AND column_name = 'dapan'
    ) THEN
        EXECUTE 'ALTER TABLE "thi"."trac_nghiem" RENAME COLUMN "dapAn" TO "dapan"';
    END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cuoc_thi_thoi_gian_range_idx" ON "thi"."cuoc_thi" USING btree ("thoi_gian_bat_dau","thoi_gian_ket_thuc");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dot_thi_cuoc_thi_id_idx" ON "thi"."dot_thi" USING btree ("cuoc_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "dot_thi_thoi_gian_range_idx" ON "thi"."dot_thi" USING btree ("thoi_gian_bat_dau","thoi_gian_ket_thuc");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trac_nghiem_linh_vuc_nhom_idx" ON "thi"."trac_nghiem" USING btree ("linh_vuc_id","nhom_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "trac_nghiem_dot_thi_dot_thi_id_idx" ON "thi"."trac_nghiem_dot_thi" USING btree ("dot_thi_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "de_thi_dot_thi_thi_sinh_idx" ON "thi"."de_thi" USING btree ("dot_thi_id","thi_sinh_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "de_thi_cau_hoi_de_thi_thu_tu_idx" ON "thi"."de_thi_cau_hoi" USING btree ("de_thi_id","thu_tu");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_thi_thi_sinh_trang_thai_idx" ON "thi"."bai_thi" USING btree ("thi_sinh_id","trang_thai");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bai_thi_de_thi_id_idx" ON "thi"."bai_thi" USING btree ("de_thi_id");
