const { boolean, index, integer, pgTable, serial, text, timestamp } = require("drizzle-orm/pg-core");

const baiViet = pgTable("bai_viet", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
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
    workspaceTrangThaiNgayDangIdx: index("bai_viet_workspace_trang_thai_ngay_dang_idx").on(table.workspaceId, table.trangThai, table.ngayDang, table.id),
}));

module.exports = {
    baiViet,
};
