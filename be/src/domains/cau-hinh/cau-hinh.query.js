const path = require("path");
const fs = require("fs/promises");
const { and, eq, ne } = require("drizzle-orm");
const db = require("../../db/client");
const { baiViet, cauHinh, files, workspaceSettings } = require("../../db/schema");

const TENANT_SCOPED_KEYS = new Set([
    "theme_settings",
    "user_profile_fields",
    "favicon",
    "banner_desktop",
    "banner_mobile",
    "footer_meta",
    "left_footer",
    "right_footer",
    "van-ban-ban-quyen",
    "ke_hoach",
    "the_le",
    "document",
    "giai_thuong_cuoc_thi",
]);

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

async function assertFilesBelongToWorkspace(paths, workspaceId) {
    if (!workspaceId || !paths.length) {
        return;
    }

    for (const duongDan of paths) {
        const [fileRow] = await db
            .select({
                id: files.id,
                workspaceId: files.workspaceId,
            })
            .from(files)
            .where(eq(files.duongDan, duongDan))
            .limit(1);

        if (!fileRow) {
            throw `File ${duongDan} không tồn tại trên hệ thống hiện tại.`;
        }

        if (Number(fileRow.workspaceId) !== Number(workspaceId)) {
            throw `File ${duongDan} không thuộc workspace hiện tại.`;
        }
    }
}

async function isPathStillReferenced(duongDan, workspaceId, khoa) {
    const otherWorkspaceConfigs = await db
        .select({
            id: workspaceSettings.id,
            giaTri: workspaceSettings.giaTri,
        })
        .from(workspaceSettings)
        .where(and(
            eq(workspaceSettings.workspaceId, Number(workspaceId)),
            ne(workspaceSettings.khoa, khoa)
        ));

    for (const row of otherWorkspaceConfigs) {
        if (extractUploadPaths(row.giaTri).includes(duongDan)) {
            return true;
        }
    }

    const globalConfigs = await db
        .select({
            id: cauHinh.id,
            giaTri: cauHinh.giaTri,
        })
        .from(cauHinh);

    for (const row of globalConfigs) {
        if (extractUploadPaths(row.giaTri).includes(duongDan)) {
            return true;
        }
    }

    const baiVietRows = await db
        .select({
            anhDaiDien: baiViet.anhDaiDien,
            noiDung: baiViet.noiDung,
        })
        .from(baiViet)
        .where(eq(baiViet.workspaceId, Number(workspaceId)));

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
    workspaceId,
    khoa,
}) {
    if (!workspaceId || !FILE_SCOPED_KEYS.has(khoa)) {
        return;
    }

    const oldPaths = extractUploadPaths(oldGiaTri);
    const newPaths = new Set(extractUploadPaths(newGiaTri));
    const removedPaths = oldPaths.filter((item) => !newPaths.has(item));

    for (const duongDan of removedPaths) {
        const stillReferenced =
            await isPathStillReferenced(duongDan, workspaceId, khoa);

        if (stillReferenced) {
            continue;
        }

        const [existingFile] = await db
            .select({
                id: files.id,
                workspaceId: files.workspaceId,
                duongDan: files.duongDan,
            })
            .from(files)
            .where(and(
                eq(files.workspaceId, Number(workspaceId)),
                eq(files.duongDan, duongDan)
            ))
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
        workspace_id: row.workspaceId || null,
        created_at: row.createdAt || null,
        updated_at: row.updatedAt || null,
    };
}

async function layCauHinhGlobal(khoa) {
    const [row] = await db
        .select()
        .from(cauHinh)
        .where(eq(cauHinh.khoa, khoa))
        .limit(1);

    return mapConfig(row);
}

async function layCauHinhTheoWorkspace(khoa, workspaceId) {
    const [row] = await db
        .select()
        .from(workspaceSettings)
        .where(and(
            eq(workspaceSettings.khoa, khoa),
            eq(workspaceSettings.workspaceId, Number(workspaceId))
        ))
        .limit(1);

    return mapConfig(row);
}

exports.layCauHinh = async (khoa, workspaceId = null) => {
    if (workspaceId) {
        const workspaceValue =
            await layCauHinhTheoWorkspace(khoa, workspaceId);

        if (workspaceValue) {
            return workspaceValue;
        }

        if (TENANT_SCOPED_KEYS.has(khoa)) {
            return null;
        }
    }

    return layCauHinhGlobal(khoa);
};

exports.suaCauHinh = async (khoa, giaTri, workspaceId = null) => {
    if (TENANT_SCOPED_KEYS.has(khoa) && !workspaceId) {
        throw "Không xác định được workspace hiện tại.";
    }

    if (workspaceId) {
        const existing =
            await layCauHinhTheoWorkspace(khoa, workspaceId);
        const nextPaths = extractUploadPaths(giaTri);

        await assertFilesBelongToWorkspace(nextPaths, workspaceId);

        const [saved] = await db
            .insert(workspaceSettings)
            .values({
                workspaceId: Number(workspaceId),
                khoa,
                giaTri,
            })
            .onConflictDoUpdate({
                target: [workspaceSettings.workspaceId, workspaceSettings.khoa],
                set: {
                    giaTri,
                    updatedAt: new Date(),
                },
            })
            .returning();

        await cleanupRemovedFiles({
            oldGiaTri: existing?.gia_tri || "",
            newGiaTri: giaTri,
            workspaceId,
            khoa,
        });

        return mapConfig(saved);
    }

    const existing = await layCauHinhGlobal(khoa);

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

    return mapConfig(updated);
};

