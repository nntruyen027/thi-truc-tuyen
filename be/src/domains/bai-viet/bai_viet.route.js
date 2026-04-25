const router = require("express").Router();
const query = require("./bai_viet.query");
const validation = require("./bai_viet.validation");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const resUtil = require("../../core/utils/response");
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");

router.get("/", async (req, res) => {
    try {
        const {
            page = 1,
            size = 50,
            search = "",
            chiHienThi = "true",
        } = req.query;

        const data = await query.layDanhSachBaiViet({
            workspaceId: requireWorkspaceId(req),
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
        const data = await query.layBaiVietTheoId(requireWorkspaceId(req), req.params.id);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.post("/", auth, role(["admin"]), async (req, res) => {
    try {
        const value = validation.normalizeBaiVietPayload(req.body || {});
        const data = await query.themBaiViet({
            workspaceId: requireWorkspaceId(req),
            ...value,
            nguoiTao: req.user?.id || null,
        });

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.put("/:id", auth, role(["admin"]), async (req, res) => {
    try {
        const value = validation.normalizeBaiVietPayload(req.body || {});
        const data = await query.suaBaiViet(requireWorkspaceId(req), req.params.id, value);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.delete("/:id", auth, role(["admin"]), async (req, res) => {
    try {
        const data = await query.xoaBaiViet(requireWorkspaceId(req), req.params.id);
        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

module.exports = router;

