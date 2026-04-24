const router =
    require("express").Router({mergeParams: true})
const query = require("./tu_luan_dot_thi.query")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const validation = require("../thi/thi.validation");
const { requireWorkspaceId } = require("../../utils/workspace-scope");

router.get(
    "/",
    auth,
    role(['admin']),
    async (req, res) => {
        try {
            const dotThiId = req.params.dotThiId;

            const info =
                await validation.layTrangThaiTuLuanTheoDotThi(requireWorkspaceId(req), dotThiId);

            if (!info.coTuLuan) {
                return resUtil.ok(res, []);
            }

            const data = await query.layDsTuLuan(
                requireWorkspaceId(req),
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
                requireWorkspaceId(req),
                dotThiId
            )

            const data = await query.themTuLuan(requireWorkspaceId(req), dotThiId, cau_hoi, goi_y)


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
                requireWorkspaceId(req),
                dotThiId
            )

            const data = await query.suaTuLuan(requireWorkspaceId(req), id, cau_hoi, goi_y)


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

            const data = await query.xoaTuLuan(requireWorkspaceId(req), id)


            resUtil.ok(res, data)
        } catch (err) {
            resUtil.error(res, err)
        }
    }
)

module.exports = router;
