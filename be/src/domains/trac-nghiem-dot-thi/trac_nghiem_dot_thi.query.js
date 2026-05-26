const { and, count, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { tracNghiem, tracNghiemDotThi } = require("../../db/schema");
const pool = require("../../core/config/db");

let hasLoaiCauHoiColumnPromise = null;

async function hasLoaiCauHoiColumn() {
    if (!hasLoaiCauHoiColumnPromise) {
        hasLoaiCauHoiColumnPromise = pool.query(`
            select 1
            from information_schema.columns
            where table_schema = 'thi'
              and table_name = 'trac_nghiem_dot_thi'
              and column_name = 'loai_cau_hoi'
            limit 1
        `).then((result) => result.rows.length > 0)
            .catch(() => false);
    }

    return hasLoaiCauHoiColumnPromise;
}

async function insertLegacyTracNghiemDotThi(workspaceId, dotThiId, linh_vuc_id, nhom_id, so_luong) {
    const result = await pool.query(`
        insert into thi.trac_nghiem_dot_thi (
            workspace_id,
            dot_thi_id,
            linh_vuc_id,
            nhom_id,
            so_luong
        )
        values ($1, $2, $3, $4, $5)
        returning id, workspace_id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
    `, [
        Number(workspaceId),
        Number(dotThiId),
        linh_vuc_id,
        nhom_id,
        so_luong,
    ]);

    const row = result.rows[0];

    return row
        ? {
            id: row.id,
            workspaceId: row.workspace_id,
            dotThiId: row.dot_thi_id,
            linhVucId: row.linh_vuc_id,
            nhomId: row.nhom_id,
            soLuong: row.so_luong,
        }
        : null;
}

async function updateLegacyTracNghiemDotThi(workspaceId, id, linh_vuc_id, nhom_id, so_luong) {
    const result = await pool.query(`
        update thi.trac_nghiem_dot_thi
        set linh_vuc_id = $1,
            nhom_id = $2,
            so_luong = $3
        where workspace_id = $4
          and id = $5
        returning id, workspace_id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
    `, [
        linh_vuc_id,
        nhom_id,
        so_luong,
        Number(workspaceId),
        Number(id),
    ]);

    const row = result.rows[0];

    return row
        ? {
            id: row.id,
            workspaceId: row.workspace_id,
            dotThiId: row.dot_thi_id,
            linhVucId: row.linh_vuc_id,
            nhomId: row.nhom_id,
            soLuong: row.so_luong,
        }
        : null;
}

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
    const hasLoaiColumn = await hasLoaiCauHoiColumn();
    let rows;

    if (hasLoaiColumn) {
        rows = await db
            .select()
            .from(tracNghiemDotThi)
            .where(and(
                eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
                eq(tracNghiemDotThi.dotThiId, Number(dotThiId))
            ));
    } else {
        const result = await pool.query(`
            select id, workspace_id, dot_thi_id, linh_vuc_id, nhom_id, so_luong
            from thi.trac_nghiem_dot_thi
            where workspace_id = $1
              and dot_thi_id = $2
        `, [
            Number(workspaceId),
            Number(dotThiId),
        ]);

        rows = result.rows.map((row) => ({
            id: row.id,
            workspaceId: row.workspace_id,
            dotThiId: row.dot_thi_id,
            linhVucId: row.linh_vuc_id,
            nhomId: row.nhom_id,
            soLuong: row.so_luong,
        }));
    }

    const rowsWithCounts = await Promise.all(
        rows.map(async (row) => {
            const [countRow] = await db
                .select({ total: count() })
                .from(tracNghiem)
                .where(and(
                    eq(tracNghiem.workspaceId, Number(workspaceId)),
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

exports.themTracNghiem = async (workspaceId, dotThiId, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const hasLoaiColumn = await hasLoaiCauHoiColumn();
    let created;

    if (hasLoaiColumn) {
        [created] = await db
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
    } else {
        created = await insertLegacyTracNghiemDotThi(
            workspaceId,
            dotThiId,
            linh_vuc_id,
            nhom_id,
            so_luong
        );
    }

    return mapRow(created);
};

exports.suaTracNghiem = async (workspaceId, id, linh_vuc_id, nhom_id, loai_cau_hoi, so_luong) => {
    const hasLoaiColumn = await hasLoaiCauHoiColumn();
    let updated;

    if (hasLoaiColumn) {
        [updated] = await db
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
    } else {
        updated = await updateLegacyTracNghiemDotThi(
            workspaceId,
            id,
            linh_vuc_id,
            nhom_id,
            so_luong
        );
    }

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

