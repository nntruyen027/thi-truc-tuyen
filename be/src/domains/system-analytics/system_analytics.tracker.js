const { monitorEventLoopDelay } = require("perf_hooks");

const MAX_RECENT_REQUESTS = 200;
const MAX_BUCKETS = 72;
const SLOW_REQUEST_THRESHOLD_MS = 1000;
const MAX_ACTIVE_REQUESTS = 200;
const MAX_RECENT_LAG_SPIKES = 20;
const ACTIVE_REQUEST_SNAPSHOT_LIMIT = 10;
const EVENT_LOOP_SAMPLE_INTERVAL_MS = 5000;
const LAG_SPIKE_THRESHOLD_MS = Number(process.env.EVENT_LOOP_LAG_SPIKE_MS || 120);
const MAX_TRACKED_PATHS = Number(process.env.MAX_TRACKED_PATHS || 1000);
const MAX_TRACKED_UNIQUE_IPS = Number(process.env.MAX_TRACKED_UNIQUE_IPS || 10000);
const OVERFLOW_PATH_KEY = "__other__";

const eventLoopDelayMonitor = monitorEventLoopDelay({ resolution: 20 });
eventLoopDelayMonitor.enable();

const state = {
    startedAt: new Date(),
    totals: {
        requests: 0,
        requestBytes: 0,
        responseBytes: 0,
        errorRequests: 0,
        serverErrors: 0,
        slowRequests: 0,
        durationMs: 0,
    },
    currentInFlight: 0,
    peakInFlight: 0,
    recentRequests: [],
    perHour: new Map(),
    pathCounts: new Map(),
    statusCounts: new Map(),
    methodCounts: new Map(),
    ipCounts: new Set(),
    activeRequests: new Map(),
    recentLagSpikes: [],
    eventLoop: {
        current: {
            meanMs: 0,
            maxMs: 0,
            p95Ms: 0,
            p99Ms: 0,
            sampledAt: null,
        },
    },
};

let requestSequence = 0;

function normalizeByteValue(value) {
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized >= 0
        ? normalized
        : 0;
}

function normalizeMsValue(value) {
    const normalized = Number(value || 0);
    if (!Number.isFinite(normalized) || normalized < 0) {
        return 0;
    }

    return Math.round(normalized / 1e6);
}

function buildHourKey(value) {
    const date = new Date(value);
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-") + " " + `${String(date.getHours()).padStart(2, "0")}:00`;
}

function estimateRequestBytes(req) {
    const contentLength = normalizeByteValue(req.headers["content-length"]);

    if (contentLength > 0) {
        return contentLength;
    }

    return 0;
}

function incrementMap(map, key, value = 1) {
    map.set(key, normalizeByteValue(map.get(key)) + normalizeByteValue(value));
}

function normalizeTrackedPath(path) {
    if (!path) {
        return "/";
    }

    const normalized = String(path).split("?")[0].trim();

    if (!normalized) {
        return "/";
    }

    return normalized.length > 180
        ? normalized.slice(0, 180)
        : normalized;
}

function incrementPathCount(path, value = 1) {
    const normalizedPath = normalizeTrackedPath(path);

    if (state.pathCounts.has(normalizedPath) || state.pathCounts.size < MAX_TRACKED_PATHS) {
        incrementMap(state.pathCounts, normalizedPath, value);
        return;
    }

    incrementMap(state.pathCounts, OVERFLOW_PATH_KEY, value);
}

function trackUniqueIp(ip) {
    const normalizedIp = ip || "unknown";

    if (state.ipCounts.has(normalizedIp) || state.ipCounts.size < MAX_TRACKED_UNIQUE_IPS) {
        state.ipCounts.add(normalizedIp);
    }
}

function createRequestId() {
    requestSequence += 1;
    return `req-${Date.now()}-${requestSequence}`;
}

function trimBucketsIfNeeded() {
    while (state.perHour.size > MAX_BUCKETS) {
        const oldestKey = state.perHour.keys().next().value;

        if (!oldestKey) {
            return;
        }

        state.perHour.delete(oldestKey);
    }
}

function recordRequest({
    time,
    method,
    path,
    status,
    ip,
    userAgent,
    durationMs,
    requestBytes,
    responseBytes,
    username,
}) {
    const hourKey = buildHourKey(time);
    const currentBucket = state.perHour.get(hourKey) || {
        requests: 0,
        requestBytes: 0,
        responseBytes: 0,
        durationMs: 0,
    };

    currentBucket.requests += 1;
    currentBucket.requestBytes += requestBytes;
    currentBucket.responseBytes += responseBytes;
    currentBucket.durationMs += durationMs;
    state.perHour.set(hourKey, currentBucket);
    trimBucketsIfNeeded();

    incrementPathCount(path);
    incrementMap(state.methodCounts, method);
    incrementMap(state.statusCounts, String(status));
    trackUniqueIp(ip);

    state.totals.requests += 1;
    state.totals.requestBytes += requestBytes;
    state.totals.responseBytes += responseBytes;
    state.totals.durationMs += durationMs;

    if (status >= 400) {
        state.totals.errorRequests += 1;
    }

    if (status >= 500) {
        state.totals.serverErrors += 1;
    }

    if (durationMs >= SLOW_REQUEST_THRESHOLD_MS) {
        state.totals.slowRequests += 1;
    }

    state.recentRequests.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time: new Date(time).toISOString(),
        method,
        path,
        status,
        ip: ip || "-",
        userAgent: userAgent || "-",
        durationMs,
        requestBytes,
        responseBytes,
        username: username || null,
    });

    if (state.recentRequests.length > MAX_RECENT_REQUESTS) {
        state.recentRequests.length = MAX_RECENT_REQUESTS;
    }
}

function trimActiveRequestsIfNeeded() {
    while (state.activeRequests.size > MAX_ACTIVE_REQUESTS) {
        const oldestKey = state.activeRequests.keys().next().value;

        if (!oldestKey) {
            return;
        }

        state.activeRequests.delete(oldestKey);
    }
}

function sampleActiveRequests() {
    const now = Date.now();

    return Array.from(state.activeRequests.values())
        .map((item) => ({
            id: item.id,
            method: item.method,
            path: item.path,
            ip: item.ip,
            requestBytes: item.requestBytes,
            startedAt: new Date(item.startedAt).toISOString(),
            inFlightMs: Math.max(now - item.startedAt, 0),
        }))
        .sort((left, right) => right.inFlightMs - left.inFlightMs)
        .slice(0, ACTIVE_REQUEST_SNAPSHOT_LIMIT);
}

function captureEventLoopSample() {
    const sample = {
        meanMs: normalizeMsValue(eventLoopDelayMonitor.mean),
        maxMs: normalizeMsValue(eventLoopDelayMonitor.max),
        p95Ms: normalizeMsValue(eventLoopDelayMonitor.percentile(95)),
        p99Ms: normalizeMsValue(eventLoopDelayMonitor.percentile(99)),
        sampledAt: new Date().toISOString(),
    };

    state.eventLoop.current = sample;

    if (sample.maxMs >= LAG_SPIKE_THRESHOLD_MS || sample.p99Ms >= LAG_SPIKE_THRESHOLD_MS) {
        state.recentLagSpikes.unshift({
            ...sample,
            activeRequests: sampleActiveRequests(),
        });

        if (state.recentLagSpikes.length > MAX_RECENT_LAG_SPIKES) {
            state.recentLagSpikes.length = MAX_RECENT_LAG_SPIKES;
        }
    }

    eventLoopDelayMonitor.reset();
}

setInterval(captureEventLoopSample, EVENT_LOOP_SAMPLE_INTERVAL_MS).unref();

function middleware(req, res, next) {
    const startedAt = Date.now();
    const requestBytes = estimateRequestBytes(req);
    const requestId = createRequestId();
    let finalized = false;
    req.requestId = requestId;
    res.locals.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    state.currentInFlight += 1;
    state.peakInFlight = Math.max(state.peakInFlight, state.currentInFlight);
    state.activeRequests.set(requestId, {
        id: requestId,
        startedAt,
        method: req.method,
        path: req.originalUrl || req.url || "/",
        ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "-",
        requestBytes,
    });
    trimActiveRequestsIfNeeded();

    res.on("finish", () => {
        if (finalized) {
            return;
        }

        finalized = true;
        const durationMs = Date.now() - startedAt;
        const contentLength = normalizeByteValue(res.getHeader("content-length"));
        state.currentInFlight = Math.max(state.currentInFlight - 1, 0);
        state.activeRequests.delete(requestId);

        recordRequest({
            time: startedAt,
            method: req.method,
            path: req.originalUrl || req.url || "/",
            status: res.statusCode,
            ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
            userAgent: req.headers["user-agent"],
            durationMs,
            requestBytes,
            responseBytes: contentLength,
            username: req.user?.username || null,
        });
    });

    res.on("close", () => {
        if (finalized) {
            return;
        }

        finalized = true;
        state.currentInFlight = Math.max(state.currentInFlight - 1, 0);
        state.activeRequests.delete(requestId);
    });

    next();
}

function calculatePercentileDurations(percentile = 95) {
    const durations = state.recentRequests
        .map((item) => Number(item.durationMs || 0))
        .filter((item) => Number.isFinite(item))
        .sort((left, right) => left - right);

    if (!durations.length) {
        return 0;
    }

    const index = Math.min(
        durations.length - 1,
        Math.max(0, Math.ceil((percentile / 100) * durations.length) - 1)
    );

    return durations[index];
}

function getCurrentMinuteStats() {
    const now = Date.now();
    const recent = state.recentRequests.filter((item) => {
        const time = new Date(item.time).getTime();
        return Number.isFinite(time) && now - time <= 60 * 1000;
    });

    return {
        requestsPerMinute: recent.length,
        bandwidthPerMinuteBytes: recent.reduce(
            (total, item) => total + Number(item.requestBytes || 0) + Number(item.responseBytes || 0),
            0
        ),
        slowRequestsPerMinute: recent.filter((item) => Number(item.durationMs || 0) >= SLOW_REQUEST_THRESHOLD_MS).length,
    };
}

function getSnapshot() {
    const currentMinuteStats = getCurrentMinuteStats();

    return {
        startedAt: state.startedAt.toISOString(),
        uptimeSeconds: Math.floor((Date.now() - state.startedAt.getTime()) / 1000),
        totals: {
            ...state.totals,
            currentInFlight: state.currentInFlight,
            peakInFlight: state.peakInFlight,
            uniqueIps: state.ipCounts.size,
            averageDurationMs:
                state.totals.requests > 0
                    ? Math.round(state.totals.durationMs / state.totals.requests)
                    : 0,
            p95DurationMs: calculatePercentileDurations(95),
            requestsPerMinute: currentMinuteStats.requestsPerMinute,
            bandwidthPerMinuteBytes: currentMinuteStats.bandwidthPerMinuteBytes,
            slowRequestsPerMinute: currentMinuteStats.slowRequestsPerMinute,
        },
        perHour: Array.from(state.perHour.entries()).map(([time, value]) => ({
            time,
            ...value,
            averageDurationMs: value.requests > 0
                ? Math.round(value.durationMs / value.requests)
                : 0,
        })),
        topPaths: Array.from(state.pathCounts.entries())
            .map(([path, total]) => ({path, total}))
            .sort((left, right) => right.total - left.total)
            .slice(0, 10),
        statusBreakdown: Array.from(state.statusCounts.entries())
            .map(([status, total]) => ({status, total}))
            .sort((left, right) => Number(left.status) - Number(right.status)),
        methodBreakdown: Array.from(state.methodCounts.entries())
            .map(([method, total]) => ({method, total}))
            .sort((left, right) => right.total - left.total),
        recentRequests: state.recentRequests,
        activeRequests: sampleActiveRequests(),
        recentLagSpikes: state.recentLagSpikes,
        eventLoop: state.eventLoop,
    };
}

module.exports = {
    middleware,
    getSnapshot,
};
