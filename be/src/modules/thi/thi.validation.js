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

exports.ensurePauseAllowed = async (baiThiId) => {
    const [row] = await db
        .select({
            choPhepLuuBai: dotThi.choPhepLuuBai,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .where(eq(baiThi.id, Number(baiThiId)))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy bài thi cần lưu.";
    }

    if (!row.choPhepLuuBai) {
        throw "Đợt thi hiện tại không cho phép lưu và thoát.";
    }
};

exports.layTrangThaiTuLuanTheoDotThi = async (dotThiId) => {
    const [row] = await db
        .select({
            id: dotThi.id,
            coTuLuan: cuocThi.coTuLuan,
        })
        .from(dotThi)
        .innerJoin(cuocThi, eq(cuocThi.id, dotThi.cuocThiId))
        .where(eq(dotThi.id, Number(dotThiId)))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy đợt thi.";
    }

    return {
        dotThiId: row.id,
        coTuLuan: !!row.coTuLuan,
    };
};

async function layTrangThaiTuLuanTheoBaiThi(baiThiId) {
    const [row] = await db
        .select({
            coTuLuan: cuocThi.coTuLuan,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .innerJoin(cuocThi, eq(cuocThi.id, dotThi.cuocThiId))
        .where(eq(baiThi.id, Number(baiThiId)))
        .limit(1);

    if (!row) {
        throw "Không tìm thấy bài thi.";
    }

    return !!row.coTuLuan;
}

exports.ensureTuLuanAnswerAllowed = async (baiThiId) => {
    const coTuLuan = await layTrangThaiTuLuanTheoBaiThi(baiThiId);

    if (!coTuLuan) {
        throw "Cuộc thi hiện tại không bật phần tự luận.";
    }
};

exports.coChoPhepTraLoiTuLuan = async (baiThiId) => {
    return layTrangThaiTuLuanTheoBaiThi(baiThiId);
};

exports.ensureDotThiWithinCuocThi = async ({
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
        .where(eq(cuocThi.id, Number(cuocThiId)))
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
                eq(tracNghiem.linhVucId, Number(linhVucId)),
                eq(tracNghiem.nhomId, Number(nhomId))
            )),
        db
            .select({total: sql`coalesce(sum(${tracNghiemDotThi.soLuong}), 0)::int`})
            .from(tracNghiemDotThi)
            .where(and(
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

exports.ensureDotThiQuestionConfigValid = async (dotThiId) => {
    const dotThiInfo = await exports.layTrangThaiTuLuanTheoDotThi(dotThiId);

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
                )`,
            })
            .from(tracNghiemDotThi)
            .leftJoin(linhVuc, eq(linhVuc.id, tracNghiemDotThi.linhVucId))
            .leftJoin(nhomCauHoi, eq(nhomCauHoi.id, tracNghiemDotThi.nhomId))
            .where(eq(tracNghiemDotThi.dotThiId, Number(dotThiId))),
        db
            .select({total: count()})
            .from(tuLuanDotThi)
            .where(eq(tuLuanDotThi.dotThiId, Number(dotThiId))),
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

exports.ensureTuLuanAllowed = async (dotThiId) => {
    const info = await exports.layTrangThaiTuLuanTheoDotThi(dotThiId);

    if (!info.coTuLuan) {
        throw "Cuộc thi hiện tại không bật phần tự luận.";
    }
};

