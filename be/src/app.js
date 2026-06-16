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
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
    ],
}

app.use(express.json({limit: JSON_BODY_LIMIT}))
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
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
