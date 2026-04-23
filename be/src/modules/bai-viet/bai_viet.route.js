const router = require("express").Router();
const query = require("./bai_viet.query");
const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const resUtil = require("../../utils/response");

router.get("/", async (req, res) => {
    try {
        const {
            page = 1,
            size = 50,
            search = "",
            chiHienThi = "true",
        } = req.query;

        const data = await query.layDanhSachBaiViet({
            page: Number(page),
            size: Number(size),
            search,
            chiHienThi: chiHienThi !== "false",
        });

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const data = await query.layBaiVietTheoId(req.params.id);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.post("/", auth, role(["admin"]), async (req, res) => {
    try {
        const data = await query.themBaiViet({
            ...req.body,
            nguoiTao: req.user?.id || null,
        });

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.put("/:id", auth, role(["admin"]), async (req, res) => {
    try {
        const data = await query.suaBaiViet(req.params.id, req.body);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.delete("/:id", auth, role(["admin"]), async (req, res) => {
    try {
        const data = await query.xoaBaiViet(req.params.id);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

module.exports = router;

