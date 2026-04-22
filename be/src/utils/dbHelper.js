const db = require("../config/db")

exports.call = async (sql, params = []) => {

    const result = await db.query(sql, params)

    return result.rows[0]?.data
}