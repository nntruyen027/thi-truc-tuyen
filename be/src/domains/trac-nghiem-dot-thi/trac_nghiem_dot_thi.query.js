const { and, eq } = require("drizzle-orm");
const db = require("../../db/client");
const { tracNghiemDotThi } = require("../../db/schema");

function mapRow(row) {
    return {
        id: row.id,
        dot_thi_id: row.dotThiId,
        linh_vuc_id: row.linhVucId,
        nhom_id: row.nhomId,
        so_luong: row.soLuong,
    };
}

exports.layDsTracNghiem = async (workspaceId, dotThiId) => {
    const rows = await db
        .select()
        .from(tracNghiemDotThi)
        .where(and(
            eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
            eq(tracNghiemDotThi.dotThiId, Number(dotThiId))
        ));

    return rows.map(mapRow);
};

exports.themTracNghiem = async (workspaceId, dotThiId, linh_vuc_id, nhom_id, so_luong) => {
    const [created] = await db
        .insert(tracNghiemDotThi)
        .values({
            workspaceId: Number(workspaceId),
            dotThiId: Number(dotThiId),
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            soLuong: so_luong,
        })
        .returning();

    return mapRow(created);
};

exports.suaTracNghiem = async (workspaceId, id, linh_vuc_id, nhom_id, so_luong) => {
    const [updated] = await db
        .update(tracNghiemDotThi)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            soLuong: so_luong,
        })
        .where(and(
            eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
            eq(tracNghiemDotThi.id, Number(id))
        ))
        .returning();

    return mapRow(updated);
};

exports.xoaTracNghiem = async (workspaceId, id) => {
    await db
        .delete(tracNghiemDotThi)
        .where(and(
            eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
            eq(tracNghiemDotThi.id, Number(id))
        ));

    return true;
};

