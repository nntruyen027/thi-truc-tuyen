function normalizeWorkspaceHost(value) {
    if (!value) {
        return "";
    }

    const host = String(value)
        .split(",")[0]
        .trim()
        .toLowerCase();

    const withoutProtocol = host.replace(/^https?:\/\//, "");
    const hostname = withoutProtocol.split("/")[0].split(":")[0];

    return hostname;
}

function resolveWorkspaceHost(req) {
    return normalizeWorkspaceHost(
        req.headers["x-workspace-host"]
        || req.headers["x-forwarded-host"]
        || req.headers.host
        || ""
    );
}

module.exports = {
    normalizeWorkspaceHost,
    resolveWorkspaceHost,
};
