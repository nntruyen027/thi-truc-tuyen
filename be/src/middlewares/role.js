module.exports = (roles = []) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json()
        }

        if (req.user.role === "super_admin") {
            return next()
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json()
        }

        next()

    }

}
