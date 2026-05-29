const bcrypt = require("bcrypt");
const { eq, sql } = require("drizzle-orm");

const db = require("../../db/client");
const { users } = require("../../db/schema");

const DEFAULT_SUPER_ADMIN_USERNAME =
    process.env.BOOTSTRAP_SUPER_ADMIN_USERNAME || "admin";
const DEFAULT_SUPER_ADMIN_PASSWORD =
    process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD || "Password@123";
const DEFAULT_SUPER_ADMIN_NAME =
    process.env.BOOTSTRAP_SUPER_ADMIN_NAME || "Quản trị hệ thống";

async function hasAnySuperAdmin() {
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "super_admin"))
        .limit(1);

    return Boolean(existing);
}

async function hasBootstrapAdminUsername() {
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, DEFAULT_SUPER_ADMIN_USERNAME))
        .limit(1);

    return Boolean(existing);
}

exports.ensureBootstrapSuperAdmin = async () => {
    try {
        if (await hasAnySuperAdmin()) {
            return;
        }

        if (await hasBootstrapAdminUsername()) {
            console.warn(
                `[bootstrap] Username "${DEFAULT_SUPER_ADMIN_USERNAME}" already exists but no super_admin found. Skipped automatic bootstrap.`
            );
            return;
        }

        const passwordHash = await bcrypt.hash(DEFAULT_SUPER_ADMIN_PASSWORD, 10);

        await db.execute(sql`
            insert into auth.users (
                workspace_id,
                username,
                password,
                ho_ten,
                role
            ) values (
                null,
                ${DEFAULT_SUPER_ADMIN_USERNAME},
                ${passwordHash},
                ${DEFAULT_SUPER_ADMIN_NAME},
                'super_admin'
            )
        `);

        console.log(
            `[bootstrap] Created default super_admin "${DEFAULT_SUPER_ADMIN_USERNAME}".`
        );
    } catch (error) {
        const message = String(error?.message || error || "");

        if (
            message.includes("relation") &&
            message.includes("auth.users")
        ) {
            console.warn(
                "[bootstrap] Skipped super_admin bootstrap because database schema is not initialized yet."
            );
            return;
        }

        console.error("[bootstrap] Failed to ensure super_admin:", error);
    }
};
