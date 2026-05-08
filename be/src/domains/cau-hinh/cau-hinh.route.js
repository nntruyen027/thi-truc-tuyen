const router = require("express").Router();
const query = require("./cau-hinh.query");
const resUtil = require("../../core/utils/response");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const jwtUtil = require("../../core/utils/jwt");

const FILE_SCOPED_KEYS = new Set([
    "favicon",
    "banner_desktop",
    "banner_mobile",
    "ke_hoach",
    "the_le",
    "document",
]);

const TENANT_SCOPED_KEYS = new Set([
    "theme_settings",
    "user_profile_fields",
    "favicon",
    "banner_desktop",
    "banner_mobile",
    "footer_meta",
    "left_footer",
    "right_footer",
    "van-ban-ban-quyen",
    "ke_hoach",
    "the_le",
    "document",
    "giai_thuong_cuoc_thi",
]);

function attachOptionalUser(req) {
    const header = req.headers.authorization;

    if (!header) {
        return null;
    }

    const token = String(header).replace("Bearer ", "");

    try {
        return jwtUtil.verifyAccess(token);
    } catch {
        return null;
    }
}

function resolveConfigWorkspaceId(req, khoa = "") {
    const requestedWorkspaceId =
        req.query?.workspaceId
        || req.body?.workspaceId
        || null;

    if (req.user?.role === "super_admin" && requestedWorkspaceId) {
        return Number(requestedWorkspaceId);
    }

    if (TENANT_SCOPED_KEYS.has(khoa) && req.workspace?.id) {
        return Number(req.workspace.id);
    }

    if (req.user?.workspace_id) {
        return Number(req.user.workspace_id);
    }

    if (req.workspace?.id) {
        return Number(req.workspace.id);
    }

    return null;
}

function ensureSuperAdminMediaWorkspaceMatch(req, khoa, workspaceId) {
    if (!FILE_SCOPED_KEYS.has(khoa)) {
        return;
    }

    if (req.user?.role !== "super_admin") {
        return;
    }

    if (!workspaceId || !req.workspace?.id) {
        return;
    }

    if (Number(workspaceId) !== Number(req.workspace.id)) {
        throw "Chỉ được cập nhật media cho workspace đang truy cập hiện tại. Hãy mở đúng domain của workspace rồi tải lại file.";
    }
}

router.get("/:khoa", async (req, res) => {
    try {
        const { khoa } = req.params;
        req.user = attachOptionalUser(req);

        const data = await query.layCauHinh(
            khoa,
            resolveConfigWorkspaceId(req, khoa)
        );

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

router.post("/:khoa", auth, role(["admin"]), async (req, res) => {
    try {
        const { khoa } = req.params;
        const { giaTri } = req.body;
        const workspaceId = resolveConfigWorkspaceId(req, khoa);

        ensureSuperAdminMediaWorkspaceMatch(req, khoa, workspaceId);

        const data = await query.suaCauHinh(
            khoa,
            giaTri,
            workspaceId
        );

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

module.exports = router;

