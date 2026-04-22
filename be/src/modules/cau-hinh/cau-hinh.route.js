const router =
    require("express").Router()
const query = require("./cau-hinh.query")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");

router.get("/:khoa",
    async (req, res) => {
        try {
            const {
                khoa
            } = req.params

            const data = await query.layCauHinh(
                khoa
            )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }
    })

router.post("/:khoa",
    async (req, res) => {
        try {
            const {
                khoa
            } = req.params

            const {
                giaTri
            } = req.body

            const data = await query.suaCauHinh(
                khoa,
                giaTri
            )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }
    })

module.exports = router;