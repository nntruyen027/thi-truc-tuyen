const { pgSchema, serial, varchar } = require("drizzle-orm/pg-core");

const dmChungSchema = pgSchema("dm_chung");

const donVi = dmChungSchema.table("don_vi", {
    id: serial("id").primaryKey(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
});

const linhVuc = dmChungSchema.table("linh_vuc", {
    id: serial("id").primaryKey(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
});

const nhomCauHoi = dmChungSchema.table("nhom_cau_hoi", {
    id: serial("id").primaryKey(),
    ten: varchar("ten", { length: 500 }),
    moTa: varchar("mo_ta", { length: 500 }),
});

module.exports = {
    dmChungSchema,
    donVi,
    linhVuc,
    nhomCauHoi,
};
