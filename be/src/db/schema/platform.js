const {
    boolean,
    index,
    integer,
    pgSchema,
    serial,
    text,
    timestamp,
    unique,
    varchar,
} = require("drizzle-orm/pg-core");

const platformSchema = pgSchema("platform");

const workspaces = platformSchema.table("workspaces", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    ten: varchar("ten", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    status: varchar("status", { length: 30 }).default("active").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    uqWorkspaceCode: unique("uq_platform_workspace_code").on(table.code),
    uqWorkspaceSlug: unique("uq_platform_workspace_slug").on(table.slug),
}));

const workspaceDomains = platformSchema.table("workspace_domains", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    uqWorkspaceDomain: unique("uq_platform_workspace_domain").on(table.domain),
    workspaceIdx: index("workspace_domains_workspace_id_idx").on(table.workspaceId),
}));

const workspaceSettings = platformSchema.table("workspace_settings", {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id").notNull(),
    khoa: varchar("khoa", { length: 200 }).notNull(),
    giaTri: text("gia_tri"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    uqWorkspaceSetting: unique("uq_platform_workspace_setting").on(table.workspaceId, table.khoa),
    workspaceIdx: index("workspace_settings_workspace_id_idx").on(table.workspaceId),
}));

module.exports = {
    platformSchema,
    workspaces,
    workspaceDomains,
    workspaceSettings,
};
