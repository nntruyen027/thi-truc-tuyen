const { and, eq } = require("drizzle-orm");
const db = require("../../db/client");
const { tuLuanDotThi } = require("../../db/schema");

function mapRow(row) {
    return {
        id: row.id,
        dot_thi_id: row.dotThiId,
        cau_hoi: row.cauHoi,
        goi_y: row.goiY,
    };
}

exports.layDsTuLuan = async (workspaceId, dotThiId) => {
    const rows = await db
        .select()
        .from(tuLuanDotThi)
        .where(and(
            eq(tuLuanDotThi.workspaceId, Number(workspaceId)),
            eq(tuLuanDotThi.dotThiId, Number(dotThiId))
        ));

    return rows.map(mapRow);
};

exports.themTuLuan = async (workspaceId, dotThiId, cau_hoi, goi_y) => {
    const [created] = await db
        .insert(tuLuanDotThi)
        .values({
            workspaceId: Number(workspaceId),
            dotThiId: Number(dotThiId),
            cauHoi: cau_hoi,
            goiY: goi_y,
        })
        .returning();

    return mapRow(created);
};

exports.suaTuLuan = async (workspaceId, id, cau_hoi, goi_y) => {
    const [updated] = await db
        .update(tuLuanDotThi)
        .set({
            cauHoi: cau_hoi,
            goiY: goi_y,
        })
        .where(and(
            eq(tuLuanDotThi.workspaceId, Number(workspaceId)),
            eq(tuLuanDotThi.id, Number(id))
        ))
        .returning();

    return mapRow(updated);
};

exports.xoaTuLuan = async (workspaceId, id) => {
    await db
        .delete(tuLuanDotThi)
        .where(and(
            eq(tuLuanDotThi.workspaceId, Number(workspaceId)),
            eq(tuLuanDotThi.id, Number(id))
        ));

    return true;
};

