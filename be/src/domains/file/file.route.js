const router =
    require("express").Router();
const fs = require("fs");
const path = require("path");
const fsp = require("fs/promises");
const { randomUUID } = require("crypto");

const upload =
    require("../../core/utils/upload");

const service =
    require("./file.service");

const auth =
    require("../../core/middlewares/auth");

const resUtil =
    require("../../core/utils/response");
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const isRawBinaryRequest = (req) => {
    const contentType = String(req.headers["content-type"] || "").toLowerCase();

    return contentType.includes("application/octet-stream")
        || contentType.includes("binary/octet-stream");
};

const runMulterSingle = (req, res) =>
    new Promise((resolve, reject) => {
        upload.single("file")(req, res, (err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(req.file);
        });
    });

const writeRawBinaryToDisk = async (req) => {
    const rawName =
        decodeURIComponent(String(req.headers["x-file-name"] || "upload.bin"));

    const originalname =
        path.basename(rawName) || "upload.bin";

    const ext =
        path.extname(originalname) || ".bin";

    const year =
        new Date().getFullYear().toString();

    const uploadDir =
        path.resolve(process.cwd(), "uploads", year);

    await fsp.mkdir(uploadDir, {recursive: true});

    const filename =
        `${Date.now()}-${randomUUID()}${ext.toLowerCase()}`;

    const filePath =
        path.join(uploadDir, filename);

    const writeStream =
        fs.createWriteStream(filePath);

    let size = 0;
    let settled = false;

    return await new Promise((resolve, reject) => {
        const fail = async (error) => {
            if (settled) return;
            settled = true;

            writeStream.destroy();
            await fsp.unlink(filePath).catch(() => null);
            reject(error);
        };

        req.on("data", (chunk) => {
            size += chunk.length;

            if (size > MAX_FILE_SIZE_BYTES) {
                void fail(new Error("Kích thước file vượt quá giới hạn 50MB"));
                req.destroy();
            }
        });

        req.on("error", (error) => {
            void fail(error);
        });

        writeStream.on("error", (error) => {
            void fail(error);
        });

        writeStream.on("finish", () => {
            if (settled) return;
            settled = true;

            resolve({
                fieldname: "file",
                originalname,
                encoding: "7bit",
                mimetype: req.headers["content-type"] || "application/octet-stream",
                destination: uploadDir,
                filename,
                path: filePath,
                size,
            });
        });

        req.pipe(writeStream);
    });
};


router.post(
    "/upload",
    auth,
    async (req, res) => {
        try {
            const uploadedFile =
                isRawBinaryRequest(req)
                    ? await writeRawBinaryToDisk(req)
                    : await runMulterSingle(req, res);

            if (!uploadedFile) {
                throw new Error("Không tìm thấy file tải lên");
            }

            const data =
                await service.createFile({
                    file: uploadedFile,
                    userId: req.user.id,
                    workspaceId: requireWorkspaceId(req),
                });

            resUtil.ok(res, data);
        } catch (err) {
            console.error("[file/upload]", {
                message: err?.message || String(err),
                contentType: req.headers["content-type"],
                hasFile: Boolean(req.file),
                fileKeys: req.file ? Object.keys(req.file) : [],
                bodyKeys: req.body ? Object.keys(req.body) : [],
            });

            resUtil.error(res, err);
        }
    }
);

router.get(
    "/",
    async (req, res) => {

        try {

            const {
                page = 1,
                size = 10,
                search = ""
            } = req.query;

            const data =
                await service.listFiles({
                    workspaceId: requireWorkspaceId(req),
                    page,
                    size,
                    search,
                });

            resUtil.ok(
                res,
                data
            );

        } catch (err) {

            resUtil.error(
                res,
                err
            );

        }

    }
);


router.delete(
    "/:id",
    auth,
    async (req, res) => {

        try {

            const data =
                await service.deleteFile(
                    requireWorkspaceId(req),
                    req.params.id
                );

            resUtil.ok(
                res,
                data
            );

        } catch (err) {

            resUtil.error(
                res,
                err
            );

        }

    }
);


module.exports = router;

