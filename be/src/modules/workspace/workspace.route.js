const router = require("express").Router();

const auth = require("../../middlewares/auth");
const role = require("../../middlewares/role");
const query = require("./workspace.query");
const resUtil = require("../../utils/response");

router.get("/current", async (req, res) => {
    try {
        resUtil.ok(res, req.workspace || null);
    } catch (error) {
        resUtil.error(res, error);
    }
});

router.get("/", auth, role(["super_admin"]), async (req, res) => {
    try {
        const data = await query.listWorkspaces();
        resUtil.ok(res, data);
    } catch (error) {
        resUtil.error(res, error);
    }
});

router.post("/", auth, role(["super_admin"]), async (req, res) => {
    try {
        const code = req.body?.code?.trim();
        const ten = req.body?.ten?.trim();
        const slug = req.body?.slug?.trim();
        const domain = req.body?.domain?.trim().toLowerCase();
        const status = req.body?.status?.trim() || "active";

        if (!code || !ten || !slug || !domain) {
            throw "Vui lòng nhập đầy đủ mã, tên, slug và domain của workspace.";
        }

        if (!await query.ensureWorkspaceCodeAvailable(code)) {
            throw `Workspace code ${code} đã tồn tại.`;
        }

        if (!await query.ensureWorkspaceSlugAvailable(slug)) {
            throw `Slug ${slug} đã tồn tại.`;
        }

        if (!await query.ensureDomainAvailable(domain)) {
            throw `Domain ${domain} đã được sử dụng.`;
        }

        const data = await query.createWorkspace({ code, ten, slug, domain, status });
        resUtil.ok(res, data);
    } catch (error) {
        resUtil.error(res, error);
    }
});

router.put("/:id", auth, role(["super_admin"]), async (req, res) => {
    try {
        const id = Number(req.params.id);
        const ten = req.body?.ten?.trim();
        const slug = req.body?.slug?.trim();
        const domain = req.body?.domain?.trim().toLowerCase();
        const status = req.body?.status?.trim() || "active";

        if (!id) {
            throw "Workspace không hợp lệ.";
        }

        const existing = await query.getWorkspaceById(id);

        if (!existing) {
            throw "Không tìm thấy workspace.";
        }

        if (!ten || !slug || !domain) {
            throw "Vui lòng nhập đầy đủ tên, slug và domain của workspace.";
        }

        if (!await query.ensureWorkspaceSlugAvailable(slug, id)) {
            throw `Slug ${slug} đã tồn tại.`;
        }

        if (!await query.ensureDomainAvailable(domain, id)) {
            throw `Domain ${domain} đã được sử dụng.`;
        }

        const data = await query.updateWorkspace(id, { ten, slug, status, domain });
        resUtil.ok(res, data);
    } catch (error) {
        resUtil.error(res, error);
    }
});

module.exports = router;
