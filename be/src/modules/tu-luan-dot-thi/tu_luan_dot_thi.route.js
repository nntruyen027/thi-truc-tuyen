const router =
    require("express").Router({mergeParams: true})
const query = require("./tu_luan_dot_thi.query")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const validation = require("../thi/thi.validation");

router.get(
    "/",
    auth,
    role(['admin']),
    async (req, res) => {
        try {
            const dotThiId = req.params.dotThiId;

            const data = await query.layDsTuLuan(
                dotThiId
            )

            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.post(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const {cau_hoi, goi_y} = req.body
            const dotThiId = req.params.dotThiId;

            await validation.ensureTuLuanAllowed(
                dotThiId
            )

            const data = await query.themTuLuan(dotThiId, cau_hoi, goi_y)


            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.put(
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = req.params.id
            const {cau_hoi, goi_y} = req.body
            const dotThiId = req.params.dotThiId

            await validation.ensureTuLuanAllowed(
                dotThiId
            )

            const data = await query.suaTuLuan(id, cau_hoi, goi_y)


            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

router.delete(
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = req.params.id

            const data = await query.xoaTuLuan(id)


            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

module.exports = router;
