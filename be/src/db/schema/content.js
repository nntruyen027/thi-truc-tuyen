const { boolean, index, integer, pgTable, serial, text, timestamp } = require("drizzle-orm/pg-core");

const baiViet = pgTable("bai_viet", {
    id: serial("id").primaryKey(),
    tieuDe: text("tieu_de").notNull(),
    tomTat: text("tom_tat"),
    noiDung: text("noi_dung").notNull(),
    anhDaiDien: text("anh_dai_dien"),
    ngayDang: timestamp("ngay_dang").notNull(),
    trangThai: boolean("trang_thai").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    nguoiTao: integer("nguoi_tao"),
}, (table) => ({
    trangThaiNgayDangIdx: index("bai_viet_trang_thai_ngay_dang_idx").on(table.trangThai, table.ngayDang, table.id),
}));

module.exports = {
    baiViet,
};
