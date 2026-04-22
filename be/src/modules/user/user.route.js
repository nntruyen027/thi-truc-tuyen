const router = require("express").Router()

const query = require("./user.query")

const auth = require("../../middlewares/auth")
const role = require("../../middlewares/role")

const resUtil = require("../../utils/response")
const bcrypt = require("bcrypt")

router.get(
    "/",
    auth,
    role(["admin"]),

    async (req, res) => {

        try {
            const {search, page, size} = req.query

            const data =
                await query.getUsers(search, page, size)

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)

router.post("/:username/password",
    auth,
    role(["admin"]),
    async (req, res) => {


        try {
            const username = req.params.username
            const salt =
                await bcrypt.genSalt(10)

            const hash =
                await bcrypt.hash(
                    "Thitructuyen@2026",
                    salt
                )

            resUtil.ok(res, await query.updatePassword(
                username,
                hash
            ))
        } catch (err) {
            resUtil.error(res, err)
        }
    })

module.exports = router