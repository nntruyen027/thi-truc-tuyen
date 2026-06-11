require("dotenv").config();

const service = require("../src/domains/thi/public_rankings_snapshot.service");

async function run() {
    const result = await service.refreshNearestPublicRankingsSnapshot();

    console.log("[public-rankings:refresh]", JSON.stringify({
        at: new Date().toISOString(),
        ...result,
    }));
}

run().catch((error) => {
    console.error("[public-rankings:refresh] Failed:", error);
    process.exitCode = 1;
});
