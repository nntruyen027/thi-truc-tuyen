const router =
    require("express").Router()

const service =
    require("./auth.service")
const validation =
    require("./auth.validation")
const cauHinhQuery = require("../cau-hinh/cau-hinh.query");
const { parseUserProfileFieldConfig } = require("./auth.profile-fields");

const authMiddleware = require("../../core/middlewares/auth")
const resUtil = require("../../core/utils/response");


router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body
            const validated =
                validation.validateLoginPayload({
                    username,
                    password,
                })

            const result =
                await service.login(
                    validated.username,
                    validated.password,
                    req.workspace
                )

            res.json(result)

        } catch (e) {

            if (e === "USER_NOT_FOUND")
                return res.status(401).json()

            if (e === "WRONG_PASSWORD")
                return res.status(401).json()

            if (typeof e === "string") {
                return res.status(400).json({
                    success: false,
                    message: e,
                })
            }

            res.status(500).json()

        }

    }
)


router.post(
    "/refresh",
    async (req, res) => {
        try {

            const {refresh} =
                req.body
            const validated =
                validation.validateRefreshPayload({
                    refresh
                })

            const result =
                await service.refresh(
                    validated.refresh
                )


            res.json(result)

        } catch {

            res
                .status(401)
                .json()

        }

    }
)


router.post(
    "/register",
    async (req, res) => {

        try {

            const {
                username,
                hoTen,
                password,
                repeatPassword,
                donViId,
                diaChiDong1,
                xaPhuong,
                tinhThanh,
                ngheNghiep,
                doiTuong,
            } = req.body
            const fieldConfig =
                await cauHinhQuery.layCauHinh("user_profile_fields", req.workspace?.id || null);
            const validated =
                validation.validateRegisterPayload({
                    username,
                    hoTen,
                    password,
                    repeatPassword,
                    donViId,
                    diaChiDong1,
                    xaPhuong,
                    tinhThanh,
                    ngheNghiep,
                    doiTuong,
                }, parseUserProfileFieldConfig(fieldConfig?.gia_tri))

            const result =
                await service.register(
                    validated.username,
                    validated.hoTen,
                    validated.password,
                    validated.repeatPassword,
                    validated.donViId,
                    {
                        diaChiDong1: validated.diaChiDong1,
                        xaPhuong: validated.xaPhuong,
                        tinhThanh: validated.tinhThanh,
                        ngheNghiep: validated.ngheNghiep,
                        doiTuong: validated.doiTuong,
                    },
                    req.workspace
                )

            res.json(result)

        } catch (e) {

            resUtil.error(res, e)

        }

    }
)

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await service.layNguoiDungByUsername(req.user.username, req.user.workspace_id)
        resUtil.ok(res, user)
    } catch (e) {
        resUtil.error(res, e);
    }
})


router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const validated =
            validation.validateProfilePayload(req.body || {});


        const user = await service.capNhatThongTinNguoiDung(req.user.username, validated, req.user.workspace_id)

        resUtil.ok(res, user)

    } catch (e) {
        resUtil.error(res, e)
    }
})

router.put("/password", authMiddleware, async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword,
            repeatPass
        } = req.body;
        const validated =
            validation.validateChangePasswordPayload({
                oldPassword,
                newPassword,
                repeatPass,
            })


        const found = await service.changePassword(req.user.username, validated.oldPassword,
            validated.newPassword,
            validated.repeatPass,
            req.user.workspace_id)

        resUtil.ok(res, found)

    } catch (e) {
        resUtil.error(res, e)
    }
})

module.exports = router

