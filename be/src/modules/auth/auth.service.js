const bcrypt = require("bcrypt")

const jwtUtil =
    require("../../utils/jwt")

const query =
    require("./auth.query")

const {v4: uuid} =
    require("uuid")


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
        jwtUtil.signAccess(user)

    const refresh =
        jwtUtil.signRefresh({
            id: user.id
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
        user,
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

    const access =
        jwtUtil.signAccess({
            id: data.id
        })

    return {access}

}


exports.register = async (
    username,
    hoTen,
    password,
    repeatPass,
    donViId
) => {
    if (!repeatPass && repeatPass !== password)
        throw "Mật khẩu không khớp!"


    const salt =
        await bcrypt.genSalt(10)

    const hash =
        await bcrypt.hash(
            password,
            salt
        )

    return await query.taoNguoiDung(
        username,
        hash,
        hoTen,
        donViId
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


exports.capNhatThongTinNguoiDung = async (username, hoTen, donViId) => {
    return await query.capNhatThongTinNguoiDung(username, hoTen, donViId)
}

exports.layNguoiDungByUsername = async (username) => {
    return await query.getUserByUsername(username)
}