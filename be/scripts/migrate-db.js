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
const LAST_PRE_SINGLE_TENANT_MIGRATION = "0007_trac_nghiem_dot_thi_loai_cau_hoi.sql";
const LAST_PRE_DROP_WORKSPACE_MIGRATION = "0009_single_tenant_schema.sql";

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
            return;
        }

        await client.query(`CREATE DATABASE "${escapedName}"`);
    });
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

    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
        .map((entry) => path.join(relativeDir, entry.name))
        .sort((left, right) => left.localeCompare(right));
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

async function hasCoreSchema(client) {
    const result = await client.query(`
        select
            to_regclass('auth.users') as auth_users,
            to_regclass('public.cau_hinh') as app_config
    `);

    const row = result.rows[0] || {};

    return Boolean(row.auth_users && row.app_config);
}

async function getAppliedMigrations(client) {
    const result = await client.query(
        `select file_name from ${MIGRATIONS_TABLE} order by file_name asc`
    );

    return new Set(result.rows.map((row) => row.file_name));
}

async function detectWorkspaceState(client) {
    const result = await client.query(`
        select
            exists (
                select 1
                from information_schema.columns
                where table_schema = 'thi'
                  and table_name = 'cuoc_thi'
                  and column_name = 'workspace_id'
            ) as has_workspace_columns,
            exists (
                select 1
                from information_schema.schemata
                where schema_name = 'platform'
            ) as has_platform_schema
    `);

    const row = result.rows[0] || {};

    return {
        hasWorkspaceColumns: Boolean(row.has_workspace_columns),
        hasPlatformSchema: Boolean(row.has_platform_schema),
    };
}

function baselineFilesForState(migrationFiles, state) {
    if (!state.coreSchema) {
        return [];
    }

    if (!state.hasWorkspaceColumns) {
        return migrationFiles;
    }

    const lastBaselineFile = state.hasPlatformSchema
        ? LAST_PRE_SINGLE_TENANT_MIGRATION
        : LAST_PRE_DROP_WORKSPACE_MIGRATION;

    return migrationFiles.filter(
        (file) => path.basename(file).localeCompare(lastBaselineFile) <= 0
    );
}

async function executeSqlFile(client, relativeFilePath) {
    const absoluteFilePath = path.join(ROOT, relativeFilePath);
    const sql = await fs.readFile(absoluteFilePath, "utf8");

    console.log(`[db:migrate] Running ${relativeFilePath}`);
    await client.query(sql);
}

async function recordMigration(client, relativeFilePath) {
    await client.query(
        `insert into ${MIGRATIONS_TABLE} (file_name) values ($1) on conflict (file_name) do nothing`,
        [relativeFilePath]
    );
}

async function run() {
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error("Thiếu cấu hình DB trong file .env");
    }

    await ensureDatabase();

    const migrationFiles = await listSqlFiles("drizzle");

    await withClient(DB_NAME, async (client) => {
        await ensureMigrationsTable(client);
        const applied = await getAppliedMigrations(client);

        if (applied.size === 0) {
            const [coreSchema, workspaceState] = await Promise.all([
                hasCoreSchema(client),
                detectWorkspaceState(client),
            ]);
            const baselineFiles = baselineFilesForState(migrationFiles, {
                coreSchema,
                ...workspaceState,
            });

            if (baselineFiles.length > 0) {
                console.log(
                    `[db:migrate] Baseline existing schema with ${baselineFiles.length} migration(s).`
                );

                for (const file of baselineFiles) {
                    await recordMigration(client, file);
                    applied.add(file);
                }
            }
        }

        for (const file of migrationFiles) {
            if (applied.has(file)) {
                continue;
            }

            await executeSqlFile(client, file);
            await recordMigration(client, file);
        }
    });

    console.log("[db:migrate] Completed.");
}

run().catch((error) => {
    console.error("[db:migrate] Failed:", error);
    process.exitCode = 1;
});
