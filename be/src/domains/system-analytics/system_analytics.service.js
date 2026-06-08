const os = require("os");
const { count, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { files } = require("../../db/schema");
const tracker = require("./system_analytics.tracker");

function safePercent(value, total) {
    if (!total) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

exports.getSystemAnalytics = async () => {
    const [fileStatsRows] = await Promise.all([
        db
            .select({
                totalFiles: count(files.id),
                totalSizeBytes: sql`coalesce(sum(${files.kichThuoc}), 0)::bigint`,
            })
            .from(files),
    ]);

    const runtime = tracker.getSnapshot();
    const memory = process.memoryUsage();
    const totalMemoryBytes = os.totalmem();
    const freeMemoryBytes = os.freemem();
    const usedMemoryBytes = Math.max(totalMemoryBytes - freeMemoryBytes, 0);
    const totalResponseBytes = Number(runtime.totals.responseBytes || 0);
    const totalRequestBytes = Number(runtime.totals.requestBytes || 0);

    return {
        overview: {
            startedAt: runtime.startedAt,
            uptimeSeconds: runtime.uptimeSeconds,
            totalRequests: runtime.totals.requests,
            uniqueIps: runtime.totals.uniqueIps,
            averageDurationMs: runtime.totals.averageDurationMs,
            errorRequests: runtime.totals.errorRequests,
            errorRatePercent: safePercent(runtime.totals.errorRequests, runtime.totals.requests),
            totalBandwidthBytes: totalRequestBytes + totalResponseBytes,
            totalRequestBytes,
            totalResponseBytes,
            fileCount: Number(fileStatsRows[0]?.totalFiles || 0),
            fileSizeBytes: Number(fileStatsRows[0]?.totalSizeBytes || 0),
            ramUsedBytes: usedMemoryBytes,
            ramFreeBytes: freeMemoryBytes,
            ramTotalBytes: totalMemoryBytes,
            ramUsagePercent: safePercent(usedMemoryBytes, totalMemoryBytes),
            heapUsedBytes: memory.heapUsed,
            heapTotalBytes: memory.heapTotal,
            rssBytes: memory.rss,
            externalBytes: memory.external,
        },
        charts: {
            requestsByHour: runtime.perHour.map((item) => ({
                time: item.time,
                value: item.requests,
            })),
            bandwidthByHour: runtime.perHour.map((item) => ({
                time: item.time,
                value: Number(item.requestBytes || 0) + Number(item.responseBytes || 0),
            })),
            durationByHour: runtime.perHour.map((item) => ({
                time: item.time,
                value: item.averageDurationMs,
            })),
            topPaths: runtime.topPaths,
            statusBreakdown: runtime.statusBreakdown,
            methodBreakdown: runtime.methodBreakdown,
        },
        recentRequests: runtime.recentRequests,
    };
};
