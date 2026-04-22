const dbHelper = require("../../utils/dbHelper")

exports.layDsTracNghiem = (
    dotThiId
) => {

    return dbHelper.call(
        "select thi.lay_trac_nghiem_dot_thi($1) as data",
        [
            dotThiId
        ]
    )
}

exports.themTracNghiem = (dotThiId,
                          linh_vuc_id,
                          nhom_id,
                          so_luong) => {


    const sql =
        `select thi.them_trac_nghiem_dot_thi($1,$2,$3,$4) as data`

    return dbHelper.call(
        sql,
        [dotThiId,
            linh_vuc_id,
            nhom_id,
            so_luong]
    )

}

exports.suaTracNghiem = (id,
                         linh_vuc_id,
                         nhom_id,
                         so_luong) => {


    const sql =
        `select thi.sua_trac_nghiem_dot_thi($1,$2,$3,$4) as data`

    return dbHelper.call(
        sql,
        [id, linh_vuc_id,
            nhom_id,
            so_luong]
    )
}

exports.xoaTracNghiem = (id) => {
    return dbHelper.call(
        `select thi.xoa_trac_nghiem_dot_thi($1) as data`,
        [id],
    )
}