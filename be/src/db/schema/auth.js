const {
    boolean,
    integer,
    pgSchema,
    serial,
    text,
    timestamp,
    uuid,
    varchar,
} = require("drizzle-orm/pg-core");

const authSchema = pgSchema("auth");

const users = authSchema.table("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull(),
    password: text("password").notNull(),
    hoTen: varchar("ho_ten", { length: 500 }),
    donViId: integer("don_vi_id"),
    role: varchar("role", { length: 50 }).default("user"),
    createdAt: timestamp("created_at").defaultNow(),
});

const refreshTokens = authSchema.table("refresh_tokens", {
    id: uuid("id").primaryKey(),
    userId: integer("user_id").notNull(),
    token: text("token"),
    expireAt: timestamp("expire_at"),
    revoked: boolean("revoked").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

module.exports = {
    authSchema,
    users,
    refreshTokens,
};
