const router = require("express").Router();
const query = require("./cau-hinh.query");
const resUtil = require("../../core/utils/response");
const auth = require("../../core/middlewares/auth");
const role = require("../../core/middlewares/role");
const jwtUtil = require("../../core/utils/jwt");

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

function resolveConfigWorkspaceId(req) {
    const requestedWorkspaceId =
        req.query?.workspaceId
        || req.body?.workspaceId
        || null;

    if (req.user?.role === "super_admin" && requestedWorkspaceId) {
        return Number(requestedWorkspaceId);
    }

    if (req.user?.workspace_id) {
        return Number(req.user.workspace_id);
    }

    if (req.workspace?.id) {
        return Number(req.workspace.id);
    }

    return null;
}

router.get("/:khoa", async (req, res) => {
    try {
        const { khoa } = req.params;
        req.user = attachOptionalUser(req);

        const data = await query.layCauHinh(
            khoa,
            resolveConfigWorkspaceId(req)
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

        const data = await query.suaCauHinh(
            khoa,
            giaTri,
            resolveConfigWorkspaceId(req)
        );

        resUtil.ok(res, data);
    } catch (err) {
        resUtil.error(res, err);
    }
});

module.exports = router;

