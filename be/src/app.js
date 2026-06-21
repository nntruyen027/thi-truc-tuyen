const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")
const multer = require("multer")

const routes = require("./app/routes")
const systemAnalyticsTracker = require("./domains/system-analytics/system_analytics.tracker");
const resUtil = require("./core/utils/response");

const app = express()
const JSON_BODY_LIMIT = process.env.JSON_BODY_LIMIT || "5mb";

function parseCsvEnv(value, fallback = []) {
    if (!value || typeof value !== "string") {
        return fallback;
    }

    const parsed = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

    return parsed.length ? parsed : fallback;
}

function normalizeOrigin(origin) {
    if (!origin || typeof origin !== "string") {
        return "";
    }

    return origin.trim().replace(/\/$/, "").toLowerCase();
}

const DEFAULT_ALLOWED_ORIGINS = [
    "https://cuocthi.thanhuycantho.gov.vn",
    "https://cuocthi.thanhuycantho.vn",
];

const allowedOrigins = new Set(
    parseCsvEnv(process.env.CORS_ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS)
        .map((item) => normalizeOrigin(item))
        .filter(Boolean)
);

const blockedUserAgentPatterns = parseCsvEnv(
    process.env.CORS_BLOCKED_USER_AGENTS,
    [
        "PostmanRuntime",
        "Insomnia",
        "Paw",
        "HTTPie",
        "curl",
        "Wget",
        "python-requests",
        "okhttp",
    ]
).map((item) => item.toLowerCase());

const corsAllowedMethods = parseCsvEnv(
    process.env.CORS_ALLOWED_METHODS,
    ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
);

const corsAllowedHeaders = parseCsvEnv(
    process.env.CORS_ALLOWED_HEADERS,
    ["Content-Type", "Authorization"]
);

const corsRequireOrigin = String(process.env.CORS_REQUIRE_ORIGIN || "true") !== "false";
const corsAllowCredentials = String(process.env.CORS_ALLOW_CREDENTIALS || "true") !== "false";
const corsMethodsAllowedWithoutOrigin = new Set(["GET", "HEAD", "OPTIONS"]);

function isBlockedUserAgent(userAgent) {
    const normalizedUa = String(userAgent || "").toLowerCase();

    if (!normalizedUa) {
        return false;
    }

    return blockedUserAgentPatterns.some((pattern) => normalizedUa.includes(pattern));
}

function buildCorsOptions(req, callback) {
    const origin = req.get("origin");
    const normalizedOrigin = normalizeOrigin(origin);
    const method = String(req.method || "GET").toUpperCase();

    if (!normalizedOrigin) {
        if (!corsRequireOrigin || corsMethodsAllowedWithoutOrigin.has(method)) {
            return callback(null, {
                origin: true,
                credentials: corsAllowCredentials,
                methods: corsAllowedMethods,
                allowedHeaders: corsAllowedHeaders,
            });
        }

        return callback(new Error("CORS_ORIGIN_REQUIRED"));
    }

    if (!allowedOrigins.has(normalizedOrigin)) {
        return callback(new Error("CORS_ORIGIN_NOT_ALLOWED"));
    }

    return callback(null, {
        origin: true,
        credentials: corsAllowCredentials,
        methods: corsAllowedMethods,
        allowedHeaders: corsAllowedHeaders,
    });
}

app.use(express.json({limit: JSON_BODY_LIMIT}))
app.use(cors(buildCorsOptions))
app.options(/.*/, cors(buildCorsOptions))
app.use("/api", (req, res, next) => {
    const userAgent = req.get("user-agent") || "";
    const method = String(req.method || "GET").toUpperCase();

    if (isBlockedUserAgent(userAgent)) {
        return resUtil.error(res, {
            status: 403,
            message: "Yêu cầu bị từ chối: công cụ API test không được phép sử dụng.",
        });
    }

    if (
        corsRequireOrigin
        && !req.get("origin")
        && !corsMethodsAllowedWithoutOrigin.has(method)
    ) {
        return resUtil.error(res, {
            status: 403,
            message: "Yêu cầu bị từ chối: thiếu Origin hợp lệ từ trình duyệt.",
        });
    }

    next();
})
app.use(systemAnalyticsTracker.middleware)
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        contentSecurityPolicy: false,
        xFrameOptions: false
    })
)

const UPLOAD_PATH =
    path.resolve(
        process.cwd(),
        "uploads"
    )

const LEGACY_UPLOAD_PATH =
    path.resolve(
        process.cwd(),
        "src",
        "uploads"
    )


app.use(
    "/uploads",
    (req, res, next) => {

        res.setHeader(
            "X-Frame-Options",
            "ALLOWALL"
        );

        res.setHeader(
            "Content-Security-Policy",
            "frame-ancestors *"
        );

        next();

    },
    express.static(UPLOAD_PATH, {
        maxAge: "365d",
        immutable: true,
        etag: false,
        lastModified: false,
    }),
    express.static(LEGACY_UPLOAD_PATH, {
        maxAge: "30d",
        immutable: true,
        etag: false,
        lastModified: false,
    })
);

app.use("/api", routes)

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return resUtil.error(res, {
                status: 413,
                message: "Kích thước file vượt quá giới hạn 50MB",
            })
        }

        return resUtil.error(res, {
            status: 400,
            message: err.message,
        })
    }

    if (err?.message === "CORS_ORIGIN_REQUIRED") {
        return resUtil.error(res, {
            status: 403,
            message: "CORS bị từ chối: thiếu Origin hợp lệ.",
        })
    }

    if (err?.message === "CORS_ORIGIN_NOT_ALLOWED") {
        return resUtil.error(res, {
            status: 403,
            message: "CORS bị từ chối: Origin không nằm trong danh sách cho phép.",
        })
    }

    if (err) {
        return resUtil.error(res, {
            status: 500,
            message: err.message || "Có lỗi xảy ra trong quá trình xử lý file",
            stack: err.stack,
            name: err.name,
        })
    }

    next()
})

module.exports = app
