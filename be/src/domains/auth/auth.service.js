const bcrypt = require("bcrypt")

const jwtUtil =
    require("../../core/utils/jwt")

const query =
    require("./auth.query")

const {v4: uuid} =
    require("uuid")

function toSessionUser(user) {
    if (!user) {
        return null
    }

    const cloned = {...user}
    delete cloned.password
    return cloned
}

exports.login = async (
    username,
    password
) => {

    const user =
        await query.getUserByUsername(
            username
        )

    if (!user)
        throw "USER_NOT_FOUND"


    const ok =
        await bcrypt.compare(
            password,
            user.password
        )

    if (!ok)
        throw "WRONG_PASSWORD"


    const access =
        jwtUtil.signAccess(
            toSessionUser(user)
        )

    const refresh =
        jwtUtil.signRefresh({
            id: user.id,
        })


    const id = uuid()

    const exp =
        new Date(
            Date.now()
            + 7 * 86400000
        )


    await query.saveRefresh(
        id,
        user.id,
        refresh,
        exp
    )


    return {
        user: toSessionUser(user),
        access,
        refresh
    }

}


exports.refresh = async (
    refreshToken
) => {


    const data =
        jwtUtil.verifyRefresh(
            refreshToken
        )

    const user = await query.getUserById(data.id)

    if (!user) {
        throw "USER_NOT_FOUND"
    }

    const access =
        jwtUtil.signAccess(
            toSessionUser(user)
        )

    return {access}

}


exports.register = async (
    username,
    hoTen,
    password,
    repeatPass,
    donViId,
    extraProfile
) => {
    if (!repeatPass || repeatPass !== password)
        throw "Mật khẩu không khớp!"


    const salt =
        await bcrypt.genSalt(10)

    const hash =
        await bcrypt.hash(
            password,
            salt
        )

    return await query.taoNguoiDung(
        {
            username,
            pass: hash,
            hoTen,
            donViId,
            ...extraProfile,
        }
    )

}


exports.changePassword = async (
    username,
    oldPassword,
    newPassword,
    repeatPass
) => {

    if (newPassword !== repeatPass)
        throw "PASSWORD_NOT_MATCH"


    const user =
        await query.getUserByUsername(
            username
        )

    if (!user)
        throw "USER_NOT_FOUND"


    const ok =
        await bcrypt.compare(
            oldPassword,
            user.password
        )

    if (!ok)
        throw "WRONG_PASSWORD"

    if (oldPassword === newPassword)
        throw "Mật khẩu mới không được trùng với mật khẩu hiện tại."


    const salt =
        await bcrypt.genSalt(10)

    const hash =
        await bcrypt.hash(
            newPassword,
            salt
        )


    await query.updatePassword(
        username,
        hash
    )


    return true
}


exports.capNhatThongTinNguoiDung = async (username, profile) => {
    return toSessionUser(
        await query.capNhatThongTinNguoiDung(username, profile)
    )
}

exports.layNguoiDungByUsername = async (username) => {
    return toSessionUser(
        await query.getUserByUsername(username)
    )
}
