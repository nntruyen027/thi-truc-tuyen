const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");


// thư mục gốc project
const ROOT =
    path.join(__dirname, "../../../");


// thư mục uploads tuyệt đối
const UPLOAD_DIR =
    path.join(ROOT, "uploads");


const storage =
    multer.diskStorage({

        destination: (req, file, cb) => {

            const year =
                new Date().getFullYear().toString();

            const dir =
                path.join(
                    UPLOAD_DIR,
                    year
                );

            // tạo nếu chưa có
            if (!fs.existsSync(dir)) {

                fs.mkdirSync(
                    dir,
                    {recursive: true}
                );

            }

            cb(null, dir);

        },

        filename: (req, file, cb) => {

            const ext =
                path.extname(
                    file.originalname
                );

            const name =
                `${Date.now()}-${randomUUID()}${ext.toLowerCase()}`;

            cb(null, name);

        }

    });


module.exports =
    multer({
        storage,
        limits: {
            fileSize: 50 * 1024 * 1024,
        },
    });
