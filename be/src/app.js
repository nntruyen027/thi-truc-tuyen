const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")

const routes = require("./routes")

const app = express()

app.use(express.json())
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

module.exports = app