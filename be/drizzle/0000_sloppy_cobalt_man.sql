CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE SCHEMA "dm_chung";
--> statement-breakpoint
CREATE SCHEMA "file";
--> statement-breakpoint
CREATE SCHEMA "thi";
--> statement-breakpoint
CREATE TABLE "cau_hinh" (
	"khoa" varchar(200) PRIMARY KEY NOT NULL,
	"gia_tri" text
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"ho_ten" varchar(500),
	"don_vi_id" integer,
	"role" varchar(50) DEFAULT 'user',
	"avatar" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth"."refresh_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" text,
	"expire_at" timestamp,
	"revoked" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dm_chung"."don_vi" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten" varchar(500),
	"mo_ta" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "dm_chung"."linh_vuc" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten" varchar(500),
	"mo_ta" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "dm_chung"."nhom_cau_hoi" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten" varchar(500),
	"mo_ta" varchar(500)
);
--> statement-breakpoint
CREATE TABLE "file"."file" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten" varchar(500),
	"ten_goc" varchar(500),
	"duong_dan" varchar(1000),
	"loai" varchar(100),
	"kich_thuoc" integer,
	"nguoi_tao" integer,
	"thoi_gian_tao" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "thi"."cuoc_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"ten" varchar(500),
	"mo_ta" varchar(500),
	"thoi_gian_bat_dau" timestamp,
	"thoi_gian_ket_thuc" timestamp,
	"trang_thai" boolean,
	"cho_phep_xem_lich_su" boolean,
	"cho_phep_xem_lai_dap_an" boolean,
	"co_tu_luan" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "thi"."dot_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"cuoc_thi_id" integer,
	"ten" varchar(500),
	"mo_ta" varchar(500),
	"so_lan_tham_gia_toi_da" integer,
	"thoi_gian_thi" integer,
	"ty_le_danh_gia_dat" real,
	"thoi_gian_bat_dau" timestamp,
	"thoi_gian_ket_thuc" timestamp,
	"co_tron_cau_hoi" boolean DEFAULT false,
	"cho_phep_luu_bai" boolean DEFAULT false,
	"du_doan" boolean DEFAULT false,
	"trang_thai" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "thi"."trac_nghiem" (
	"id" serial PRIMARY KEY NOT NULL,
	"linh_vuc_id" integer,
	"nhom_id" integer,
	"cau_hoi" text NOT NULL,
	"cauA" text,
	"cauB" text,
	"cauC" text,
	"cauD" text,
	"dapAn" integer,
	"diem" integer
);
--> statement-breakpoint
CREATE TABLE "thi"."trac_nghiem_dot_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"dot_thi_id" integer,
	"linh_vuc_id" integer,
	"nhom_id" integer,
	"so_luong" integer
);
--> statement-breakpoint
CREATE TABLE "thi"."tu_luan_dot_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"dot_thi_id" integer,
	"cau_hoi" text,
	"goi_y" text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE "thi"."de_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"dot_thi_id" integer,
	"thi_sinh_id" integer,
	"lan_thi" integer,
	"thoi_gian_tao" timestamp DEFAULT now(),
	"trang_thai" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "thi"."de_thi_cau_hoi" (
	"id" serial PRIMARY KEY NOT NULL,
	"de_thi_id" integer,
	"cau_hoi_id" integer,
	"thu_tu" integer
);
--> statement-breakpoint
CREATE TABLE "thi"."bai_thi" (
	"id" serial PRIMARY KEY NOT NULL,
	"de_thi_id" integer,
	"thi_sinh_id" integer,
	"lan_thi" integer,
	"thoi_gian_bat_dau" timestamp DEFAULT now(),
	"thoi_gian_nop" timestamp,
	"trang_thai" integer DEFAULT 0,
	"diem" real DEFAULT 0,
	"tong_thoi_gian_da_lam" integer DEFAULT 0,
	"lan_bat_dau" timestamp,
	"dang_lam" boolean DEFAULT false,
	"so_du_doan" integer
);
--> statement-breakpoint
CREATE TABLE "thi"."bai_thi_chi_tiet" (
	"id" serial PRIMARY KEY NOT NULL,
	"bai_thi_id" integer,
	"cau_hoi_id" integer,
	"dap_an_chon" integer,
	"dung" boolean,
	"diem" real,
	CONSTRAINT "uq_bai_cau" UNIQUE("bai_thi_id","cau_hoi_id")
);
--> statement-breakpoint
CREATE TABLE "thi"."bai_thi_chi_tiet_tu_luan" (
	"id" serial PRIMARY KEY NOT NULL,
	"bai_thi_id" integer,
	"cau_hoi_id" integer,
	"dap_an" text,
	"diem" real,
	CONSTRAINT "uq_bai_cau_tu_luan" UNIQUE("bai_thi_id","cau_hoi_id")
);
