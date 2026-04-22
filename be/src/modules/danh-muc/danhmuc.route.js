const router =
    require("express").Router()
const query = require("./danhmuc.query")
const resUtil = require("../../utils/response")
const auth = require("../../middlewares/auth")
const role = require("../../middlewares/role")

router.get(
    "/:tenDm",
    async (req, res) => {


        try {
            const {
                size = 10,
                page = 1,
                search = "",
                sortField = "id",
                sortType = "asc"
            } = req.query

            let tenDm = req.params.tenDm

            tenDm = String(tenDm).replaceAll("-", "_")

            const data =
                await query.layDsDanhMuc(
                    tenDm,
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

    }
)


router.post(
    "/:tenDm",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {

            let tenDm = req.params.tenDm

            tenDm = String(tenDm).replaceAll("-", "_")

            const value =
                req.body

            const data =
                await query.themDanhMuc(
                    tenDm,
                    value
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
    "/:tenDm/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {

            let tenDm = req.params.tenDm

            tenDm = String(tenDm).replaceAll("-", "_")

            const id = req.params.id

            const value =
                req.body

            const data =
                await query.suaDanhMuc(
                    tenDm,
                    id,
                    value
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
    "/:tenDm/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {

            let tenDm = req.params.tenDm

            tenDm = String(tenDm).replaceAll("-", "_")

            const id = req.params.id


            const data =
                await query.xoaDanhMuc(
                    tenDm,
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


module.exports = router