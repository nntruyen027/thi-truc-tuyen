const tracker = require("../../domains/system-analytics/system_analytics.tracker");

const MEMORY_WATCH_ENABLED = process.env.MEMORY_WATCH_ENABLED !== "0";
const MEMORY_WATCH_INTERVAL_MS = Number(process.env.MEMORY_WATCH_INTERVAL_MS || 15000);
const MEMORY_WATCH_HEAP_MB = Number(process.env.MEMORY_WATCH_HEAP_MB || 700);
const MEMORY_WATCH_RSS_MB = Number(process.env.MEMORY_WATCH_RSS_MB || 1000);

function toMb(value) {
    return Math.round((Number(value || 0) / 1024 / 1024) * 100) / 100;
}

function captureMemoryStats() {
    const memory = process.memoryUsage();
    const snapshot = tracker.getSnapshot();

    return {
        rssMb: toMb(memory.rss),
        heapTotalMb: toMb(memory.heapTotal),
        heapUsedMb: toMb(memory.heapUsed),
        externalMb: toMb(memory.external),
        arrayBuffersMb: toMb(memory.arrayBuffers),
        activeRequests: Array.isArray(snapshot.activeRequests) ? snapshot.activeRequests.length : 0,
        activeRequestDetails: Array.isArray(snapshot.activeRequests) ? snapshot.activeRequests.slice(0, 10) : [],
        currentInFlight: Number(snapshot?.totals?.currentInFlight || 0),
        requestsPerMinute: Number(snapshot?.totals?.requestsPerMinute || 0),
        topPaths: Array.isArray(snapshot.topPaths) ? snapshot.topPaths.slice(0, 5) : [],
        recentRequests: Array.isArray(snapshot.recentRequests) ? snapshot.recentRequests.slice(0, 3) : [],
    };
}

function shouldLog(stats) {
    return stats.heapUsedMb >= MEMORY_WATCH_HEAP_MB || stats.rssMb >= MEMORY_WATCH_RSS_MB;
}

function startMemoryWatch() {
    if (!MEMORY_WATCH_ENABLED) {
        return;
    }

    setInterval(() => {
        const stats = captureMemoryStats();

        if (!shouldLog(stats)) {
            return;
        }

        console.warn("[memory-watch]", JSON.stringify(stats));
    }, MEMORY_WATCH_INTERVAL_MS).unref();
}

module.exports = {
    startMemoryWatch,
};
