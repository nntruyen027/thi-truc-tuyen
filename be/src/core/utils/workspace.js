function normalizeWorkspaceHost(value) {
    if (!value) {
        return "";
    }

    const host = String(value)
        .split(",")[0]
        .trim()
        .toLowerCase();

    const withoutProtocol = host.replace(/^https?:\/\//, "");
    const normalizedHost = withoutProtocol.split("/")[0];

    return normalizedHost;
}

function extractWorkspaceHostname(value) {
    const normalizedHost = normalizeWorkspaceHost(value);

    if (!normalizedHost) {
        return "";
    }

    return normalizedHost.split(":")[0];
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
    extractWorkspaceHostname,
    normalizeWorkspaceHost,
    resolveWorkspaceHost,
};
