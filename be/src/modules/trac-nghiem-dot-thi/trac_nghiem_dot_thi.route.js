const router =
    require("express").Router({mergeParams: true})
const query = require("./trac_nghiem_dot_thi.query")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const validation = require("../thi/thi.validation");

router.get(
    "/",
    auth,
    async (req, res) => {
        try {
            const dotThiId = req.params.dotThiId;

            const data = await query.layDsTracNghiem(
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
                dotThiId,
                linhVucId: linh_vuc_id,
                nhomId: nhom_id,
                soLuong: so_luong,
            })

            const data = await query.themTracNghiem(dotThiId, linh_vuc_id,
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
                dotThiId,
                linhVucId: linh_vuc_id,
                nhomId: nhom_id,
                soLuong: so_luong,
                ignoreId: id,
            })

            const data = await query.suaTracNghiem(id, linh_vuc_id,
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

            const data = await query.xoaTracNghiem(id)


            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
        }
    }
)

module.exports = router;
