const { index, integer, pgSchema, serial, timestamp, varchar } = require("drizzle-orm/pg-core");

const fileSchema = pgSchema("file");

const files = fileSchema.table("file", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    ten: varchar("ten", { length: 500 }),
    tenGoc: varchar("ten_goc", { length: 500 }),
    duongDan: varchar("duong_dan", { length: 1000 }),
    loai: varchar("loai", { length: 100 }),
    kichThuoc: integer("kich_thuoc"),
    nguoiTao: integer("nguoi_tao"),
    thoiGianTao: timestamp("thoi_gian_tao").defaultNow(),
}, (table) => ({
    workspaceTimeIdx: index("file_workspace_thoi_gian_tao_idx").on(table.workspaceId, table.thoiGianTao, table.id),
}));

module.exports = {
    fileSchema,
    files,
};
