const dbHelper = require("../../utils/dbHelper")

exports.layCauHinh = (khoa
) => {

    return dbHelper.call(
        "select lay_cau_hinh($1) as data",
        [
            khoa
        ]
    )
}

exports.suaCauHinh = (khoa, giaTri
) => {

    return dbHelper.call(
        "select sua_cau_hinh($1,$2) as data",
        [
            khoa, giaTri]
    )
}