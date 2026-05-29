const path = require("path");
const fs = require("fs/promises");
const { eq } = require("drizzle-orm");
const db = require("../../db/client");
const { baiViet, cauHinh, files } = require("../../db/schema");

const FILE_SCOPED_KEYS = new Set([
    "favicon",
    "banner_desktop",
    "banner_mobile",
    "ke_hoach",
    "the_le",
    "document",
]);

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

    const baiVietRows = await db
        .select({
            anhDaiDien: baiViet.anhDaiDien,
            noiDung: baiViet.noiDung,
        })
        .from(baiViet);

    for (const row of baiVietRows) {
        if (row.anhDaiDien === duongDan) {
            return true;
        }

        if (String(row.noiDung || "").includes(duongDan)) {
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

exports.layCauHinh = async (khoa) => {
    const [row] = await db
        .select()
        .from(cauHinh)
        .where(eq(cauHinh.khoa, khoa))
        .limit(1);

    return mapConfig(row);
};

exports.suaCauHinh = async (khoa, giaTri) => {
    const existing = await exports.layCauHinh(khoa);
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

        return mapConfig(created);
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

    return mapConfig(updated);
};
