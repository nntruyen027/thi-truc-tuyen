const router =
    require("express").Router();

const upload =
    require("../../utils/upload");

const query =
    require("./file.query");

const auth =
    require("../../middlewares/auth");

const resUtil =
    require("../../utils/response");


router.post(
    "/upload",
    auth,
    upload.single("file"),
    async (req, res) => {

        const f = req.file;

        const fullPath = f.path;

        const relative =
            fullPath.split("uploads")[1];

        const duongDan =
            "uploads" +
            relative.replace(/\\/g, "/");

        const data =
            await query.themFile(
                f.filename,
                f.originalname,
                duongDan,
                f.mimetype,
                f.size,
                req.user.id
            );

        resUtil.ok(res, data);

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
                await query.layFile(
                    page,
                    size,
                    search
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


router.delete(
    "/:id",
    auth,
    async (req, res) => {

        try {

            const data =
                await query.xoaFile(
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