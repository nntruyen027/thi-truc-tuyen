const dbHelper = require("../../utils/dbHelper")

exports.layDsTuLuan = (
    dotThiId
) => {

    return dbHelper.call(
        "select thi.lay_tu_luan_dot_thi($1) as data",
        [
            dotThiId
        ]
    )
}

exports.themTuLuan = (dotThiId, cau_hoi, goi_y) => {


    const sql =
        `select thi.them_tu_luan_dot_thi($1,$2,$3) as data`

    return dbHelper.call(
        sql,
        [dotThiId, cau_hoi, goi_y]
    )

}

exports.suaTuLuan = (id, cau_hoi, goi_y) => {


    const sql =
        `select thi.sua_tu_luan_dot_thi($1,$2,$3) as data`

    return dbHelper.call(
        sql,
        [id, cau_hoi, goi_y]
    )
}

exports.xoaTuLuan = (id) => {
    return dbHelper.call(
        `select thi.xoa_tu_luan_dot_thi($1) as data`,
        [id],
    )
}