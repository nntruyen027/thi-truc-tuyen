const router =
    require("express").Router({mergeParams: true})
const query = require("./trac_nghiem_dot_thi.query")
const resUtil = require("../../core/utils/response");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const validation = require("../thi/thi.validation");
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");

router.get(
    "/",
    auth,
    async (req, res) => {
        try {
            const dotThiId = req.params.dotThiId;

            const data = await query.layDsTracNghiem(
                requireWorkspaceId(req),
                dotThiId
            )

            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
        }
    }
)

router.post(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const {
                linh_vuc_id,
                nhom_id,
                so_luong
            } = req.body
            const dotThiId = req.params.dotThiId;

            await validation.ensureTracNghiemConfigPossible({
                workspaceId: requireWorkspaceId(req),
                dotThiId,
                linhVucId: linh_vuc_id,
                nhomId: nhom_id,
                soLuong: so_luong,
            })

            const data = await query.themTracNghiem(requireWorkspaceId(req), dotThiId, linh_vuc_id,
                nhom_id,
                so_luong)


            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
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
            const {
                linh_vuc_id,
                nhom_id,
                so_luong
            } = req.body

            const dotThiId = req.params.dotThiId;

            await validation.ensureTracNghiemConfigPossible({
                workspaceId: requireWorkspaceId(req),
                dotThiId,
                linhVucId: linh_vuc_id,
                nhomId: nhom_id,
                soLuong: so_luong,
                ignoreId: id,
            })

            const data = await query.suaTracNghiem(requireWorkspaceId(req), id, linh_vuc_id,
                nhom_id,
                so_luong)


            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
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

            const data = await query.xoaTracNghiem(requireWorkspaceId(req), id)


            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
        }
    }
)

module.exports = router;

