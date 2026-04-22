const dbHelper = require("../../utils/dbHelper")

exports.getUsers = (search, page, size) => {
    return dbHelper.call(
        "select auth.lay_danh_sach_nguoi_dung($1,$2,$3) as data",
        [search, page, size]
    )
}

exports.updatePassword = (username, password) => {


    return dbHelper.call(
        "select auth.cap_nhat_mat_khau($1,$2) as data",
        [username, password]
    )
}
