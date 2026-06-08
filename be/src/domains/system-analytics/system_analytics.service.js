const os = require("os");
const { monitorEventLoopDelay } = require("perf_hooks");
const { count, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { files } = require("../../db/schema");
const tracker = require("./system_analytics.tracker");

const eventLoopDelayMonitor = monitorEventLoopDelay({ resolution: 20 });
eventLoopDelayMonitor.enable();

function safePercent(value, total) {
    if (!total) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function normalizeNanoToMs(value) {
    const normalized = Number(value || 0);
    return Math.round(normalized / 1e6);
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
    const loadAverage = os.loadavg();
    const cpuCount = os.cpus()?.length || 1;
    const oneMinuteLoadPercent = Math.min(
        100,
        Math.round(((Number(loadAverage[0]) || 0) / cpuCount) * 100)
    );
    const eventLoopLagMs = normalizeNanoToMs(eventLoopDelayMonitor.mean);
    const eventLoopLagMaxMs = normalizeNanoToMs(eventLoopDelayMonitor.max);

    return {
        overview: {
            startedAt: runtime.startedAt,
            uptimeSeconds: runtime.uptimeSeconds,
            totalRequests: runtime.totals.requests,
            requestsPerMinute: runtime.totals.requestsPerMinute,
            uniqueIps: runtime.totals.uniqueIps,
            currentInFlight: runtime.totals.currentInFlight,
            peakInFlight: runtime.totals.peakInFlight,
            averageDurationMs: runtime.totals.averageDurationMs,
            p95DurationMs: runtime.totals.p95DurationMs,
            errorRequests: runtime.totals.errorRequests,
            serverErrors: runtime.totals.serverErrors,
            errorRatePercent: safePercent(runtime.totals.errorRequests, runtime.totals.requests),
            slowRequests: runtime.totals.slowRequests,
            slowRequestsPerMinute: runtime.totals.slowRequestsPerMinute,
            totalBandwidthBytes: totalRequestBytes + totalResponseBytes,
            totalRequestBytes,
            totalResponseBytes,
            bandwidthPerMinuteBytes: runtime.totals.bandwidthPerMinuteBytes,
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
            cpuCount,
            loadAverage1m: Number(loadAverage[0] || 0),
            loadAverage5m: Number(loadAverage[1] || 0),
            loadAverage15m: Number(loadAverage[2] || 0),
            cpuLoadPercent1m: oneMinuteLoadPercent,
            eventLoopLagMs,
            eventLoopLagMaxMs,
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
