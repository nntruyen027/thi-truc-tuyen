const { and, count, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const {
    baiThi,
    deThi,
    dotThi,
    cuocThi,
    tracNghiem,
    tracNghiemDotThi,
    tuLuanDotThi,
    linhVuc,
    nhomCauHoi,
} = require("../../db/schema");

function normalizeRequiredId(value, fieldName) {
    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized < 1) {
        throw `${fieldName} không hợp lệ.`;
    }

    return normalized;
}

function normalizeOptionalId(value, fieldName) {
    if (value == null || value === "") {
        return null;
    }

    return normalizeRequiredId(value, fieldName);
}

function normalizeText(value, fieldName, {required = false, maxLength = null} = {}) {
    const normalized =
        typeof value === "string"
            ? value.trim()
            : "";

    if (required && !normalized) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    if (maxLength && normalized.length > maxLength) {
        throw `${fieldName} không được vượt quá ${maxLength} ký tự.`;
    }

    return normalized;
}

function normalizeBoolean(value) {
    return Boolean(value);
}

function normalizeDateValue(value, fieldName) {
    if (!value) {
        throw `Vui lòng nhập ${fieldName}.`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw `${fieldName} không hợp lệ.`;
    }

    return date;
}

function normalizePositiveInteger(value, fieldName, {min = 1, max = null} = {}) {
    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized < min) {
        throw `${fieldName} phải là số nguyên lớn hơn hoặc bằng ${min}.`;
    }

    if (max != null && normalized > max) {
        throw `${fieldName} không được vượt quá ${max}.`;
    }

    return normalized;
}

exports.normalizeDotThiPayload = (payload = {}) => {
    const thoiGianBatDau = normalizeDateValue(payload.thoi_gian_bat_dau, "thời gian bắt đầu");
    const thoiGianKetThuc = normalizeDateValue(payload.thoi_gian_ket_thuc, "thời gian kết thúc");

    if (thoiGianBatDau.getTime() >= thoiGianKetThuc.getTime()) {
        throw "Thời gian kết thúc phải sau thời gian bắt đầu.";
    }

    return {
        ten: normalizeText(payload.ten, "tên đợt thi", {
            required: true,
            maxLength: 255,
        }),
        mo_ta: typeof payload.mo_ta === "string" ? payload.mo_ta.trim() : "",
        so_lan_tham_gia_toi_da: normalizePositiveInteger(payload.so_lan_tham_gia_toi_da, "Số lần thi tối đa"),
        thoi_gian_thi: normalizePositiveInteger(payload.thoi_gian_thi, "Thời gian thi"),
        ty_le_danh_gia_dat: normalizePositiveInteger(payload.ty_le_danh_gia_dat, "Tỷ lệ đạt", {
            min: 0,
            max: 100,
        }),
        thoi_gian_bat_dau: thoiGianBatDau,
        thoi_gian_ket_thuc: thoiGianKetThuc,
        co_tron_cau_hoi: normalizeBoolean(payload.co_tron_cau_hoi),
        cho_phep_luu_bai: normalizeBoolean(payload.cho_phep_luu_bai),
        du_doan: normalizeBoolean(payload.du_doan),
        trang_thai: normalizeBoolean(payload.trang_thai),
    };
};

exports.normalizeTopParam = (top) =>
    normalizePositiveInteger(top, "Số lượng xếp hạng", {
        min: 1,
        max: 100,
    });

exports.normalizePredictionValue = (soDuDoan) => {
    if (soDuDoan == null || soDuDoan === "") {
        return null;
    }

    return normalizePositiveInteger(soDuDoan, "Số dự đoán", {
        min: 0,
        max: 1000000000,
    });
};

exports.ensureRequiredId = normalizeRequiredId;
exports.ensureOptionalId = normalizeOptionalId;

exports.ensurePauseAllowed = async (workspaceId, baiThiId) => {
    const [row] = await db
        .select({
            choPhepLuuBai: dotThi.choPhepLuuBai,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(dotThi, and(
            eq(dotThi.id, deThi.dotThiId),
            eq(dotThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiId))
        ))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy bài thi cần lưu.";
    }

    if (!row.choPhepLuuBai) {
        throw "Đợt thi hiện tại không cho phép lưu và thoát.";
    }
};

exports.layTrangThaiTuLuanTheoDotThi = async (workspaceId, dotThiId) => {
    const [row] = await db
        .select({
            id: dotThi.id,
            coTuLuan: cuocThi.coTuLuan,
        })
        .from(dotThi)
        .innerJoin(cuocThi, and(
            eq(cuocThi.id, dotThi.cuocThiId),
            eq(cuocThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(dotThi.workspaceId, Number(workspaceId)),
            eq(dotThi.id, Number(dotThiId))
        ))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy đợt thi.";
    }

    return {
        dotThiId: row.id,
        coTuLuan: !!row.coTuLuan,
    };
};

async function layTrangThaiTuLuanTheoBaiThi(workspaceId, baiThiId) {
    const [row] = await db
        .select({
            coTuLuan: cuocThi.coTuLuan,
        })
        .from(baiThi)
        .innerJoin(deThi, and(
            eq(deThi.id, baiThi.deThiId),
            eq(deThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(dotThi, and(
            eq(dotThi.id, deThi.dotThiId),
            eq(dotThi.workspaceId, Number(workspaceId))
        ))
        .innerJoin(cuocThi, and(
            eq(cuocThi.id, dotThi.cuocThiId),
            eq(cuocThi.workspaceId, Number(workspaceId))
        ))
        .where(and(
            eq(baiThi.workspaceId, Number(workspaceId)),
            eq(baiThi.id, Number(baiThiId))
        ))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy bài thi.";
    }

    return !!row.coTuLuan;
}

exports.ensureTuLuanAnswerAllowed = async (workspaceId, baiThiId) => {
    const coTuLuan = await layTrangThaiTuLuanTheoBaiThi(workspaceId, baiThiId);

    if (!coTuLuan) {
        throw "Cuộc thi hiện tại không bật phần tự luận.";
    }
};

exports.coChoPhepTraLoiTuLuan = async (workspaceId, baiThiId) => {
    return layTrangThaiTuLuanTheoBaiThi(workspaceId, baiThiId);
};

exports.ensureDotThiWithinCuocThi = async ({
    workspaceId,
    cuocThiId,
    thoiGianBatDau,
    thoiGianKetThuc,
}) => {
    if (!cuocThiId || !thoiGianBatDau || !thoiGianKetThuc) {
        return;
    }

    const [contest] = await db
        .select({
            thoiGianBatDau: cuocThi.thoiGianBatDau,
            thoiGianKetThuc: cuocThi.thoiGianKetThuc,
        })
        .from(cuocThi)
        .where(and(
            eq(cuocThi.workspaceId, Number(workspaceId)),
            eq(cuocThi.id, Number(cuocThiId))
        ))
        .limit(1);

    if (!contest) {
        throw "Không tìm thấy cuộc thi.";
    }

    const dotStart = new Date(thoiGianBatDau).getTime();
    const dotEnd = new Date(thoiGianKetThuc).getTime();
    const contestStart = new Date(contest.thoiGianBatDau).getTime();
    const contestEnd = new Date(contest.thoiGianKetThuc).getTime();

    if (Number.isNaN(dotStart) || Number.isNaN(dotEnd)) {
        throw "Thời gian đợt thi không hợp lệ.";
    }

    if (dotStart < contestStart || dotEnd > contestEnd) {
        throw "Thời gian đợt thi phải nằm trong khoảng thời gian của cuộc thi.";
    }
};

exports.ensureTracNghiemConfigPossible = async ({
    workspaceId,
    dotThiId,
    linhVucId,
    nhomId,
    soLuong,
    ignoreId = null,
}) => {
    if (!dotThiId) {
        throw "Thiếu đợt thi để cấu hình câu hỏi.";
    }

    if (!linhVucId || !nhomId) {
        throw "Vui lòng chọn đủ lĩnh vực và nhóm câu hỏi.";
    }

    if (!Number.isInteger(Number(soLuong)) || Number(soLuong) < 1) {
        throw "Số lượng câu hỏi phải lớn hơn 0.";
    }

    const [availableRow, usedRow] = await Promise.all([
        db
            .select({total: count()})
            .from(tracNghiem)
            .where(and(
                eq(tracNghiem.workspaceId, Number(workspaceId)),
                eq(tracNghiem.linhVucId, Number(linhVucId)),
                eq(tracNghiem.nhomId, Number(nhomId))
            )),
        db
            .select({total: sql`coalesce(sum(${tracNghiemDotThi.soLuong}), 0)::int`})
            .from(tracNghiemDotThi)
            .where(and(
                eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
                eq(tracNghiemDotThi.dotThiId, Number(dotThiId)),
                eq(tracNghiemDotThi.linhVucId, Number(linhVucId)),
                eq(tracNghiemDotThi.nhomId, Number(nhomId)),
                ignoreId != null
                    ? sql`${tracNghiemDotThi.id} <> ${Number(ignoreId)}`
                    : sql`true`
            )),
    ]);

    const available = Number(availableRow[0]?.total || 0);
    const requested = Number(usedRow[0]?.total || 0) + Number(soLuong);

    if (available === 0) {
        throw "Tổ hợp lĩnh vực và nhóm câu hỏi này hiện chưa có ngân hàng câu hỏi.";
    }

    if (requested > available) {
        throw `Cấu hình vượt quá số câu hỏi hiện có. Khả dụng: ${available}, đang cấu hình: ${requested}.`;
    }
};

exports.ensureDotThiQuestionConfigValid = async (workspaceId, dotThiId) => {
    const dotThiInfo = await exports.layTrangThaiTuLuanTheoDotThi(workspaceId, dotThiId);

    const [tracRows, tuLuanRows] = await Promise.all([
        db
            .select({
                id: tracNghiemDotThi.id,
                linhVucId: tracNghiemDotThi.linhVucId,
                nhomId: tracNghiemDotThi.nhomId,
                soLuong: tracNghiemDotThi.soLuong,
                linhVucTen: linhVuc.ten,
                nhomTen: nhomCauHoi.ten,
                soCauKhaDung: sql`(
                    select count(*)::int
                    from thi.trac_nghiem q
                    where q.linh_vuc_id = ${tracNghiemDotThi.linhVucId}
                      and q.nhom_id = ${tracNghiemDotThi.nhomId}
                      and q.workspace_id = ${Number(workspaceId)}
                )`,
            })
            .from(tracNghiemDotThi)
            .leftJoin(linhVuc, and(
                eq(linhVuc.id, tracNghiemDotThi.linhVucId),
                eq(linhVuc.workspaceId, Number(workspaceId))
            ))
            .leftJoin(nhomCauHoi, and(
                eq(nhomCauHoi.id, tracNghiemDotThi.nhomId),
                eq(nhomCauHoi.workspaceId, Number(workspaceId))
            ))
            .where(and(
                eq(tracNghiemDotThi.workspaceId, Number(workspaceId)),
                eq(tracNghiemDotThi.dotThiId, Number(dotThiId))
            )),
        db
            .select({total: count()})
            .from(tuLuanDotThi)
            .where(and(
                eq(tuLuanDotThi.workspaceId, Number(workspaceId)),
                eq(tuLuanDotThi.dotThiId, Number(dotThiId))
            )),
    ]);

    const totalTuLuan = Number(tuLuanRows[0]?.total || 0);
    const totalTuLuanHieuLuc = dotThiInfo.coTuLuan ? totalTuLuan : 0;

    if (!tracRows.length && totalTuLuanHieuLuc === 0) {
        throw "Đợt thi chưa có cấu hình câu hỏi.";
    }

    for (const row of tracRows) {
        if (!row.linhVucId || !row.nhomId) {
            throw "Cấu hình trắc nghiệm còn thiếu lĩnh vực hoặc nhóm câu hỏi.";
        }

        if (!row.soLuong || row.soLuong < 1) {
            throw "Cấu hình trắc nghiệm có số lượng câu hỏi không hợp lệ.";
        }

        if (Number(row.soLuong) > Number(row.soCauKhaDung || 0)) {
            throw `Nhóm "${row.nhomTen || "Chưa chọn nhóm"}" thuộc lĩnh vực "${row.linhVucTen || "Chưa chọn lĩnh vực"}" không đủ câu hỏi. Cần ${row.soLuong}, hiện có ${row.soCauKhaDung}.`;
        }
    }
};

exports.ensureTuLuanAllowed = async (workspaceId, dotThiId) => {
    const info = await exports.layTrangThaiTuLuanTheoDotThi(workspaceId, dotThiId);

    if (!info.coTuLuan) {
        throw "Cuộc thi hiện tại không bật phần tự luận.";
    }
};

