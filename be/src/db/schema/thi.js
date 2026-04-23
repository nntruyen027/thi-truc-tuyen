const {
    boolean,
    integer,
    pgSchema,
    real,
    serial,
    text,
    timestamp,
    unique,
    varchar,
} = require("drizzle-orm/pg-core");

const thiSchema = pgSchema("thi");

const cuocThi = thiSchema.table("cuoc_thi", {
    id: serial("id").primaryKey(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 1000 }),
    thoiGianBatDau: timestamp("thoi_gian_bat_dau"),
    thoiGianKetThuc: timestamp("thoi_gian_ket_thuc"),
    trangThai: boolean("trang_thai"),
    choPhepXemLichSu: boolean("cho_phep_xem_lich_su"),
    choPhepXemLaiDapAn: boolean("cho_phep_xem_lai_dap_an"),
    coTuLuan: boolean("co_tu_luan"),
    createdAt: timestamp("created_at").defaultNow(),
});

const dotThi = thiSchema.table("dot_thi", {
    id: serial("id").primaryKey(),
    cuocThiId: integer("cuoc_thi_id"),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
    soLanThamGiaToiDa: integer("so_lan_tham_gia_toi_da"),
    thoiGianThi: integer("thoi_gian_thi"),
    tyLeDanhGiaDat: real("ty_le_danh_gia_dat"),
    thoiGianBatDau: timestamp("thoi_gian_bat_dau"),
    thoiGianKetThuc: timestamp("thoi_gian_ket_thuc"),
    coTronCauHoi: boolean("co_tron_cau_hoi").default(false),
    choPhepLuuBai: boolean("cho_phep_luu_bai").default(false),
    duDoan: boolean("du_doan").default(false),
    trangThai: boolean("trang_thai").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

const tracNghiem = thiSchema.table("trac_nghiem", {
    id: serial("id").primaryKey(),
    linhVucId: integer("linh_vuc_id"),
    nhomId: integer("nhom_id"),
    cauHoi: text("cau_hoi").notNull(),
    cauA: text("caua"),
    cauB: text("caub"),
    cauC: text("cauc"),
    cauD: text("caud"),
    dapAn: integer("dapan"),
    diem: integer("diem"),
});

const tracNghiemDotThi = thiSchema.table("trac_nghiem_dot_thi", {
    id: serial("id").primaryKey(),
    dotThiId: integer("dot_thi_id"),
    linhVucId: integer("linh_vuc_id"),
    nhomId: integer("nhom_id"),
    soLuong: integer("so_luong"),
});

const tuLuanDotThi = thiSchema.table("tu_luan_dot_thi", {
    id: serial("id").primaryKey(),
    dotThiId: integer("dot_thi_id"),
    cauHoi: text("cau_hoi"),
    goiY: text("goi_y").default(""),
});

const deThi = thiSchema.table("de_thi", {
    id: serial("id").primaryKey(),
    dotThiId: integer("dot_thi_id"),
    thiSinhId: integer("thi_sinh_id"),
    lanThi: integer("lan_thi"),
    thoiGianTao: timestamp("thoi_gian_tao").defaultNow(),
    trangThai: integer("trang_thai").default(0),
});

const deThiCauHoi = thiSchema.table("de_thi_cau_hoi", {
    id: serial("id").primaryKey(),
    deThiId: integer("de_thi_id"),
    cauHoiId: integer("cau_hoi_id"),
    thuTu: integer("thu_tu"),
});

const baiThi = thiSchema.table("bai_thi", {
    id: serial("id").primaryKey(),
    deThiId: integer("de_thi_id"),
    thiSinhId: integer("thi_sinh_id"),
    lanThi: integer("lan_thi"),
    thoiGianBatDau: timestamp("thoi_gian_bat_dau").defaultNow(),
    thoiGianNop: timestamp("thoi_gian_nop"),
    trangThai: integer("trang_thai").default(0),
    diem: real("diem").default(0),
    tongThoiGianDaLam: integer("tong_thoi_gian_da_lam").default(0),
    lanBatDau: timestamp("lan_bat_dau"),
    dangLam: boolean("dang_lam").default(false),
    soDuDoan: integer("so_du_doan"),
});

const baiThiChiTiet = thiSchema.table(
    "bai_thi_chi_tiet",
    {
        id: serial("id").primaryKey(),
        baiThiId: integer("bai_thi_id"),
        cauHoiId: integer("cau_hoi_id"),
        dapAnChon: integer("dap_an_chon"),
        dung: boolean("dung"),
        diem: real("diem"),
    },
    (table) => ({
        uqBaiCau: unique("uq_bai_cau").on(table.baiThiId, table.cauHoiId),
    })
);

const baiThiChiTietTuLuan = thiSchema.table(
    "bai_thi_chi_tiet_tu_luan",
    {
        id: serial("id").primaryKey(),
        baiThiId: integer("bai_thi_id"),
        cauHoiId: integer("cau_hoi_id"),
        dapAn: text("dap_an"),
        diem: real("diem"),
    },
    (table) => ({
        uqBaiCauTuLuan: unique("uq_bai_cau_tu_luan").on(table.baiThiId, table.cauHoiId),
    })
);

module.exports = {
    thiSchema,
    cuocThi,
    dotThi,
    tracNghiem,
    tracNghiemDotThi,
    tuLuanDotThi,
    deThi,
    deThiCauHoi,
    baiThi,
    baiThiChiTiet,
    baiThiChiTietTuLuan,
};
