const router =
    require("express").Router()
const query = require("./trac_nghiem.query")
const resUtil = require("../../core/utils/response");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const upload = require("../../core/utils/upload")
const fs = require("fs/promises");
const importService = require("./trac_nghiem_import.service");


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
                loai_cau_hoi,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                dapAnNhieu,
                dapAnText,
                diem
            } = req.body

            const data = await query.themTracNghiem(
                linh_vuc_id,
                nhom_id,
                loai_cau_hoi,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                dapAnNhieu,
                dapAnText,
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
                loai_cau_hoi,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                dapAnNhieu,
                dapAnText,
                diem
            } = req.body

            const data = await query.suaTracNghiem(id, linh_vuc_id,
                nhom_id,
                loai_cau_hoi,
                cau_hoi,
                cauA,
                cauB,
                cauC,
                cauD,
                dapAn,
                dapAnNhieu,
                dapAnText,
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

            const data = await query.xoaTracNghiem(id)


            resUtil.ok(res, data)
        } catch (error) {
            resUtil.error(res, error)
        }
    }
)

router.get(
    "/template",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const result = await importService.generateTemplate();

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${result.fileName}"`
            );

            res.send(Buffer.from(result.buffer));
        } catch (error) {
            resUtil.error(res, error);
        }
    }
)

router.post(
    "/import",
    auth,
    role(["admin"]),
    upload.single("file"),
    async (req, res) => {
        const uploadedPath = req.file?.path;

        try {
            if (!uploadedPath) {
                throw "Vui lòng chọn file Excel để import.";
            }

            const data = await importService.importWorkbook(uploadedPath);

            resUtil.ok(res, data);
        } catch (error) {
            resUtil.error(res, error);
        } finally {
            if (uploadedPath) {
                await fs.unlink(uploadedPath).catch(() => null);
            }
        }

    }
)

module.exports = router;

