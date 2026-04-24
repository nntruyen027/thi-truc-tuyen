function resolveWorkspaceId(req, options = {}) {
    const allowSuperAdminOverride = options.allowSuperAdminOverride !== false;

    if (req?.user?.role === "super_admin" && allowSuperAdminOverride) {
        const candidate = req.query?.workspaceId ?? req.body?.workspaceId ?? req.workspace?.id ?? null;
        return candidate ? Number(candidate) : null;
    }

    if (req?.user?.workspace_id) {
        return Number(req.user.workspace_id);
    }

    if (req?.workspace?.id) {
        return Number(req.workspace.id);
    }

    return null;
}

function requireWorkspaceId(req, options = {}) {
    const workspaceId = resolveWorkspaceId(req, options);

    if (!workspaceId) {
        throw "Không xác định được workspace hiện tại.";
    }

    return workspaceId;
}

module.exports = {
    resolveWorkspaceId,
    requireWorkspaceId,
};
