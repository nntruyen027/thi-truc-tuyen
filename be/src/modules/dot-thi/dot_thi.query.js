const dbHelper = require("../../utils/dbHelper")

exports.layDsDotThi = (
    cuocThiId,
    size,
    page,
    search,
    sortField,
    sortType,
) => {

    return dbHelper.call(
        "select thi.lay_dot_thi($1,$2,$3,$4,$5,$6) as data",
        [
            cuocThiId,
            size,
            page,
            search,
            sortField,
            sortType,
        ]
    )
}

exports.layDotThiTheoId = (dotThiId) => {
    return dbHelper.call(
        "select thi.lay_dot_thi_theo_id($1) as data",
        [dotThiId]
    )
}

exports.layDotThiHienTai = () => {
    return dbHelper.call(
        "select thi.lay_dot_thi_hien_tai() as data",
        []
    )
}


exports.themDotThi = (cuocThiId, ten,
                      mota,
                      so_lan_tham_gia_toi_da,
                      thoi_gian_thi,
                      ty_le_danh_gia_dat,
                      thoi_gian_bat_dau,
                      thoi_gian_ket_thuc,
                      co_tron_cau_hoi,
                      cho_phep_luu_bai,
                      du_doan,
                      trang_thai) => {

    const sql =
        `select thi.them_dot_thi($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as data`

    return dbHelper.call(
        sql,
        [ten,
            mota,
            cuocThiId,
            so_lan_tham_gia_toi_da,
            thoi_gian_thi,
            ty_le_danh_gia_dat,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            co_tron_cau_hoi,
            cho_phep_luu_bai,
            du_doan,
            trang_thai]
    )

}

exports.suaDotThi = (id, ten,
                     mota,
                     so_lan_tham_gia_toi_da,
                     thoi_gian_thi,
                     ty_le_danh_gia_dat,
                     thoi_gian_bat_dau,
                     thoi_gian_ket_thuc,
                     co_tron_cau_hoi,
                     cho_phep_luu_bai,
                     du_doan,
                     trang_thai) => {


    const sql =
        `select thi.sua_dot_thi($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) as data`

    return dbHelper.call(
        sql,
        [id, ten,
            mota,
            so_lan_tham_gia_toi_da,
            thoi_gian_thi,
            ty_le_danh_gia_dat,
            thoi_gian_bat_dau,
            thoi_gian_ket_thuc,
            co_tron_cau_hoi,
            cho_phep_luu_bai,
            du_doan,
            trang_thai]
    )
}

exports.xoaDotThi = (id) => {
    return dbHelper.call(
        `select thi.xoa_dot_thi($1) as data`,
        [id],
    )
}