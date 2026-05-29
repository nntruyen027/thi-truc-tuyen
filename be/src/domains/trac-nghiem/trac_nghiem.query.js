const { and, count, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { linhVuc, nhomCauHoi, tracNghiem } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../core/utils/drizzle");

const LOAI_CAU_HOI = {
    CHON_MOT: "chon_mot",
    CHON_NHIEU: "chon_nhieu",
    DIEN_TU: "dien_tu",
};

function normalizeLoaiCauHoi(value) {
    const normalized = String(value || LOAI_CAU_HOI.CHON_MOT).trim().toLowerCase();

    if (Object.values(LOAI_CAU_HOI).includes(normalized)) {
        return normalized;
    }

    return LOAI_CAU_HOI.CHON_MOT;
}

function normalizeDapAnNhieu(value) {
    const items =
        Array.isArray(value)
            ? value
            : String(value || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

    return [...new Set(
        items
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)
    )].sort((left, right) => left - right);
}

function serializeDapAnNhieu(value) {
    const normalized = normalizeDapAnNhieu(value);
    return normalized.length ? normalized.join(",") : null;
}

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
        loai_cau_hoi: row.loaiCauHoi ?? row.loai_cau_hoi ?? LOAI_CAU_HOI.CHON_MOT,
        cau_hoi: row.cauHoi ?? row.cau_hoi,
        cauA: row.cauA,
        cauB: row.cauB,
        cauC: row.cauC,
        cauD: row.cauD,
        dapAn: row.dapAn,
        dapAnNhieu: normalizeDapAnNhieu(row.dapAnNhieu ?? row.dap_an_nhieu),
        dapan_nhieu: normalizeDapAnNhieu(row.dapAnNhieu ?? row.dap_an_nhieu),
        dapAnText: row.dapAnText ?? row.dap_an_text ?? "",
        dapan_text: row.dapAnText ?? row.dap_an_text ?? "",
        diem: row.diem,
        ...mapNested(row),
    };
}

async function ensureDanhMucThuocWorkspace(linhVucId, nhomId) {
    const [linhVucRow, nhomRow] = await Promise.all([
        db.select({id: linhVuc.id}).from(linhVuc).where(eq(linhVuc.id, Number(linhVucId))).limit(1),
        db.select({id: nhomCauHoi.id}).from(nhomCauHoi).where(eq(nhomCauHoi.id, Number(nhomId))).limit(1),
    ]);

    if (!linhVucRow.length || !nhomRow.length) {
        throw "Lĩnh vực hoặc nhóm câu hỏi không thuộc workspace hiện tại.";
    }
}

async function getById(id) {
    const [row] = await db
        .select({
            id: tracNghiem.id,
            linhVucId: tracNghiem.linhVucId,
            nhomId: tracNghiem.nhomId,
            loaiCauHoi: tracNghiem.loaiCauHoi,
            cauHoi: tracNghiem.cauHoi,
            cauA: tracNghiem.cauA,
            cauB: tracNghiem.cauB,
            cauC: tracNghiem.cauC,
            cauD: tracNghiem.cauD,
            dapAn: tracNghiem.dapAn,
            dapAnNhieu: tracNghiem.dapAnNhieu,
            dapAnText: tracNghiem.dapAnText,
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
    const clauses = [];

    if (search?.trim()) {
        clauses.push(ilike(tracNghiem.cauHoi, `%${search.trim()}%`));
    }

    const where =
        clauses.length === 0
            ? undefined
            : clauses.length === 1
                ? clauses[0]
                : and(...clauses);

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
            loaiCauHoi: tracNghiem.loaiCauHoi,
            cauHoi: tracNghiem.cauHoi,
            cauA: tracNghiem.cauA,
            cauB: tracNghiem.cauB,
            cauC: tracNghiem.cauC,
            cauD: tracNghiem.cauD,
            dapAn: tracNghiem.dapAn,
            dapAnNhieu: tracNghiem.dapAnNhieu,
            dapAnText: tracNghiem.dapAnText,
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
    loai_cau_hoi,
    cau_hoi,
    cauA,
    cauB,
    cauC,
    cauD,
    dapAn,
    dapAnNhieu,
    dapAnText,
    diem
) => {
    await ensureDanhMucThuocWorkspace(linh_vuc_id, nhom_id);

    const loaiCauHoi = normalizeLoaiCauHoi(loai_cau_hoi);
    const values = {
        linhVucId: linh_vuc_id,
        nhomId: nhom_id,
        loaiCauHoi,
        cauHoi: cau_hoi,
        cauA: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauA,
        cauB: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauB,
        cauC: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauC,
        cauD: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauD,
        dapAn: loaiCauHoi === LOAI_CAU_HOI.CHON_MOT ? dapAn : null,
        dapAnNhieu: loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU ? serializeDapAnNhieu(dapAnNhieu) : null,
        dapAnText: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? String(dapAnText || "").trim() : null,
        diem,
    };

    const [created] = await db
        .insert(tracNghiem)
        .values(values)
        .returning({id: tracNghiem.id});

    return getById(created.id);
};

exports.suaTracNghiem = async (
    id,
    linh_vuc_id,
    nhom_id,
    loai_cau_hoi,
    cau_hoi,
    cauA,
    cauB,
    cauC,
    cauD,
    dapAn,
    dapAnNhieu,
    dapAnText,
    diem
) => {
    await ensureDanhMucThuocWorkspace(linh_vuc_id, nhom_id);

    const loaiCauHoi = normalizeLoaiCauHoi(loai_cau_hoi);
    const [updated] = await db
        .update(tracNghiem)
        .set({
            linhVucId: linh_vuc_id,
            nhomId: nhom_id,
            loaiCauHoi,
            cauHoi: cau_hoi,
            cauA: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauA,
            cauB: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauB,
            cauC: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauC,
            cauD: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : cauD,
            dapAn: loaiCauHoi === LOAI_CAU_HOI.CHON_MOT ? dapAn : null,
            dapAnNhieu: loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU ? serializeDapAnNhieu(dapAnNhieu) : null,
            dapAnText: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? String(dapAnText || "").trim() : null,
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
    const loaiCauHoi = normalizeLoaiCauHoi(r["Loại câu hỏi"] || r["loai_cau_hoi"]);
    const dapAn = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
    }[String(r["Đáp án"] || "").toUpperCase()] || null;

    const values = {
        loaiCauHoi,
        cauHoi: r["Câu hỏi"],
        cauA: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : r["Câu a"],
        cauB: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : r["Câu b"],
        cauC: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : r["Câu c"],
        cauD: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? null : r["Câu d"],
        dapAn: loaiCauHoi === LOAI_CAU_HOI.CHON_MOT ? dapAn : null,
        dapAnNhieu: loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU ? serializeDapAnNhieu(r["Đáp án nhiều"] || r["dap_an_nhieu"]) : null,
        dapAnText: loaiCauHoi === LOAI_CAU_HOI.DIEN_TU ? String(r["Đáp án điền từ"] || r["dap_an_text"] || "").trim() : null,
        linhVucId: r["Lĩnh vực"],
        nhomId: r["Nhóm"],
        diem: r["Điểm mặc định"],
    };

    await db
        .insert(tracNghiem)
        .values(values);

    return {ok: true};
};

