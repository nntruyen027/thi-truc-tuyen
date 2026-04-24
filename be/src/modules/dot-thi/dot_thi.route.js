const router =
    require("express").Router({mergeParams: true})
const query = require("./dot_thi.query")
const validation = require("../thi/thi.validation")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const { requireWorkspaceId } = require("../../utils/workspace-scope");

router.get("/",
    async (req, res) => {
        try {
            const {
                size = 10,
                page = 1,
                search = "",
                sortField = "id",
                sortType = "asc"
            } = req.query

            const {cuocThiId} = req.params

            const data = await query.layDsDotThi(
                requireWorkspaceId(req),
                cuocThiId,
                Number(size),
                Number(page),
                search,
                sortField,
                sortType,
            )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }
    })

router.get("/hien-tai", async (req, res) => {
    try {
        const data = await query.layDotThiHienTai(requireWorkspaceId(req));
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/:dotThiId", async (req, res) => {
    try {
        const dotThiId = req.params.dotThiId;

        const data = await query.layDotThiTheoId(
            requireWorkspaceId(req),
            dotThiId
        )

        resUtil.ok(res, data)

    } catch (err) {

        resUtil.error(res, err)

    }
})


router.post(
    "/",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const cuocThiId = req.params.cuocThiId;

            const {
                ten,
                mo_ta,
                so_lan_tham_gia_toi_da,
                thoi_gian_thi,
                ty_le_danh_gia_dat,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                co_tron_cau_hoi,
                cho_phep_luu_bai,
                du_doan,
                trang_thai
            } =
                req.body

            await validation.ensureDotThiWithinCuocThi({
                workspaceId: requireWorkspaceId(req),
                cuocThiId,
                thoiGianBatDau: thoi_gian_bat_dau,
                thoiGianKetThuc: thoi_gian_ket_thuc,
            })

            const data =
                await query.themDotThi(
                    requireWorkspaceId(req),
                    cuocThiId,
                    ten,
                    mo_ta,
                    so_lan_tham_gia_toi_da,
                    thoi_gian_thi,
                    ty_le_danh_gia_dat,
                    thoi_gian_bat_dau,
                    thoi_gian_ket_thuc,
                    co_tron_cau_hoi,
                    cho_phep_luu_bai,
                    du_doan,
                    trang_thai
                )

            resUtil.ok(
                res,
                data
            )

        } catch (err) {

            resUtil.error(
                res,
                err
            )

        }
    }
)

router.put(
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = req.params.id;

            const {
                ten,
                mo_ta,
                so_lan_tham_gia_toi_da,
                thoi_gian_thi,
                ty_le_danh_gia_dat,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc,
                co_tron_cau_hoi,
                cho_phep_luu_bai,
                du_doan,
                trang_thai
            } =
                req.body

            const dotThi =
                await query.layDotThiTheoId(requireWorkspaceId(req), id)

            await validation.ensureDotThiWithinCuocThi({
                workspaceId: requireWorkspaceId(req),
                cuocThiId: dotThi?.cuoc_thi_id,
                thoiGianBatDau: thoi_gian_bat_dau,
                thoiGianKetThuc: thoi_gian_ket_thuc,
            })

            const data =
                await query.suaDotThi(
                    requireWorkspaceId(req),
                    id,
                    ten,
                    mo_ta,
                    so_lan_tham_gia_toi_da,
                    thoi_gian_thi,
                    ty_le_danh_gia_dat,
                    thoi_gian_bat_dau,
                    thoi_gian_ket_thuc,
                    co_tron_cau_hoi,
                    cho_phep_luu_bai,
                    du_doan,
                    trang_thai
                )

            resUtil.ok(
                res,
                data
            )

        } catch (err) {

            resUtil.error(
                res,
                err
            )

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


            const data =
                await query.xoaDotThi(
                    requireWorkspaceId(req),
                    id
                )

            resUtil.ok(
                res,
                data
            )

        } catch (err) {

            resUtil.error(
                res,
                err
            )

        }
    }
)

router.use("/:dotThiId/trac-nghiem", require("../trac-nghiem-dot-thi/trac_nghiem_dot_thi.route"))
router.use("/:dotThiId/tu-luan", require("../tu-luan-dot-thi/tu_luan_dot_thi.route"))

module.exports = router
