const resUtil = require("../utils/response");

const limiterStores = new Map();
const CLEANUP_INTERVAL_MS = 60 * 1000;

function getClientIp(req) {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim()) {
        return forwardedFor
            .split(",")[0]
            .trim()
            .toLowerCase();
    }

    return String(
        req.ip
        || req.socket?.remoteAddress
        || req.connection?.remoteAddress
        || "unknown"
    ).toLowerCase();
}

function getStore(name) {
    if (!limiterStores.has(name)) {
        limiterStores.set(name, {
            entries: new Map(),
            lastCleanupAt: 0,
        });
    }

    return limiterStores.get(name);
}

function cleanupStore(store, now) {
    if ((now - store.lastCleanupAt) < CLEANUP_INTERVAL_MS) {
        return;
    }

    for (const [key, entry] of store.entries.entries()) {
        if (entry.resetAt <= now) {
            store.entries.delete(key);
        }
    }

    store.lastCleanupAt = now;
}

function buildRateLimitKey(req, scope = "ip-user") {
    const userId = req.user?.id ? `user:${req.user.id}` : null;
    const ip = getClientIp(req);

    if (scope === "user" && userId) {
        return userId;
    }

    if (scope === "ip") {
        return `ip:${ip}`;
    }

    return [userId, `ip:${ip}`]
        .filter(Boolean)
        .join("|") || `ip:${ip}`;
}

function createRateLimit({
    name,
    windowMs,
    max,
    message = "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
    scope = "ip-user",
} = {}) {
    const normalizedWindowMs = Number(windowMs);
    const normalizedMax = Number(max);

    if (!name) {
        throw new Error("Thiếu tên cấu hình rate limit");
    }

    if (!Number.isFinite(normalizedWindowMs) || normalizedWindowMs <= 0) {
        throw new Error(`windowMs không hợp lệ cho rate limit: ${name}`);
    }

    if (!Number.isFinite(normalizedMax) || normalizedMax <= 0) {
        throw new Error(`max không hợp lệ cho rate limit: ${name}`);
    }

    const store = getStore(name);

    return (req, res, next) => {
        const now = Date.now();
        cleanupStore(store, now);

        const key = buildRateLimitKey(req, scope);
        const current = store.entries.get(key);

        if (!current || current.resetAt <= now) {
            store.entries.set(key, {
                count: 1,
                resetAt: now + normalizedWindowMs,
            });
            return next();
        }

        current.count += 1;

        if (current.count > normalizedMax) {
            const retryAfterSeconds = Math.max(
                1,
                Math.ceil((current.resetAt - now) / 1000)
            );

            res.setHeader("Retry-After", String(retryAfterSeconds));

            return resUtil.error(res, {
                status: 429,
                message,
            });
        }

        return next();
    };
}

module.exports = {
    createRateLimit,
};
