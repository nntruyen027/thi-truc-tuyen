const dbHelper = require("../../utils/dbHelper")

exports.layDsCuocThi = (size,
                        page,
                        search,
                        sortField,
                        sortType,
) => {

    return dbHelper.call(
        "select thi.lay_cuoc_thi($1,$2,$3,$4,$5) as data",
        [
            size,
            page,
            search,
            sortField,
            sortType,
        ]
    )
}

exports.themCuocThi = (value) => {
    const {
        ten,
        mo_ta,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        trang_thai,
        cho_phep_xem_lich_su,
        cho_phep_xem_lai_dap_an,
        co_tu_luan
    } = value


    const sql =
        `select thi.them_cuoc_thi($1,$2,$3,$4,$5,$6,$7,$8) as data`

    return dbHelper.call(
        sql,
        [ten,
            mo_ta,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            trang_thai,
            cho_phep_xem_lich_su,
            cho_phep_xem_lai_dap_an,
            co_tu_luan]
    )

}

exports.suaCuocThi = (id, value) => {
    const {
        ten,
        mo_ta,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        trang_thai,
        cho_phep_xem_lich_su,
        cho_phep_xem_lai_dap_an,
        co_tu_luan
    } = value

    const sql =
        `select thi.sua_cuoc_thi($1,$2,$3,$4,$5,$6,$7,$8,$9) as data`

    return dbHelper.call(
        sql,
        [id,
            ten,
            mo_ta,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            trang_thai,
            cho_phep_xem_lich_su,
            cho_phep_xem_lai_dap_an,
            co_tu_luan]
    )
}

exports.xoaCuocThi = (id) => {
    return dbHelper.call(
        `select thi.xoa_cuoc_thi($1) as data`,
        [id],
    )
}

exports.layCuocThiTheoId = (cuocThiId) => {
    return dbHelper.call(
        "select thi.lay_cuoc_thi_theo_id($1) as data",
        [cuocThiId]
    )
}

exports.layThoiGianConLaiCuaCuocThi = () => {
    return dbHelper.call(
        "select thi.lay_thoi_gian_con_lai_cua_cuoc_thi() as data",
        []
    )
}

