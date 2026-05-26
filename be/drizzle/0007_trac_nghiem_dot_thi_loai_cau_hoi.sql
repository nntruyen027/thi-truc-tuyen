ALTER TABLE "thi"."trac_nghiem_dot_thi"
ADD COLUMN IF NOT EXISTS "loai_cau_hoi" varchar(50) DEFAULT 'chon_mot';

UPDATE "thi"."trac_nghiem_dot_thi"
SET "loai_cau_hoi" = 'chon_mot'
WHERE "loai_cau_hoi" IS NULL;
