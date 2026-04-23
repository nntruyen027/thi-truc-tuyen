const { and, count, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { linhVuc, nhomCauHoi, tracNghiem } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../utils/drizzle");

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

async function getById(id) {
    const [row] = await db
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

    return mapRow(row);
}

exports.layDsTracNghiem = async (size, page, search, sortField, sortType) => {
    const paging = normalizePagination({page, size});
    const where = search?.trim()
        ? ilike(tracNghiem.cauHoi, `%${search.trim()}%`)
        : undefined;

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
        .leftJoin(linhVuc, eq(tracNghiem.linhVucId, linhVuc.id))
        .leftJoin(nhomCauHoi, eq(tracNghiem.nhomId, nhomCauHoi.id))
        .orderBy(sort.orderBy)
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count()})
        .from(tracNghiem);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return buildPagedResult({
        data: rows.map(mapRow),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.themTracNghiem = async (
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
    const [created] = await db
        .insert(tracNghiem)
        .values({
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

    return getById(created.id);
};

exports.suaTracNghiem = async (
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
        .where(eq(tracNghiem.id, Number(id)))
        .returning({id: tracNghiem.id});

    if (!updated) {
        throw "Không tồn tại câu hỏi";
    }

    return getById(updated.id);
};

exports.xoaTracNghiem = async (id) => {
    await db
        .delete(tracNghiem)
        .where(eq(tracNghiem.id, Number(id)));

    return true;
};

exports.themTracNghiemImport = async (r) => {
    const dapAn = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
    }[String(r["Đáp án"] || "").toUpperCase()] || null;

    await db
        .insert(tracNghiem)
        .values({
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

