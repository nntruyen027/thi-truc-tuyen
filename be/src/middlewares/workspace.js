const query = require("../modules/workspace/workspace.query");
const { resolveWorkspaceHost } = require("../utils/workspace");

module.exports = async (req, res, next) => {
    try {
        const host = resolveWorkspaceHost(req);
        let workspace = null;

        if (host) {
            workspace = await query.getWorkspaceByHost(host);
        }

        if (!workspace) {
            workspace = await query.getDefaultWorkspace();
        }

        req.workspace = workspace || null;
        next();
    } catch (error) {
        next(error);
    }
};
