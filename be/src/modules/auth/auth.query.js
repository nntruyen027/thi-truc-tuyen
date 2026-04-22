const dbHelper = require("../../utils/dbHelper")
const db = require("../../config/db")

exports.login = (user, pass) => {

    return dbHelper.call(
        "select auth.login_user($1,$2) as data",
        [user, pass]
    )

}

exports.getUserByUsername = (username) => {
    return dbHelper.call
    ("select auth.lay_user_by_username($1) as data",
        [username]
    )
}

exports.taoNguoiDung = (user, pass, hoTen, donViId) => {
    return dbHelper.call
    ("select auth.tao_nguoi_dung($1,$2,$3,$4) as data",
        [user, hoTen, pass, donViId]
    )
}

exports.saveRefresh = (
    id,
    user,
    token,
    exp
) => {

    return dbHelper.call(
        "select auth.save_refresh($1,$2,$3,$4) as data",
        [id, user, token, exp]
    )

}

exports.updatePassword = (username, password) => {
    return db.query(
        "update auth.users set password = $2 where username = $1",
        [username, password]
    )
}

exports.capNhatThongTinNguoiDung = (username, hoTen, donViId) => {
    return dbHelper.call(
        "select auth.cap_nhat_thong_tin_nguoi_dung($1,$2,$3) as data",
        [username, hoTen, donViId]
    )
}
