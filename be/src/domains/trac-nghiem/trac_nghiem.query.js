const { and, count, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { linhVuc, nhomCauHoi, tracNghiem } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../core/utils/drizzle");

function mapNested(row) {
    return {
        linh_vuc: row.linh_vuc_id
            ? {
                id: row.linh_vuc_id,
                ten: row.linh_vuc_ten,
                mo_ta: row.linh_vuc_mo_ta,
            }
            : null,
        nhom: row.nhom_id
            ? {
                id: row.nhom_id,
                ten: row.nhom_ten,
                mo_ta: row.nhom_mo_ta,
            }
            : null,
    };
}

function mapRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        linh_vuc_id: row.linhVucId ?? row.linh_vuc_id,
        nhom_id: row.nhomId ?? row.nhom_id,
        cau_hoi: row.cauHoi ?? row.cau_hoi,
        cauA: row.cauA,
        cauB: row.cauB,
        cauC: row.cauC,
        cauD: row.cauD,
        dapAn: row.dapAn,
        diem: row.diem,
        ...mapNested(row),
    };
}

function isMissingWorkspaceColumnError(error) {
    const message = String(error?.message || error || "").toLowerCase();
    return message.includes("workspace_id") && message.includes("does not exist");
}

async function ensureDanhMucThuocWorkspace(workspaceId, linhVucId, nhomId) {
    let linhVucRow;
    let nhomRow;

    try {
        [linhVucRow, nhomRow] = await Promise.all([
            db.select({id: linhVuc.id}).from(linhVuc).where(and(
                eq(linhVuc.workspaceId, Number(workspaceId)),
                eq(linhVuc.id, Number(linhVucId))
            )).limit(1),
            db.select({id: nhomCauHoi.id}).from(nhomCauHoi).where(and(
                eq(nhomCauHoi.workspaceId, Number(workspaceId)),
                eq(nhomCauHoi.id, Number(nhomId))
            )).limit(1),
        ]);
    } catch (error) {
        if (!isMissingWorkspaceColumnError(error)) {
            throw error;
        }

        [linhVucRow, nhomRow] = await Promise.all([
            db.select({id: linhVuc.id}).from(linhVuc).where(eq(linhVuc.id, Number(linhVucId))).limit(1),
            db.select({id: nhomCauHoi.id}).from(nhomCauHoi).where(eq(nhomCauHoi.id, Number(nhomId))).limit(1),
        ]);
    }

    if (!linhVucRow.length || !nhomRow.length) {
        throw "Lĩnh vực hoặc nhóm câu hỏi không thuộc workspace hiện tại.";
    }
}

async function getById(workspaceId, id) {
    let row;

    try {
        [row] = await db
            .select({
                id: tracNghiem.id,
                linhVucId: tracNghiem.linhVucId,
                nhomId: tracNghiem.nhomId,
                cauHoi: tracNghiem.cauHoi,
                cauA: tracNghiem.cauA,
                cauB: tracNghiem.cauB,
                cauC: tracNghiem.cauC,
                cauD: tracNghiem.cauD,
                dapAn: tracNghiem.dapAn,
                diem: tracNghiem.diem,
                linh_vuc_id: linhVuc.id,
                linh_vuc_ten: linhVuc.ten,
                linh_vuc_mo_ta: linhVuc.moTa,
                nhom_id: nhomCauHoi.id,
                nhom_ten: nhomCauHoi.ten,
                nhom_mo_ta: nhomCauHoi.moTa,
            })
            .from(tracNghiem)
            .leftJoin(linhVuc, and(
                eq(tracNghiem.linhVucId, linhVuc.id),
                eq(linhVuc.workspaceId, Number(workspaceId))
            ))
            .leftJoin(nhomCauHoi, and(
                eq(tracNghiem.nhomId, nhomCauHoi.id),
                eq(nhomCauHoi.workspaceId, Number(workspaceId))
            ))
            .where(and(
                eq(tracNghiem.workspaceId, Number(workspaceId)),
                eq(tracNghiem.id, Number(id))
            ))
            .limit(1);
    } catch (error) {
        if (!isMissingWorkspaceColumnError(error)) {
            throw error;
        }

        [row] = await db
            .select({
                id: tracNghiem.id,
                linhVucId: tracNghiem.linhVucId,
                nhomId: tracNghiem.nhomId,
                cauHoi: tracNghiem.cauHoi,
                cauA: tracNghiem.cauA,
                cauB: tracNghiem.cauB,
                cauC: tracNghiem.cauC,
                cauD: tracNghiem.cauD,
                dapAn: tracNghiem.dapAn,
                diem: tracNghiem.diem,
                linh_vuc_id: linhVuc.id,
                linh_vuc_ten: linhVuc.ten,
                linh_vuc_mo_ta: linhVuc.moTa,
                nhom_id: nhomCauHoi.id,
                nhom_ten: nhomCauHoi.ten,
                nhom_mo_ta: nhomCauHoi.moTa,
            })
            .from(tracNghiem)
            .leftJoin(linhVuc, eq(tracNghiem.linhVucId, linhVuc.id))
            .leftJoin(nhomCauHoi, eq(tracNghiem.nhomId, nhomCauHoi.id))
            .where(eq(tracNghiem.id, Number(id)))
            .limit(1);
    }

    return mapRow(row);
}

exports.layDsTracNghiem = async (workspaceId, size, page, search, sortField, sortType) => {
    const paging = normalizePagination({page, size});
    const clauses = [eq(tracNghiem.workspaceId, Number(workspaceId))];

    if (search?.trim()) {
        clauses.push(ilike(tracNghiem.cauHoi, `%${search.trim()}%`));
    }

    const where = and(...clauses);

    const sort = resolveSort({
        sortField,
        sortType,
        columnMap: {
            id: tracNghiem.id,
            cau_hoi: tracNghiem.cauHoi,
            diem: tracNghiem.diem,
        },
        defaultField: "id",
    });

    const rowsQuery = db
        .select({
            id: tracNghiem.id,
            linhVucId: tracNghiem.linhVucId,
            nhomId: tracNghiem.nhomId,
            cauHoi: tracNghiem.cauHoi,
            cauA: tracNghiem.cauA,
            cauB: tracNghiem.cauB,
            cauC: tracNghiem.cauC,
            cauD: tracNghiem.cauD,
            dapAn: tracNghiem.dapAn,
            diem: tracNghiem.diem,
            linh_vuc_id: linhVuc.id,
            linh_vuc_ten: linhVuc.ten,
            linh_vuc_mo_ta: linhVuc.moTa,
            nhom_id: nhomCauHoi.id,
            nhom_ten: nhomCauHoi.ten,
            nhom_mo_ta: nhomCauHoi.moTa,
        })
        .from(tracNghiem)
        .leftJoin(linhVuc, and(
            eq(tracNghiem.linhVucId, linhVuc.id),
            eq(linhVuc.workspaceId, Number(workspaceId))
        ))
        .leftJoin(nhomCauHoi, and(
            eq(tracNghiem.nhomId, nhomCauHoi.id),
            eq(nhomCauHoi.workspaceId, Number(workspaceId))
        ))
        .orderBy(sort.orderBy)
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count()})
        .from(tracNghiem);

    let rows;
    let totalRows;

    try {
        [rows, totalRows] = await Promise.all([
            rowsQuery.where(where),
            totalQuery.where(where),
        ]);
    } catch (error) {
        if (!isMissingWorkspaceColumnError(error)) {
            throw error;
        }

        const legacyClauses = [];

        if (search?.trim()) {
            legacyClauses.push(ilike(tracNghiem.cauHoi, `%${search.trim()}%`));
        }

        const legacyWhere =
            legacyClauses.length === 0
                ? undefined
                : legacyClauses.length === 1
                    ? legacyClauses[0]
                    : and(...legacyClauses);

        const legacyRowsQuery = db
            .select({
                id: tracNghiem.id,
                linhVucId: tracNghiem.linhVucId,
                nhomId: tracNghiem.nhomId,
                cauHoi: tracNghiem.cauHoi,
                cauA: tracNghiem.cauA,
                cauB: tracNghiem.cauB,
                cauC: tracNghiem.cauC,
                cauD: tracNghiem.cauD,
                dapAn: tracNghiem.dapAn,
                diem: tracNghiem.diem,
                linh_vuc_id: linhVuc.id,
                linh_vuc_ten: linhVuc.ten,
                linh_vuc_mo_ta: linhVuc.moTa,
                nhom_id: nhomCauHoi.id,
                nhom_ten: nhomCauHoi.ten,
                nhom_mo_ta: nhomCauHoi.moTa,
            })
            .from(tracNghiem)
            .leftJoin(linhVuc, eq(tracNghiem.linhVucId, linhVuc.id))
            .leftJoin(nhomCauHoi, eq(tracNghiem.nhomId, nhomCauHoi.id))
            .orderBy(sort.orderBy)
            .limit(paging.size)
            .offset(paging.offset);

        [rows, totalRows] = await Promise.all([
            legacyWhere ? legacyRowsQuery.where(legacyWhere) : legacyRowsQuery,
            legacyWhere ? totalQuery.where(legacyWhere) : totalQuery,
        ]);
    }

    return buildPagedResult({
        data: rows.map(mapRow),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.themTracNghiem = async (
    workspaceId,
    linh_vuc_id,
    nhom_id,
    cau_hoi,
    cauA,
    cauB,
    cauC,
    cauD,
    dapAn,
    diem
) => {
    await ensureDanhMucThuocWorkspace(workspaceId, linh_vuc_id, nhom_id);

    const [created] = await db
        .insert(tracNghiem)
        .values({
            workspaceId: Number(workspaceId),
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            cauHoi: cau_hoi,
            cauA,
            cauB,
            cauC,
            cauD,
            dapAn,
            diem,
        })
        .returning({id: tracNghiem.id});

    return getById(workspaceId, created.id);
};

exports.suaTracNghiem = async (
    workspaceId,
    id,
    linh_vuc_id,
    nhom_id,
    cau_hoi,
    cauA,
    cauB,
    cauC,
    cauD,
    dapAn,
    diem
) => {
    await ensureDanhMucThuocWorkspace(workspaceId, linh_vuc_id, nhom_id);

    const [updated] = await db
        .update(tracNghiem)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            cauHoi: cau_hoi,
            cauA,
            cauB,
            cauC,
            cauD,
            dapAn,
            diem,
        })
        .where(and(
            eq(tracNghiem.workspaceId, Number(workspaceId)),
            eq(tracNghiem.id, Number(id))
        ))
        .returning({id: tracNghiem.id});

    if (!updated) {
        throw "Không tồn tại câu hỏi";
    }

    return getById(workspaceId, updated.id);
};

exports.xoaTracNghiem = async (workspaceId, id) => {
    await db
        .delete(tracNghiem)
        .where(and(
            eq(tracNghiem.workspaceId, Number(workspaceId)),
            eq(tracNghiem.id, Number(id))
        ));

    return true;
};

exports.themTracNghiemImport = async (workspaceId, r) => {
    const dapAn = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
    }[String(r["Đáp án"] || "").toUpperCase()] || null;

    await db
        .insert(tracNghiem)
        .values({
            workspaceId: Number(workspaceId),
            cauHoi: r["Câu hỏi"],
            cauA: r["Câu a"],
            cauB: r["Câu b"],
            cauC: r["Câu c"],
            cauD: r["Câu d"],
            dapAn,
            linhVucId: r["Lĩnh vực"],
            nhomId: r["Nhóm"],
            diem: r["Điểm mặc định"],
        });

    return {ok: true};
};

