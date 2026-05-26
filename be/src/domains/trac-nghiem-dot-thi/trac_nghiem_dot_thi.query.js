const { and, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { tracNghiem, tracNghiemDotThi } = require("../../db/schema");

function mapRow(row) {
    return {
        id: row.id,
        dot_thi_id: row.dotThiId,
        linh_vuc_id: row.linhVucId,
        nhom_id: row.nhomId,
        loai_cau_hoi: row.loaiCauHoi || "chon_mot",
        so_luong: row.soLuong,
        so_cau_kha_dung: Number(row.soCauKhaDung || 0),
    };
}

exports.layDsTracNghiem = async (workspaceId, dotThiId) => {
    const rows = await db
        .select({
            id: tracNghiemDotThi.id,
            dotThiId: tracNghiemDotThi.dotThiId,
            linhVucId: tracNghiemDotThi.linhVucId,
            nhomId: tracNghiemDotThi.nhomId,
            loaiCauHoi: tracNghiemDotThi.loaiCauHoi,
            soLuong: tracNghiemDotThi.soLuong,
            soCauKhaDung: sql`(
                select count(*)::int
                from ${tracNghiem} q
                where q.workspace_id = ${Number(workspaceId)}
                  and q.linh_vuc_id = ${tracNghiemDotThi.linhVucId}
                  and q.nhom_id = ${tracNghiemDotThi.nhomId}
                  and q.loai_cau_hoi = coalesce(${tracNghiemDotThi.loaiCauHoi}, 'chon_mot')
            )`,
        })
        .from(tracNghiemDotThi)
        .where(and(
            eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
            eq(tracNghiemDotThi.dotThiId, Number(dotThiId))
        ));

    return rows.map(mapRow);
};

exports.themTracNghiem = async (workspaceId, dotThiId, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const [created] = await db
        .insert(tracNghiemDotThi)
        .values({
            workspaceId: Number(workspaceId),
            dotThiId: Number(dotThiId),
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            loaiCauHoi: loai_cau_hoi || "chon_mot",
            soLuong: so_luong,
        })
        .returning();

    return mapRow(created);
};

exports.suaTracNghiem = async (workspaceId, id, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const [updated] = await db
        .update(tracNghiemDotThi)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            loaiCauHoi: loai_cau_hoi || "chon_mot",
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

