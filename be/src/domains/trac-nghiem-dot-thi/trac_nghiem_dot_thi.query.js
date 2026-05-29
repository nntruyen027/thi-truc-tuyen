const { and, count, eq, sql } = require("drizzle-orm");
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

exports.layDsTracNghiem = async (dotThiId) => {
    const rows = await db
        .select()
        .from(tracNghiemDotThi)
        .where(eq(tracNghiemDotThi.dotThiId, Number(dotThiId)));

    const rowsWithCounts = await Promise.all(
        rows.map(async (row) => {
            const [countRow] = await db
                .select({ total: count() })
                .from(tracNghiem)
                .where(and(
                    eq(tracNghiem.linhVucId, row.linhVucId),
                    eq(tracNghiem.nhomId, row.nhomId),
                    eq(tracNghiem.loaiCauHoi, row.loaiCauHoi || "chon_mot")
                ));

            return {
                ...row,
                soCauKhaDung: Number(countRow?.total || 0),
            };
        })
    );

    return rowsWithCounts.map(mapRow);
};

exports.themTracNghiem = async (dotThiId, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const [created] = await db
        .insert(tracNghiemDotThi)
        .values({
            dotThiId: Number(dotThiId),
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            loaiCauHoi: loai_cau_hoi || "chon_mot",
            soLuong: so_luong,
        })
        .returning();

    return mapRow(created);
};

exports.suaTracNghiem = async (id, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const [updated] = await db
        .update(tracNghiemDotThi)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            loaiCauHoi: loai_cau_hoi || "chon_mot",
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

