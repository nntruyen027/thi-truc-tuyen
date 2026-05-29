const {
    boolean,
    index,
    integer,
    pgSchema,
    serial,
    text,
    timestamp,
    unique,
    uuid,
    varchar,
} = require("drizzle-orm/pg-core");

const authSchema = pgSchema("auth");

const users = authSchema.table("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: text("password").notNull(),
    hoTen: varchar("ho_ten", { length: 500 }),
    diaChiDong1: varchar("dia_chi_dong_1", { length: 500 }),
    xaPhuong: varchar("xa_phuong", { length: 255 }),
    tinhThanh: varchar("tinh_thanh", { length: 255 }),
    ngheNghiep: varchar("nghe_nghiep", { length: 100 }),
    doiTuong: varchar("doi_tuong", { length: 100 }),
    donViId: integer("don_vi_id"),
    role: varchar("role", { length: 50 }).default("user"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    uqUsername: unique("uq_auth_users_username").on(table.username),
}));

const refreshTokens = authSchema.table("refresh_tokens", {
    id: uuid("id").primaryKey(),
    userId: integer("user_id").notNull(),
    token: text("token"),
    expireAt: timestamp("expire_at"),
    revoked: boolean("revoked").default(false),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    userIdx: index("auth_refresh_tokens_user_id_idx").on(table.userId),
}));

module.exports = {
    authSchema,
    users,
    refreshTokens,
};
