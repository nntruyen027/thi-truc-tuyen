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
    workspaceId: integer("workspace_id"),
    username: varchar("username", { length: 255 }).notNull(),
    password: text("password").notNull(),
    hoTen: varchar("ho_ten", { length: 500 }),
    donViId: integer("don_vi_id"),
    role: varchar("role", { length: 50 }).default("user"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    workspaceIdx: index("auth_users_workspace_id_idx").on(table.workspaceId),
    uqWorkspaceUsername: unique("uq_auth_users_workspace_username").on(table.workspaceId, table.username),
}));

const refreshTokens = authSchema.table("refresh_tokens", {
    id: uuid("id").primaryKey(),
    workspaceId: integer("workspace_id"),
    userId: integer("user_id").notNull(),
    token: text("token"),
    expireAt: timestamp("expire_at"),
    revoked: boolean("revoked").default(false),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    workspaceIdx: index("auth_refresh_tokens_workspace_id_idx").on(table.workspaceId),
    userIdx: index("auth_refresh_tokens_user_id_idx").on(table.userId),
}));

module.exports = {
    authSchema,
    users,
    refreshTokens,
};
