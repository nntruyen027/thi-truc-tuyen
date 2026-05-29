const bcrypt = require("bcrypt");
const { eq, sql } = require("drizzle-orm");

const db = require("../../db/client");
const { users } = require("../../db/schema");

const DEFAULT_ADMIN_USERNAME =
    process.env.BOOTSTRAP_ADMIN_USERNAME || "admin";
const DEFAULT_ADMIN_PASSWORD =
    process.env.BOOTSTRAP_ADMIN_PASSWORD || "Password@123";
const DEFAULT_ADMIN_NAME =
    process.env.BOOTSTRAP_ADMIN_NAME || "Quản trị hệ thống";

async function hasAnyAdmin() {
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "admin"))
        .limit(1);

    return Boolean(existing);
}

async function hasBootstrapAdminUsername() {
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, DEFAULT_ADMIN_USERNAME))
        .limit(1);

    return Boolean(existing);
}

exports.ensureBootstrapAdmin = async () => {
    try {
        if (await hasAnyAdmin()) {
            return;
        }

        if (await hasBootstrapAdminUsername()) {
            console.warn(
                `[bootstrap] Username "${DEFAULT_ADMIN_USERNAME}" already exists but no admin found. Skipped automatic bootstrap.`
            );
            return;
        }

        const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

        await db.execute(sql`
            insert into auth.users (
                username,
                password,
                ho_ten,
                role
            ) values (
                ${DEFAULT_ADMIN_USERNAME},
                ${passwordHash},
                ${DEFAULT_ADMIN_NAME},
                'admin'
            )
        `);

        console.log(
            `[bootstrap] Created default admin "${DEFAULT_ADMIN_USERNAME}".`
        );
    } catch (error) {
        const message = String(error?.message || error || "");

        if (
            message.includes("relation") &&
            message.includes("auth.users")
        ) {
            console.warn(
                "[bootstrap] Skipped admin bootstrap because database schema is not initialized yet."
            );
            return;
        }

        console.error("[bootstrap] Failed to ensure admin:", error);
    }
};
