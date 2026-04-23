const { eq } = require("drizzle-orm");
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

exports.layDsTracNghiem = async (dotThiId) => {
    const rows = await db
        .select()
        .from(tracNghiemDotThi)
        .where(eq(tracNghiemDotThi.dotThiId, Number(dotThiId)));

    return rows.map(mapRow);
};

exports.themTracNghiem = async (dotThiId, linh_vuc_id, nhom_id, so_luong) => {
    const [created] = await db
        .insert(tracNghiemDotThi)
        .values({
            dotThiId: Number(dotThiId),
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            soLuong: so_luong,
        })
        .returning();

    return mapRow(created);
};

exports.suaTracNghiem = async (id, linh_vuc_id, nhom_id, so_luong) => {
    const [updated] = await db
        .update(tracNghiemDotThi)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            soLuong: so_luong,
        })
        .where(eq(tracNghiemDotThi.id, Number(id)))
        .returning();

    return mapRow(updated);
};

exports.xoaTracNghiem = async (id) => {
    await db
        .delete(tracNghiemDotThi)
        .where(eq(tracNghiemDotThi.id, Number(id)));

    return true;
};

