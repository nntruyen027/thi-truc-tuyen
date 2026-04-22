const dbHelper = require("../../utils/dbHelper")

exports.layDsDanhMuc = (tenDm,
                        size,
                        page,
                        search,
                        sortField,
                        sortType,
) => {

    return dbHelper.call(
        "select dm_chung.lay_" + tenDm + "($1,$2,$3,$4,$5) as data",
        [
            size,
            page,
            search,
            sortField,
            sortType,
        ]
    )
}

exports.themDanhMuc = (tenDm, value) => {
    const keys = Object.keys(value)

    const params = keys.map(
        (_, i) => `$${i + 1}`
    )

    const values = Object.values(value)

    const sql =
        `select dm_chung.them_${tenDm}(${params.join(",")}) as data`

    return dbHelper.call(
        sql,
        values
    )

}

exports.suaDanhMuc = (tenDm, id, value) => {
    const keys = Object.keys(value)

    const params = keys.map(
        (_, i) => `$${i + 2}`
    )

    const values = Object.values(value)

    const sql =
        `select dm_chung.sua_${tenDm}($1,${params.join(",")}) as data`

    return dbHelper.call(
        sql,
        [id, ...values]
    )
}

exports.xoaDanhMuc = (tenDm, id) => {
    return dbHelper.call(
        `select dm_chung.xoa_${tenDm}($1) as data`,
        [id],
    )
}