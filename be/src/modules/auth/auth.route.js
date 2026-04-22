const router =
    require("express").Router()

const service =
    require("./auth.service")

const authMiddleware = require("../../middlewares/auth")
const resUtil = require("../../utils/response");


router.post(
    "/login",
    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body

            const result =
                await service.login(
                    username,
                    password
                )

            res.json(result)

        } catch (e) {

            if (e === "USER_NOT_FOUND")
                return res.status(401).json()

            if (e === "WRONG_PASSWORD")
                return res.status(401).json()


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

            const result =
                await service.refresh(
                    refresh
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
            } = req.body

            const result =
                await service.register(
                    username,
                    hoTen,
                    password,
                    repeatPassword,
                    donViId,
                )

            res.json(result)

        } catch (e) {

            resUtil.error(res, e)

        }

    }
)

router.get("/me", authMiddleware, async (req, res) => {
    try {
        const user = await service.layNguoiDungByUsername(req.user.username)
        resUtil.ok(res, user)
    } catch (e) {
        resUtil.error(res, e);
    }
})


router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const {hoTen, donViId} = req.body;


        const user = await service.capNhatThongTinNguoiDung(req.user.username, hoTen, donViId)

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


        const found = await service.changePassword(req.user.username, oldPassword,
            newPassword,
            repeatPass)

        resUtil.ok(res, found)

    } catch (e) {
        resUtil.error(res, e)
    }
})

module.exports = router