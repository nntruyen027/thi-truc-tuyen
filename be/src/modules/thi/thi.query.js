const dbHelper = require("../../utils/dbHelper")

exports.conDuocThi = (
    dotThiId,
    thiSinhId,
) => {

    return dbHelper.call(
        "select thi.fn_con_duoc_thi($1,$2) as data",
        [
            dotThiId,
            thiSinhId,
        ]
    )

}

exports.layDeDangLam = (
    dotThiId,
    thiSinhId,
) => {

    return dbHelper.call(
        "select thi.fn_de_dang_lam($1,$2) as data",
        [
            dotThiId,
            thiSinhId,
        ]
    )

}

exports.taoDeThi = (
    dotThiId,
    thiSinhId,
) => {

    return dbHelper.call(
        "select thi.fn_tao_de_thi($1,$2) as data",
        [
            dotThiId,
            thiSinhId,
        ]
    )

}

exports.batDauThi = (
    deThiId,
    thiSinhId,
) => {

    return dbHelper.call(
        "select thi.fn_bat_dau_thi($1,$2) as data",
        [
            deThiId,
            thiSinhId,
        ]
    )

}

exports.luuCauTraLoi = (
    baiThiId,
    cauHoiId,
    dapAn
) => {

    return dbHelper.call(
        "select thi.fn_luu_cau_tra_loi($1,$2,$3)",
        [
            baiThiId,
            cauHoiId,
            dapAn,
        ]
    )

}

exports.luuCauTraLoiTuLuan = (
    baiThiId,
    cauHoiId,
    dapAn
) => {

    return dbHelper.call(
        "select thi.fn_luu_cau_tra_loi_tu_luan($1,$2,$3)",
        [
            baiThiId,
            cauHoiId,
            dapAn,
        ]
    )

}

exports.nopBai = (
    baiThiId,
) => {

    return dbHelper.call(
        "select thi.fn_nop_bai($1) as data",
        [
            baiThiId,
        ]
    )

}

exports.lichSuThi = (
    thiSinhId,
    dotThiId,
) => {

    return dbHelper.call(
        'select thi.lay_lich_su_thi($1,$2) as data',
        [
            thiSinhId,
            dotThiId,
        ]
    )

}

exports.layCauHoiDeThi = (
    deThiId,
    baiThiId
) => {

    return dbHelper.call(
        'select thi.lay_cau_hoi_de_thi($1) as data',
        [
            deThiId,
            baiThiId,
        ]
    )

}

exports.layBaiDangLam = (
    thiSinhId,
    dotThiId,
) => {

    return dbHelper.call(
        "select thi.lay_bai_dang_lam($1,$2) as data",
        [
            thiSinhId,
            dotThiId,
        ]
    )

}

exports.startThi = (
    dotThiId,
    thiSinhId,
) => {

    return dbHelper.call(
        "select thi.fn_start_thi($1,$2) as data",
        [
            dotThiId,
            thiSinhId,
        ]
    )

}

exports.pauseThi = (
    baiThiId
) => {
    return dbHelper.call(
        "select thi.fn_dung_thi($1) as data",
        [baiThiId]
    )
}

exports.nopDuDoanKetQuan =
    (
        baiThiId, soDuDoan
    ) => {
        return dbHelper.call(
            "select thi.fn_nop_du_doan_ket_qua($1,$2) as data",
            [baiThiId, soDuDoan]
        )
    }

exports.xepHangTracNghiemTheoDotThi = (dotThiId, topGiai) => {
    return dbHelper.call(
        "select thi.lay_giai_trac_nghiem_theo_dot_thi($1,$2) as data",
        [dotThiId, topGiai]
    );
}

exports.xepHangTracNghiemTheoCuocThi = (cuocThiId, topGiai) => {
    return dbHelper.call(
        "select thi.lay_giai_trac_nghiem_theo_cuoc_thi($1,$2) as data",
        [cuocThiId, topGiai]
    );
}