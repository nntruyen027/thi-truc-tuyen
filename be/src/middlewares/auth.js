const jwtUtil =
    require("../utils/jwt")

module.exports = (req, res, next) => {

    const h =
        req.headers.authorization

    if (!h)
        return res.status(401).json()

    const token =
        h.replace("Bearer ", "")

    try {

        req.user = jwtUtil.verifyAccess(
            token
        )

        next()

    } catch {

        res.status(401).json()

    }

}