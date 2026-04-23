CREATE TABLE "bai_viet" (
	"id" serial PRIMARY KEY NOT NULL,
	"tieu_de" text NOT NULL,
	"tom_tat" text,
	"noi_dung" text NOT NULL,
	"anh_dai_dien" text,
	"ngay_dang" timestamp NOT NULL,
	"trang_thai" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"nguoi_tao" integer
);
--> statement-breakpoint
INSERT INTO "bai_viet" ("tieu_de", "tom_tat", "noi_dung", "anh_dai_dien", "ngay_dang", "trang_thai", "created_at", "updated_at")
SELECT
    COALESCE(item->>'tieuDe', 'Bài viết cuộc thi'),
    COALESCE(item->>'tomTat', ''),
    COALESCE(item->>'noiDung', '<p></p>'),
    NULLIF(item->>'anhDaiDien', ''),
    COALESCE(NULLIF(item->>'ngayDang', '')::timestamp, now()),
    true,
    COALESCE(NULLIF(item->>'createdAt', '')::timestamp, now()),
    COALESCE(NULLIF(item->>'updatedAt', '')::timestamp, now())
FROM "cau_hinh" ch,
LATERAL jsonb_array_elements(
    CASE
        WHEN ch."gia_tri" IS NULL OR trim(ch."gia_tri") = '' THEN '[]'::jsonb
        ELSE ch."gia_tri"::jsonb
    END
) item
WHERE ch."khoa" = 'bai_viet_cuoc_thi'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
ALTER TABLE "thi"."cuoc_thi" ALTER COLUMN "mo_ta" SET DATA TYPE varchar(1000);
