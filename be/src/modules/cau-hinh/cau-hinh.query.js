const { and, eq } = require("drizzle-orm");
const db = require("../../db/client");
const { cauHinh, workspaceSettings } = require("../../db/schema");

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
    }

    return layCauHinhGlobal(khoa);
};

exports.suaCauHinh = async (khoa, giaTri, workspaceId = null) => {
    if (workspaceId) {
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
