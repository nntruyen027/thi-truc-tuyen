const { index, integer, pgSchema, serial, varchar } = require("drizzle-orm/pg-core");

const dmChungSchema = pgSchema("dm_chung");

const donVi = dmChungSchema.table("don_vi", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
}, (table) => ({
    workspaceTenIdx: index("don_vi_workspace_ten_idx").on(table.workspaceId, table.ten),
}));

const linhVuc = dmChungSchema.table("linh_vuc", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
}, (table) => ({
    workspaceTenIdx: index("linh_vuc_workspace_ten_idx").on(table.workspaceId, table.ten),
}));

const nhomCauHoi = dmChungSchema.table("nhom_cau_hoi", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
}, (table) => ({
    workspaceTenIdx: index("nhom_cau_hoi_workspace_ten_idx").on(table.workspaceId, table.ten),
}));

module.exports = {
    dmChungSchema,
    donVi,
    linhVuc,
    nhomCauHoi,
};
