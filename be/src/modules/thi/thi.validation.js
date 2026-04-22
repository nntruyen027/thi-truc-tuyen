const db = require("../../config/db");

exports.ensurePauseAllowed = async (baiThiId) => {
    const {rows} = await db.query(
        `
            select dt.cho_phep_luu_bai
            from thi.bai_thi b
                     join thi.de_thi d on d.id = b.de_thi_id
                     join thi.dot_thi dt on dt.id = d.dot_thi_id
            where b.id = $1
            limit 1
        `,
        [baiThiId]
    );

    const row = rows[0];

    if (!row) {
        throw "Không tìm thấy bài thi cần lưu.";
    }

    if (!row.cho_phep_luu_bai) {
        throw "Đợt thi hiện tại không cho phép lưu và thoát.";
    }
};

exports.ensureDotThiWithinCuocThi = async ({
    cuocThiId,
    thoiGianBatDau,
    thoiGianKetThuc,
}) => {
    if (!cuocThiId || !thoiGianBatDau || !thoiGianKetThuc) {
        return;
    }

    const {rows} = await db.query(
        `
            select thoi_gian_bat_dau,
                   thoi_gian_ket_thuc
            from thi.cuoc_thi
            where id = $1
            limit 1
        `,
        [cuocThiId]
    );

    const cuocThi = rows[0];

    if (!cuocThi) {
        throw "Không tìm thấy cuộc thi.";
    }

    const dotStart = new Date(thoiGianBatDau).getTime();
    const dotEnd = new Date(thoiGianKetThuc).getTime();
    const cuocThiStart = new Date(cuocThi.thoi_gian_bat_dau).getTime();
    const cuocThiEnd = new Date(cuocThi.thoi_gian_ket_thuc).getTime();

    if (Number.isNaN(dotStart) || Number.isNaN(dotEnd)) {
        throw "Thời gian đợt thi không hợp lệ.";
    }

    if (dotStart < cuocThiStart || dotEnd > cuocThiEnd) {
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

    const {rows: availableRows} = await db.query(
        `
            select count(*)::int as total
            from thi.trac_nghiem
            where linh_vuc_id = $1
              and nhom_id = $2
        `,
        [linhVucId, nhomId]
    );

    const available =
        availableRows[0]?.total || 0;

    const {rows: usedRows} = await db.query(
        `
            select coalesce(sum(so_luong), 0)::int as total
            from thi.trac_nghiem_dot_thi
            where dot_thi_id = $1
              and linh_vuc_id = $2
              and nhom_id = $3
              and ($4::int is null or id <> $4)
        `,
        [dotThiId, linhVucId, nhomId, ignoreId]
    );

    const requested =
        (usedRows[0]?.total || 0) + Number(soLuong);

    if (available === 0) {
        throw "Tổ hợp lĩnh vực và nhóm câu hỏi này hiện chưa có ngân hàng câu hỏi.";
    }

    if (requested > available) {
        throw `Cấu hình vượt quá số câu hỏi hiện có. Khả dụng: ${available}, đang cấu hình: ${requested}.`;
    }
};

exports.ensureDotThiQuestionConfigValid = async (dotThiId) => {
    const {rows: dotThiRows} = await db.query(
        `
            select dt.id,
                   dt.ten,
                   ct.co_tu_luan
            from thi.dot_thi dt
                     join thi.cuoc_thi ct on ct.id = dt.cuoc_thi_id
            where dt.id = $1
            limit 1
        `,
        [dotThiId]
    );

    const dotThi = dotThiRows[0];

    if (!dotThi) {
        throw "Không tìm thấy đợt thi.";
    }

    const {rows: tracRows} = await db.query(
        `
            select cfg.id,
                   cfg.linh_vuc_id,
                   cfg.nhom_id,
                   cfg.so_luong,
                   coalesce(lv.ten, 'Chưa chọn lĩnh vực') as linh_vuc_ten,
                   coalesce(nh.ten, 'Chưa chọn nhóm') as nhom_ten,
                   (
                       select count(*)::int
                       from thi.trac_nghiem q
                       where q.linh_vuc_id = cfg.linh_vuc_id
                         and q.nhom_id = cfg.nhom_id
                   ) as so_cau_kha_dung
            from thi.trac_nghiem_dot_thi cfg
                     left join dm_chung.linh_vuc lv on lv.id = cfg.linh_vuc_id
                     left join dm_chung.nhom_cau_hoi nh on nh.id = cfg.nhom_id
            where cfg.dot_thi_id = $1
        `,
        [dotThiId]
    );

    const {rows: tuLuanRows} = await db.query(
        `
            select count(*)::int as total
            from thi.tu_luan_dot_thi
            where dot_thi_id = $1
        `,
        [dotThiId]
    );

    const totalTuLuan =
        tuLuanRows[0]?.total || 0;

    if (!tracRows.length && totalTuLuan === 0) {
        throw "Đợt thi chưa có cấu hình câu hỏi.";
    }

    if (!dotThi.co_tu_luan && totalTuLuan > 0) {
        throw "Cuộc thi hiện tại không bật phần tự luận nhưng đợt thi đang có câu tự luận.";
    }

    for (const row of tracRows) {
        if (!row.linh_vuc_id || !row.nhom_id) {
            throw "Cấu hình trắc nghiệm còn thiếu lĩnh vực hoặc nhóm câu hỏi.";
        }

        if (!row.so_luong || row.so_luong < 1) {
            throw "Cấu hình trắc nghiệm có số lượng câu hỏi không hợp lệ.";
        }

        if (row.so_luong > row.so_cau_kha_dung) {
            throw `Nhóm "${row.nhom_ten}" thuộc lĩnh vực "${row.linh_vuc_ten}" không đủ câu hỏi. Cần ${row.so_luong}, hiện có ${row.so_cau_kha_dung}.`;
        }
    }
};

exports.ensureTuLuanAllowed = async (dotThiId) => {
    const {rows} = await db.query(
        `
            select ct.co_tu_luan
            from thi.dot_thi dt
                     join thi.cuoc_thi ct on ct.id = dt.cuoc_thi_id
            where dt.id = $1
            limit 1
        `,
        [dotThiId]
    );

    const row = rows[0];

    if (!row) {
        throw "Không tìm thấy đợt thi.";
    }

    if (!row.co_tu_luan) {
        throw "Cuộc thi hiện tại không bật phần tự luận.";
    }
};
