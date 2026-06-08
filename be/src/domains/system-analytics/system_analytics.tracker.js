const MAX_RECENT_REQUESTS = 200;
const MAX_BUCKETS = 72;

const state = {
    startedAt: new Date(),
    totals: {
        requests: 0,
        requestBytes: 0,
        responseBytes: 0,
        errorRequests: 0,
        durationMs: 0,
    },
    recentRequests: [],
    perHour: new Map(),
    pathCounts: new Map(),
    statusCounts: new Map(),
    methodCounts: new Map(),
    ipCounts: new Map(),
};

function normalizeByteValue(value) {
    const normalized = Number(value);
    return Number.isFinite(normalized) && normalized >= 0
        ? normalized
        : 0;
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

    if (req.body && typeof req.body === "object") {
        try {
            return Buffer.byteLength(JSON.stringify(req.body));
        } catch {
            return 0;
        }
    }

    return 0;
}

function incrementMap(map, key, value = 1) {
    map.set(key, normalizeByteValue(map.get(key)) + normalizeByteValue(value));
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

    incrementMap(state.pathCounts, path);
    incrementMap(state.methodCounts, method);
    incrementMap(state.statusCounts, String(status));
    incrementMap(state.ipCounts, ip || "unknown");

    state.totals.requests += 1;
    state.totals.requestBytes += requestBytes;
    state.totals.responseBytes += responseBytes;
    state.totals.durationMs += durationMs;

    if (status >= 400) {
        state.totals.errorRequests += 1;
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

function middleware(req, res, next) {
    const startedAt = Date.now();
    const requestBytes = estimateRequestBytes(req);
    let responseBytes = 0;

    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk, encoding, callback) => {
        if (chunk) {
            responseBytes += Buffer.isBuffer(chunk)
                ? chunk.length
                : Buffer.byteLength(chunk, encoding);
        }

        return originalWrite(chunk, encoding, callback);
    };

    res.end = (chunk, encoding, callback) => {
        if (chunk) {
            responseBytes += Buffer.isBuffer(chunk)
                ? chunk.length
                : Buffer.byteLength(chunk, encoding);
        }

        return originalEnd(chunk, encoding, callback);
    };

    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        const contentLength = normalizeByteValue(res.getHeader("content-length"));

        recordRequest({
            time: startedAt,
            method: req.method,
            path: req.originalUrl || req.url || "/",
            status: res.statusCode,
            ip: req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
            userAgent: req.headers["user-agent"],
            durationMs,
            requestBytes,
            responseBytes: contentLength > 0 ? contentLength : responseBytes,
            username: req.user?.username || null,
        });
    });

    next();
}

function getSnapshot() {
    return {
        startedAt: state.startedAt.toISOString(),
        uptimeSeconds: Math.floor((Date.now() - state.startedAt.getTime()) / 1000),
        totals: {
            ...state.totals,
            uniqueIps: state.ipCounts.size,
            averageDurationMs:
                state.totals.requests > 0
                    ? Math.round(state.totals.durationMs / state.totals.requests)
                    : 0,
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
    };
}

module.exports = {
    middleware,
    getSnapshot,
};
