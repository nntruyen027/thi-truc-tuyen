const path = require("path");
const fs = require("fs/promises");
const { eq } = require("drizzle-orm");
const db = require("../../db/client");
const { cauHinh, files } = require("../../db/schema");

const FILE_SCOPED_KEYS = new Set([
    "favicon",
    "banner_desktop",
    "banner_mobile",
    "ke_hoach",
    "the_le",
    "document",
]);
const CONFIG_CACHE_TTL_MS = Number(process.env.CAU_HINH_CACHE_TTL_MS || 15000);
const configCache = new Map();
const configInFlight = new Map();

function normalizeUploadPath(value) {
    if (!value || typeof value !== "string") {
        return null;
    }

    const normalized = value.replace(/\\/g, "/").replace(/^\/+/, "");
    return normalized.startsWith("uploads/") ? normalized : null;
}

function extractUploadPathsFromValue(value, bucket = new Set()) {
    const normalized = normalizeUploadPath(value);

    if (normalized) {
        bucket.add(normalized);
        return bucket;
    }

    if (Array.isArray(value)) {
        value.forEach((item) => extractUploadPathsFromValue(item, bucket));
        return bucket;
    }

    if (value && typeof value === "object") {
        Object.values(value).forEach((item) => extractUploadPathsFromValue(item, bucket));
    }

    return bucket;
}

function extractUploadPaths(giaTri) {
    if (!giaTri) {
        return [];
    }

    try {
        const parsed = JSON.parse(giaTri);
        return [...extractUploadPathsFromValue(parsed)];
    } catch {
        const normalized = normalizeUploadPath(giaTri);
        return normalized ? [normalized] : [];
    }
}

async function ensureFilesExist(paths) {
    for (const duongDan of paths) {
        const [fileRow] = await db
            .select({
                id: files.id,
            })
            .from(files)
            .where(eq(files.duongDan, duongDan))
            .limit(1);

        if (!fileRow) {
            throw `File ${duongDan} không tồn tại trên hệ thống hiện tại.`;
        }
    }
}

async function isPathStillReferenced(duongDan, khoa) {
    const globalConfigs = await db
        .select({
            khoa: cauHinh.khoa,
            giaTri: cauHinh.giaTri,
        })
        .from(cauHinh);

    for (const row of globalConfigs) {
        if (row.khoa !== khoa && extractUploadPaths(row.giaTri).includes(duongDan)) {
            return true;
        }
    }

    return false;
}

async function cleanupRemovedFiles({
    oldGiaTri,
    newGiaTri,
    khoa,
}) {
    if (!FILE_SCOPED_KEYS.has(khoa)) {
        return;
    }

    const oldPaths = extractUploadPaths(oldGiaTri);
    const newPaths = new Set(extractUploadPaths(newGiaTri));
    const removedPaths = oldPaths.filter((item) => !newPaths.has(item));

    for (const duongDan of removedPaths) {
        const stillReferenced =
            await isPathStillReferenced(duongDan, khoa);

        if (stillReferenced) {
            continue;
        }

        const [existingFile] = await db
            .select({
                id: files.id,
                duongDan: files.duongDan,
            })
            .from(files)
            .where(eq(files.duongDan, duongDan))
            .limit(1);

        if (!existingFile) {
            continue;
        }

        await db
            .delete(files)
            .where(eq(files.id, existingFile.id));

        const absolutePath = path.resolve(process.cwd(), duongDan);
        await fs.unlink(absolutePath).catch(() => null);
    }
}

function mapConfig(row) {
    if (!row) {
        return null;
    }

    return {
        khoa: row.khoa,
        gia_tri: row.giaTri,
        created_at: row.createdAt || null,
        updated_at: row.updatedAt || null,
    };
}

function readCachedConfig(khoa) {
    const cached = configCache.get(khoa);

    if (!cached) {
        return null;
    }

    if (cached.expiresAt <= Date.now()) {
        configCache.delete(khoa);
        return null;
    }

    return cached.value;
}

function writeCachedConfig(khoa, value) {
    configCache.set(khoa, {
        value,
        expiresAt: Date.now() + Math.max(CONFIG_CACHE_TTL_MS, 0),
    });

    return value;
}

function invalidateCachedConfig(khoa) {
    configCache.delete(khoa);
    configInFlight.delete(khoa);
}

async function fetchCauHinhFromDb(khoa) {
    const [row] = await db
        .select()
        .from(cauHinh)
        .where(eq(cauHinh.khoa, khoa))
        .limit(1);

    return mapConfig(row);
}

exports.layCauHinh = async (khoa) => {
    const cached = readCachedConfig(khoa);

    if (cached) {
        return cached;
    }

    const inFlightTask = configInFlight.get(khoa);

    if (inFlightTask) {
        return inFlightTask;
    }

    const task = fetchCauHinhFromDb(khoa)
        .then((row) => writeCachedConfig(khoa, row))
        .finally(() => {
            configInFlight.delete(khoa);
        });

    configInFlight.set(khoa, task);

    return task;
};

exports.suaCauHinh = async (khoa, giaTri) => {
    const existing = await fetchCauHinhFromDb(khoa);
    const nextPaths = extractUploadPaths(giaTri);

    await ensureFilesExist(nextPaths);

    if (!existing) {
        const [created] = await db
            .insert(cauHinh)
            .values({
                khoa,
                giaTri,
            })
            .returning();

        return writeCachedConfig(khoa, mapConfig(created));
    }

    const [updated] = await db
        .update(cauHinh)
        .set({
            giaTri,
        })
        .where(eq(cauHinh.khoa, khoa))
        .returning();

    await cleanupRemovedFiles({
        oldGiaTri: existing?.gia_tri || "",
        newGiaTri: giaTri,
        khoa,
    });

    invalidateCachedConfig(khoa);

    return writeCachedConfig(khoa, mapConfig(updated));
};
