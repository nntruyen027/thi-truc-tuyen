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

        if (!req.user.workspace_id && req.workspace?.id) {
            req.user.workspace_id = req.workspace.id
        }

        if (
            req.user.role !== "super_admin"
            && req.workspace?.id
            && req.user.workspace_id
            && Number(req.user.workspace_id) !== Number(req.workspace.id)
        ) {
            return res.status(403).json()
        }

        next()

    } catch {

        res.status(401).json()

    }

}
