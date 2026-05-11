const router =
    require("express").Router()
const query = require("./danhmuc.query")
const resUtil = require("../../core/utils/response")
const auth = require("../../core/middlewares/auth")
const role = require("../../core/middlewares/role")
const upload = require("../../core/utils/upload");
const fs = require("fs/promises");
const importService = require("./danhmuc_import.service");
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");

router.get(
    "/:tenDm/import/template",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            let tenDm = req.params.tenDm;
            tenDm = String(tenDm).replaceAll("-", "_");

            const result = await importService.generateTemplate(tenDm);

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${result.fileName}"`
            );

            res.send(Buffer.from(result.buffer));
        } catch (err) {
            resUtil.error(res, err);
        }
    }
);

router.post(
    "/:tenDm/import",
    auth,
    role(["admin"]),
    upload.single("file"),
    async (req, res) => {
        const uploadedPath = req.file?.path;

        try {
            let tenDm = req.params.tenDm;
            tenDm = String(tenDm).replaceAll("-", "_");

            if (!uploadedPath) {
                throw "Vui lòng chọn file Excel để import.";
            }

            const data = await importService.importWorkbook(
                requireWorkspaceId(req),
                tenDm,
                uploadedPath
            );

            resUtil.ok(res, data);
        } catch (err) {
            resUtil.error(res, err);
        } finally {
            if (uploadedPath) {
                await fs.unlink(uploadedPath).catch(() => null);
            }
        }
    }
);

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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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

