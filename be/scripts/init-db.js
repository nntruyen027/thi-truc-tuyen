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
const MIGRATIONS_TABLE = "public.app_schema_migrations";

const SAFE_TABLE_PATCH_FILES = [
    "sql/tables/2026_05_21_ho_tro_loai_cau_hoi_moi.sql",
];

function toMigrationPath(...parts) {
    return parts.join("/").replace(/\\/g, "/");
}

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

async function ensureMigrationsTable(client) {
    await client.query(`
        create table if not exists ${MIGRATIONS_TABLE} (
            id serial primary key,
            file_name varchar(255) not null unique,
            applied_at timestamp not null default now()
        )
    `);
}

async function recordMigration(client, relativeFilePath) {
    await client.query(
        `insert into ${MIGRATIONS_TABLE} (file_name) values ($1) on conflict (file_name) do nothing`,
        [relativeFilePath]
    );
}

async function hasCoreSchema(client) {
    const result = await client.query(`
        SELECT
            to_regclass('auth.users') AS auth_users,
            to_regclass('public.cau_hinh') AS app_config
    `);

    const row = result.rows[0] || {};

    return Boolean(row.auth_users && row.app_config);
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
        const normalizedEntryRelativePath = toMigrationPath(relativeDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await listSqlFiles(entryRelativePath));
            continue;
        }

        if (entry.isFile() && entry.name.endsWith(".sql")) {
            files.push(normalizedEntryRelativePath);
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
        await ensureMigrationsTable(client);
        const schemaReady = await hasCoreSchema(client);
        const drizzleFiles = await listSqlFiles("drizzle");

        if (!schemaReady) {
            for (const file of drizzleFiles) {
                await executeSqlFile(client, file);
                await recordMigration(client, file);
            }
        } else {
            console.log("[db:init] Core schema already exists. Skip drizzle bootstrap files.");
        }

        const functionFiles = await listSqlFiles("sql/functions");
        const procedureFiles = await listSqlFiles("sql/procedures");
        const viewFiles = await listSqlFiles("sql/views");
        const patchFiles = await listSqlFiles("sql/patches");

        for (const file of SAFE_TABLE_PATCH_FILES) {
            await executeSqlFile(client, file);
        }

        for (const file of patchFiles) {
            await executeSqlFile(client, file);
        }

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
