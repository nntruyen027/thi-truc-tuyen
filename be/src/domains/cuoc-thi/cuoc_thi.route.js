const router =
    require("express").Router()
const query = require("./cuoc_thi.query")
const validation = require("./cuoc_thi.validation")
const resUtil = require("../../core/utils/response");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const upload = require("../../core/utils/upload");
const importService = require("./cuoc_thi_import.service");
const fs = require("fs/promises");
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");

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

            const data = await query.layDsCuocThi(
                requireWorkspaceId(req),
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

router.get("/con-lai", async (req, res) => {
    try {

        const data = await query.layThoiGianConLaiCuaCuocThi(
            requireWorkspaceId(req),
        )

        resUtil.ok(res, data)

    } catch (err) {

        resUtil.error(res, err)

    }
})

router.get("/luot-thi-hien-tai", async (req, res) => {
    try {
        const data = await query.layTongLuotThiCuaCuocThiHienTai(
            requireWorkspaceId(req),
        )

        resUtil.ok(res, data)

    } catch (err) {

        resUtil.error(res, err)

    }
})

router.get("/import/template", async (req, res) => {
    try {
        const buffer = await importService.generateImportWorkbook(
            requireWorkspaceId(req),
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="mau-import-cuoc-thi.xlsx"'
        );

        res.send(Buffer.from(buffer));
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.post(
    "/import/workbook",
    auth,
    role(["admin"]),
    upload.single("file"),
    async (req, res) => {
        const uploadedPath = req.file?.path;

        try {
            if (!uploadedPath) {
                throw "Vui lòng chọn file Excel để import.";
            }

            const data = await importService.importWorkbook(
                requireWorkspaceId(req),
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


router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        const data = await query.layCuocThiTheoId(
            requireWorkspaceId(req),
            id
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


            const value =
                validation.normalizeCuocThiPayload(req.body)

            const data =
                await query.themCuocThi(
                    requireWorkspaceId(req),
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
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const id = req.params.id;

            const value =
                validation.normalizeCuocThiPayload(req.body)

            const data =
                await query.suaCuocThi(
                    requireWorkspaceId(req),
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
    "/:id",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {

            const id = req.params.id


            const data =
                await query.xoaCuocThi(
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

router.use("/:cuocThiId/dot-thi", require("../dot-thi/dot_thi.route"))

module.exports = router

