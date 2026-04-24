const router =
    require("express").Router()
const query = require("./trac_nghiem.query")
const resUtil = require("../../utils/response");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const path = require("path")
const upload = require("../../utils/upload")
const { requireWorkspaceId } = require("../../utils/workspace-scope");

const XLSX =
    require("xlsx")


router.get(
    "/",
    auth,
    async (req, res) => {
        try {
            const {
                size = 10,
                page = 1,
                search = "",
                sortField = "id",
                sortType = "asc"
            } = req.query

            const data = await query.layDsTracNghiem(
                requireWorkspaceId(req),
                Number(size),
                Number(page),
                search,
                sortField,
                sortType,
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
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                diem
            } = req.body

            const data = await query.themTracNghiem(
                requireWorkspaceId(req),
                linh_vuc_id,
                nhom_id,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                diem)


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
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                diem
            } = req.body

            const data = await query.suaTracNghiem(requireWorkspaceId(req), id, linh_vuc_id,
                nhom_id,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                diem)


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

router.get(
    "/template",
    async (req, res) => {

        const file =
            path.resolve(
                process.cwd(),
                "uploads/template/trac-nghiem.xlsx"
            )

        res.download(file)

    }
)

router.post(
    "/import",
    upload.single("file"),
    async (req, res) => {

        try {

            const file =
                req.file.path

            const wb =
                XLSX.readFile(file)

            const sheet =
                wb.Sheets[
                    wb.SheetNames[0]
                    ]

            const rows =
                XLSX.utils.sheet_to_json(
                    sheet,
                    {defval: ""}
                )

            for (const r of rows) {

                await query.themTracNghiemImport(
                    requireWorkspaceId(req),
                    r
                )

            }

            res.json({
                ok: true
            })

        } catch (e) {

            res.json({
                error: e.message
            })

        }

    }
)

module.exports = router;
