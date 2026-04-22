const jwt = require("jsonwebtoken")

exports.signAccess = (payload) => {

    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES
        }
    )

}

exports.signRefresh = (payload) => {

    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:
            process.env.JWT_REFRESH_EXPIRES
        }
    )

}

exports.verifyAccess = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    )

}

exports.verifyRefresh = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    )

}