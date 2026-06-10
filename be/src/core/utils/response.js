function truncateText(value, maxLength = 500) {
    const text = String(value ?? "");
    return text.length > maxLength
        ? `${text.slice(0, maxLength)}...`
        : text;
}

function sanitizeValue(value, depth = 0) {
    if (value == null) {
        return value;
    }

    if (depth >= 2) {
        if (Array.isArray(value)) {
            return `[array:${value.length}]`;
        }

        if (typeof value === "object") {
            return "[object]";
        }

        return typeof value === "string"
            ? truncateText(value, 180)
            : value;
    }

    if (Array.isArray(value)) {
        return value.slice(0, 10).map((item) => sanitizeValue(item, depth + 1));
    }

    if (typeof value === "object") {
        const blockedKeys = new Set([
            "password",
            "mat_khau",
            "token",
            "access",
            "refresh",
            "authorization",
            "cookie",
        ]);

        return Object.fromEntries(
            Object.entries(value)
                .slice(0, 20)
                .map(([key, entryValue]) => [
                    key,
                    blockedKeys.has(String(key).toLowerCase())
                        ? "[redacted]"
                        : sanitizeValue(entryValue, depth + 1),
                ])
        );
    }

    return typeof value === "string"
        ? truncateText(value, 180)
        : value;
}

function logServerError(res, err, status, message) {
    if (status < 500) {
        return;
    }

    const req = res.req;
    const cause = err?.cause || err?.originalError || null;
    const payload = {
        requestId: req?.requestId || res.locals?.requestId || null,
        method: req?.method || null,
        path: req?.originalUrl || req?.url || null,
        status,
        message,
        errorName: err?.name || null,
        errorCode: err?.code || cause?.code || null,
        causeMessage: cause?.message
            ? truncateText(cause.message, 1200)
            : null,
        detail: cause?.detail
            ? truncateText(cause.detail, 1200)
            : null,
        hint: cause?.hint
            ? truncateText(cause.hint, 800)
            : null,
        table: cause?.table || null,
        column: cause?.column || null,
        constraint: cause?.constraint || null,
        stack: typeof err?.stack === "string"
            ? truncateText(err.stack, 2000)
            : null,
        userId: req?.user?.id || null,
        username: req?.user?.username || null,
        ip: req?.ip || req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || null,
        query: sanitizeValue(req?.query),
        params: sanitizeValue(req?.params),
        body: sanitizeValue(req?.body),
    };

    console.error("[server-error]", JSON.stringify(payload));
}

exports.ok = (res, data) => {
    res.json({
        success: true,
        data
    })
}

exports.error = (res, err) => {
    const status =
        typeof err === "string"
            ? 400
            : Number(err?.status || err?.statusCode) || 500;

    const message =
        typeof err === "string"
            ? err
            : err?.message || "Có lỗi xảy ra";

    logServerError(res, err, status, message);

    res.status(status).json({
        success: false,
        message,
        requestId: res.req?.requestId || res.locals?.requestId || undefined,
    })
}
