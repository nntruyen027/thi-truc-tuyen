require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.resolve(__dirname, "..");
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const DRIZZLE_FILES = [
    "drizzle/0000_sloppy_cobalt_man.sql",
    "drizzle/0001_silky_iron_monger.sql",
    "drizzle/0002_schema_alignment.sql",
    "drizzle/0003_workspace_foundation.sql",
    "drizzle/0004_query_indexes.sql",
    "drizzle/0005_multitenant_scope.sql",
    "drizzle/0006_workspace_enforcement.sql",
    "drizzle/0007_trac_nghiem_dot_thi_loai_cau_hoi.sql",
];

function getBaseConfig(database) {
    return {
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database,
    };
}

async function withClient(database, handler) {
    const client = new Client(getBaseConfig(database));
    await client.connect();

    try {
        return await handler(client);
    } finally {
        await client.end();
    }
}

async function ensureDatabase() {
    await withClient("postgres", async (client) => {
        const escapedName = DB_NAME.replace(/"/g, "\"\"");
        const existsResult = await client.query(
            "SELECT 1 FROM pg_database WHERE datname = $1 LIMIT 1",
            [DB_NAME]
        );

        if (existsResult.rowCount > 0) {
            console.log(`[db:init] Database "${DB_NAME}" already exists.`);
            return;
        }

        await client.query(`CREATE DATABASE "${escapedName}"`);
        console.log(`[db:init] Created database "${DB_NAME}".`);
    });
}

async function executeSqlFile(client, relativeFilePath) {
    const absoluteFilePath = path.join(ROOT, relativeFilePath);
    const sql = await fs.readFile(absoluteFilePath, "utf8");

    console.log(`[db:init] Running ${relativeFilePath}`);
    await client.query(sql);
}

async function hasCoreSchema(client) {
    const result = await client.query(`
        SELECT
            to_regclass('auth.users') AS auth_users,
            to_regclass('platform.workspaces') AS platform_workspaces
    `);

    const row = result.rows[0] || {};

    return Boolean(row.auth_users && row.platform_workspaces);
}

async function listSqlFiles(relativeDir) {
    const absoluteDir = path.join(ROOT, relativeDir);
    let entries = [];

    try {
        entries = await fs.readdir(absoluteDir, { withFileTypes: true });
    } catch (error) {
        if (error?.code === "ENOENT") {
            return [];
        }

        throw error;
    }

    const files = [];

    for (const entry of entries) {
        const entryRelativePath = path.join(relativeDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await listSqlFiles(entryRelativePath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".sql")) {
            files.push(entryRelativePath);
        }
    }

    return files.sort((left, right) => {
        const depthDiff =
            left.split(path.sep).length - right.split(path.sep).length;

        if (depthDiff !== 0) {
            return depthDiff;
        }

        return left.localeCompare(right);
    });
}

async function run() {
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error("Thiếu cấu hình DB trong file .env");
    }

    await ensureDatabase();

    await withClient(DB_NAME, async (client) => {
        const schemaReady = await hasCoreSchema(client);

        if (!schemaReady) {
            for (const file of DRIZZLE_FILES) {
                await executeSqlFile(client, file);
            }
        } else {
            console.log("[db:init] Core schema already exists. Skip drizzle bootstrap files.");
        }

        const functionFiles = await listSqlFiles("sql/functions");
        const procedureFiles = await listSqlFiles("sql/procedures");
        const viewFiles = await listSqlFiles("sql/views");

        for (const file of functionFiles) {
            await executeSqlFile(client, file);
        }

        for (const file of procedureFiles) {
            await executeSqlFile(client, file);
        }

        for (const file of viewFiles) {
            await executeSqlFile(client, file);
        }
    });

    console.log("[db:init] Database initialization completed.");
    console.log(
        '[db:init] Khi backend khởi động, nếu chưa có super_admin thì sẽ tự tạo tài khoản "admin / Password@123".'
    );
}

run().catch((error) => {
    console.error("[db:init] Failed:", error);
    process.exitCode = 1;
});
