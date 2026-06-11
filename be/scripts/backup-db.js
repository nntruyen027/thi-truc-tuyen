require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const DB_HOST = process.env.DB_HOST;
const DB_PORT = String(process.env.DB_PORT || 5432);
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS ?? "";
const DB_NAME = process.env.DB_NAME;
const PG_DUMP_BIN = process.env.PG_DUMP_BIN || "pg_dump";
const BACKUP_DIR = process.env.DB_BACKUP_DIR
    || path.resolve(__dirname, "..", "..", "backups", "postgres");

function formatTimestamp(date = new Date()) {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const parts = Object.fromEntries(
        formatter
            .formatToParts(date)
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, part.value])
    );

    return `${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}`;
}

function ensureConfig() {
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error("Thiếu cấu hình DB_HOST, DB_USER hoặc DB_NAME trong .env");
    }
}

async function ensureBackupDir() {
    await fs.promises.mkdir(BACKUP_DIR, { recursive: true });
}

async function run() {
    ensureConfig();
    await ensureBackupDir();

    const fileName = `thi-truc-tuyen-${DB_NAME}-${formatTimestamp()}.sql.gz`;
    const outputPath = path.join(BACKUP_DIR, fileName);

    await new Promise((resolve, reject) => {
        const dump = spawn(
            PG_DUMP_BIN,
            [
                "--host", DB_HOST,
                "--port", DB_PORT,
                "--username", DB_USER,
                "--dbname", DB_NAME,
                "--clean",
                "--if-exists",
                "--no-owner",
                "--no-privileges",
            ],
            {
                env: {
                    ...process.env,
                    PGPASSWORD: DB_PASS,
                },
                stdio: ["ignore", "pipe", "pipe"],
            }
        );

        const gzip = spawn("gzip", ["-c"], {
            stdio: ["pipe", "pipe", "pipe"],
        });

        const output = fs.createWriteStream(outputPath, { flags: "wx" });
        let stderr = "";

        dump.stdout.pipe(gzip.stdin);
        gzip.stdout.pipe(output);

        dump.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        gzip.stderr.on("data", (chunk) => {
            stderr += chunk.toString();
        });

        const finishWithError = (error) => {
            output.destroy();
            fs.promises.unlink(outputPath).catch(() => null);
            reject(error);
        };

        dump.on("error", finishWithError);
        gzip.on("error", finishWithError);
        output.on("error", finishWithError);

        let dumpClosed = false;
        let gzipClosed = false;
        let dumpExitCode = 0;
        let gzipExitCode = 0;

        const maybeDone = () => {
            if (!dumpClosed || !gzipClosed) {
                return;
            }

            if (dumpExitCode !== 0) {
                finishWithError(new Error(stderr || `pg_dump thất bại với mã ${dumpExitCode}`));
                return;
            }

            if (gzipExitCode !== 0) {
                finishWithError(new Error(stderr || `gzip thất bại với mã ${gzipExitCode}`));
                return;
            }

            resolve();
        };

        dump.on("close", (code) => {
            dumpClosed = true;
            dumpExitCode = Number(code || 0);
            maybeDone();
        });

        gzip.on("close", (code) => {
            gzipClosed = true;
            gzipExitCode = Number(code || 0);
            maybeDone();
        });
    });

    const stat = await fs.promises.stat(outputPath);

    console.log("[db:backup]", JSON.stringify({
        at: new Date().toISOString(),
        fileName,
        outputPath,
        sizeBytes: stat.size,
    }));
}

run().catch((error) => {
    console.error("[db:backup] Failed:", error?.message || error);
    process.exitCode = 1;
});
