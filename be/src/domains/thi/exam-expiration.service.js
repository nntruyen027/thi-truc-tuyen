const thiQuery = require("./thi.query");

const EXAM_EXPIRATION_CLEANUP_ENABLED = process.env.EXAM_EXPIRATION_CLEANUP_ENABLED !== "0";
const EXAM_EXPIRATION_CLEANUP_INTERVAL_MS = Number(
    process.env.EXAM_EXPIRATION_CLEANUP_INTERVAL_MS || 30000
);
const EXAM_EXPIRATION_CLEANUP_BATCH_SIZE = Number(
    process.env.EXAM_EXPIRED_CLEANUP_BATCH_SIZE || 20
);

function startExamExpirationCleanup() {
    if (!EXAM_EXPIRATION_CLEANUP_ENABLED) {
        return;
    }

    const runCleanup = async () => {
        try {
            const result = await thiQuery.cleanupExpiredExamAttempts({
                limit: EXAM_EXPIRATION_CLEANUP_BATCH_SIZE,
            });

            if (Number(result?.finalizedCount || 0) > 0) {
                console.info("[exam-expiration] finalized expired exams:", JSON.stringify(result));
            }
        } catch (error) {
            console.error("[exam-expiration] Cleanup failed:", error?.message || error);
        }
    };

    setInterval(() => {
        void runCleanup();
    }, EXAM_EXPIRATION_CLEANUP_INTERVAL_MS).unref();

    void runCleanup();
}

module.exports = {
    startExamExpirationCleanup,
};
