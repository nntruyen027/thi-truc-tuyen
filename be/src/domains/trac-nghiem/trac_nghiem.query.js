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

function normalizeText(value) {
    return String(value ?? "").trim();
}

function normalizeLookupKey(value) {
    return normalizeText(value)
        .replace(/\s+/g, " ")
        .toLocaleLowerCase("vi");
}

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
            .map((item) => {
                const normalized = String(item).trim().toUpperCase();

                if (["A", "B", "C", "D"].includes(normalized)) {
                    return {
                        A: 1,
                        B: 2,
                        C: 3,
                        D: 4,
                    }[normalized];
                }

                return Number(item);
            })
            .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)
    )].sort((left, right) => left - right);
}

function serializeDapAnNhieu(value) {
    const normalized = normalizeDapAnNhieu(value);
    return normalized.length ? normalized.join(",") : null;
}

function parsePositiveInteger(value, fieldLabel) {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw `${fieldLabel} không hợp lệ.`;
    }

    return parsed;
}

function buildDuplicateLookupKey({ linhVucId, nhomId, loaiCauHoi, cauHoi }) {
    return [
        Number(linhVucId),
        Number(nhomId),
        normalizeLoaiCauHoi(loaiCauHoi),
        normalizeLookupKey(cauHoi),
    ].join("::");
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
        throw "Lĩnh vực hoặc nhóm câu hỏi không tồn tại.";
    }
}

async function buildValidatedQuestionValues(input) {
    const linhVucId = parsePositiveInteger(input.linh_vuc_id, "ID lĩnh vực");
    const nhomId = parsePositiveInteger(input.nhom_id, "ID nhóm câu hỏi");
    await ensureDanhMucThuocWorkspace(linhVucId, nhomId);

    const loaiCauHoi = normalizeLoaiCauHoi(input.loai_cau_hoi);
    const cauHoi = normalizeText(input.cau_hoi);
    const diem = parsePositiveInteger(input.diem, "Điểm mặc định");

    if (!cauHoi) {
        throw "Câu hỏi không được để trống.";
    }

    const baseValues = {
        linhVucId,
        nhomId,
        loaiCauHoi,
        cauHoi,
        diem,
    };

    if (loaiCauHoi === LOAI_CAU_HOI.DIEN_TU) {
        const dapAnText = normalizeText(input.dapAnText);

        if (!dapAnText) {
            throw "Đáp án điền từ không được để trống.";
        }

        return {
            ...baseValues,
            cauA: null,
            cauB: null,
            cauC: null,
            cauD: null,
            dapAn: null,
            dapAnNhieu: null,
            dapAnText,
        };
    }

    const cauA = normalizeText(input.cauA);
    const cauB = normalizeText(input.cauB);
    const cauC = normalizeText(input.cauC);
    const cauD = normalizeText(input.cauD);

    if (!cauA || !cauB || !cauC || !cauD) {
        throw "Câu A, B, C, D không được để trống.";
    }

    if (loaiCauHoi === LOAI_CAU_HOI.CHON_MOT) {
        const dapAn = Number(input.dapAn);

        if (!Number.isInteger(dapAn) || dapAn < 1 || dapAn > 4) {
            throw "Đáp án đúng phải là A, B, C hoặc D.";
        }

        return {
            ...baseValues,
            cauA,
            cauB,
            cauC,
            cauD,
            dapAn,
            dapAnNhieu: null,
            dapAnText: null,
        };
    }

    const dapAnNhieu = normalizeDapAnNhieu(input.dapAnNhieu);

    if (!dapAnNhieu.length) {
        throw "Cần chọn ít nhất 1 đáp án đúng.";
    }

    return {
        ...baseValues,
        cauA,
        cauB,
        cauC,
        cauD,
        dapAn: null,
        dapAnNhieu: serializeDapAnNhieu(dapAnNhieu),
        dapAnText: null,
    };
}

async function findDuplicateQuestion(values) {
    const rows = await db
        .select({
            id: tracNghiem.id,
            cauHoi: tracNghiem.cauHoi,
        })
        .from(tracNghiem)
        .where(and(
            eq(tracNghiem.linhVucId, Number(values.linhVucId)),
            eq(tracNghiem.nhomId, Number(values.nhomId)),
            eq(tracNghiem.loaiCauHoi, values.loaiCauHoi)
        ));

    return rows.find((row) => normalizeLookupKey(row.cauHoi) === normalizeLookupKey(values.cauHoi)) || null;
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
    const values = await buildValidatedQuestionValues({
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
        diem,
    });

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
    const values = await buildValidatedQuestionValues({
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
        diem,
    });
    const [updated] = await db
        .update(tracNghiem)
        .set(values)
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
    const dapAnRaw = normalizeText(r["Đáp án"] || r["dap_an"]).toUpperCase();
    const dapAn = {
        A: 1,
        B: 2,
        C: 3,
        D: 4,
        1: 1,
        2: 2,
        3: 3,
        4: 4,
    }[dapAnRaw] || null;

    const values = await buildValidatedQuestionValues({
        loai_cau_hoi: r["Loại câu hỏi"] || r["loai_cau_hoi"],
        cau_hoi: r["Câu hỏi"] || r["cau_hoi"],
        cauA: r["Câu A"] || r["Câu a"] || r["cau_a"],
        cauB: r["Câu B"] || r["Câu b"] || r["cau_b"],
        cauC: r["Câu C"] || r["Câu c"] || r["cau_c"],
        cauD: r["Câu D"] || r["Câu d"] || r["cau_d"],
        dapAn,
        dapAnNhieu: r["Đáp án nhiều"] || r["dap_an_nhieu"],
        dapAnText: r["Đáp án điền từ"] || r["dap_an_text"],
        linh_vuc_id: r["Lĩnh vực ID"] || r["linh_vuc_id"] || r["Lĩnh vực"],
        nhom_id: r["Nhóm ID"] || r["nhom_id"] || r["Nhóm"],
        diem: r["Điểm mặc định"] || r["diem"],
    });

    const duplicate = await findDuplicateQuestion(values);

    if (duplicate) {
        return {
            status: "skipped",
            duplicateKey: buildDuplicateLookupKey(values),
        };
    }

    await db
        .insert(tracNghiem)
        .values(values);

    return {
        status: "created",
        duplicateKey: buildDuplicateLookupKey(values),
    };
};

exports.LOAI_CAU_HOI = LOAI_CAU_HOI;

