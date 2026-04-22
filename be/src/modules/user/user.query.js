const dbHelper = require("../../utils/dbHelper")
const db = require("../../config/db")

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

exports.getUserById = async (id) => {
    const result = await db.query(
        `
            select u.*,
                   (
                       select to_jsonb(dv)
                       from dm_chung.don_vi dv
                       where dv.id = u.don_vi_id
                       limit 1
                   ) as don_vi
            from auth.users u
            where u.id = $1
            limit 1
        `,
        [id]
    )

    return result.rows[0] || null
}

exports.getUserByUsername = async (username) => {
    const result = await db.query(
        `
            select u.*,
                   (
                       select to_jsonb(dv)
                       from dm_chung.don_vi dv
                       where dv.id = u.don_vi_id
                       limit 1
                   ) as don_vi
            from auth.users u
            where u.username = $1
            limit 1
        `,
        [username]
    )

    return result.rows[0] || null
}

exports.createUser = async ({
    username,
    hoTen,
    password,
    donViId,
    role,
}) => {
    const result = await db.query(
        `
            insert into auth.users(
                username,
                password,
                ho_ten,
                don_vi_id,
                role
            )
            values ($1, $2, $3, $4, $5)
            returning id
        `,
        [username, password, hoTen, donViId, role]
    )

    return result.rows[0]?.id
}

exports.updateUser = async ({
    id,
    username,
    hoTen,
    donViId,
    role,
    password = null,
}) => {
    await db.query(
        `
            update auth.users
            set username = $2,
                ho_ten = $3,
                don_vi_id = $4,
                role = $5,
                password = coalesce($6, password)
            where id = $1
        `,
        [id, username, hoTen, donViId, role, password]
    )
}

exports.deleteUser = async (id) => {
    await db.query(
        "delete from auth.users where id = $1",
        [id]
    )
}

exports.updateRole = async (id, role) => {
    await db.query(
        `
            update auth.users
            set role = $2
            where id = $1
        `,
        [id, role]
    )
}

exports.usernameExists = async (username, excludeId = null) => {
    const result = await db.query(
        `
            select exists(
                select 1
                from auth.users
                where username = $1
                  and ($2::int is null or id <> $2)
            ) as exists
        `,
        [username, excludeId]
    )

    return !!result.rows[0]?.exists
}
