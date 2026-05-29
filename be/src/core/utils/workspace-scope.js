function getDefaultWorkspaceId() {
    const configuredId = Number(process.env.DEFAULT_WORKSPACE_ID || 1);
    return configuredId > 0 ? configuredId : 1;
}

module.exports = {
    getDefaultWorkspaceId,
};
