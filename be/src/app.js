const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")
const multer = require("multer")

const routes = require("./routes")

const app = express()

app.use(express.json({limit: "50mb"}))
app.use(cors())
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
    express.static(UPLOAD_PATH)
);

app.use("/api", routes)

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message: "Kích thước file vượt quá giới hạn 50MB",
            })
        }

        return res.status(400).json({
            success: false,
            message: err.message,
        })
    }

    if (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Có lỗi xảy ra trong quá trình xử lý file",
        })
    }

    next()
})

module.exports = app
