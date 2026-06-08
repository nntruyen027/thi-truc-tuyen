const router =
    require("express").Router({mergeParams: true})

const query = require("./thi.query")
const validation = require("./thi.validation")
const exportService = require("./thi_export.service")

const resUtil = require("../../core/utils/response")
const auth = require("../../core/middlewares/auth")
const role = require("../../core/middlewares/role")


/**
 * kiểm tra còn được thi không
 */
router.get(
    "/con-duoc-thi",
    auth,
    async (req, res) => {

        try {
            const {dotThiId} = req.query
            const thiSinhId = req.user.id
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")

            const data =
                await query.conDuocThi(
                    normalizedDotThiId,
                    thiSinhId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * lấy bài đang làm
 */
router.get(
    "/bai-dang-lam",
    auth,
    async (req, res) => {

        try {
            const {dotThiId} = req.query

            const thiSinhId = req.user.id
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")

            const data =
                await query.layBaiDangLam(
                    thiSinhId,
                    normalizedDotThiId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * tạo đề thi
 */
router.post(
    "/tao-de",
    auth,
    async (req, res) => {

        try {
            const {dotThiId} = req.body
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")

            const thiSinhId =
                req.user.id

            const data =
                await query.taoDeThi(
                    normalizedDotThiId,
                    thiSinhId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * bắt đầu thi
 */
router.post(
    "/bat-dau",
    auth,
    async (req, res) => {

        try {
            const {
                deThiId,
            } = req.body
            const normalizedDeThiId =
                validation.ensureRequiredId(deThiId, "Đề thi")

            const thiSinhId =
                req.user.id

            const data =
                await query.batDauThi(
                    normalizedDeThiId,
                    thiSinhId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * lấy câu hỏi đề thi
 */
router.get(
    "/cau-hoi",
    auth,
    async (req, res) => {

        try {
            const {
                deThiId,
                baiThiId,
            } = req.query
            const normalizedDeThiId =
                validation.ensureRequiredId(deThiId, "Đề thi")
            const normalizedBaiThiId =
                validation.ensureRequiredId(baiThiId, "Bài thi")

            const data =
                await query.layCauHoiDeThi(
                    normalizedDeThiId,
                    normalizedBaiThiId
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * lưu câu trả lời
 */
router.post(
    "/tra-loi",
    auth,
    async (req, res) => {

        try {
            const {
                baiThiId,
                cauHoiId,
                dapAn,
            } = req.body
            const normalizedBaiThiId =
                validation.ensureRequiredId(baiThiId, "Bài thi")
            const normalizedCauHoiId =
                validation.ensureRequiredId(cauHoiId, "Câu hỏi")

            const data =
                await query.luuCauTraLoi(
                    normalizedBaiThiId,
                    normalizedCauHoiId,
                    dapAn,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)

router.post(
    "/tra-loi-tu-luan",
    auth,
    async (req, res) => {

        try {
            const {
                baiThiId,
                cauHoiId,
                dapAn,
            } = req.body
            const normalizedBaiThiId =
                validation.ensureRequiredId(baiThiId, "Bài thi")
            const normalizedCauHoiId =
                validation.ensureRequiredId(cauHoiId, "Câu hỏi")

            const choPhepTraLoiTuLuan =
                await validation.coChoPhepTraLoiTuLuan(
                    normalizedBaiThiId
                )

            if (!choPhepTraLoiTuLuan) {
                return resUtil.ok(res, true)
            }

                await validation.ensureTuLuanAnswerAllowed(
                    normalizedBaiThiId
                )

            const data =
                await query.luuCauTraLoiTuLuan(
                    normalizedBaiThiId,
                    normalizedCauHoiId,
                    dapAn,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * nộp bài
 */
router.post(
    "/nop-bai",
    auth,
    async (req, res) => {

        try {
            const {
                baiThiId,
            } = req.body
            const normalizedBaiThiId =
                validation.ensureRequiredId(baiThiId, "Bài thi")

            const data =
                await query.nopBai(
                    normalizedBaiThiId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)


/**
 * lịch sử thi
 */
router.get(
    "/lich-su",
    auth,
    async (req, res) => {

        try {
            const {dotThiId} =
                req.query

            const thiSinhId =
                req.user.id
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")

            const data =
                await query.lichSuThi(
                    thiSinhId,
                    normalizedDotThiId,
                )

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)

router.post(
    "/start",
    auth,
    async (req, res) => {

        try {
            const {dotThiId} =
                req.body
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")

            const thiSinhId =
                req.user.id

            await validation.ensureDotThiQuestionConfigValid(normalizedDotThiId)

            const result =
                await query.startThi(
                    normalizedDotThiId,
                    thiSinhId,
                )

            const tuLuanInfo =
                await validation.layTrangThaiTuLuanTheoDotThi(normalizedDotThiId)

            if (!tuLuanInfo.coTuLuan) {
                result.tuLuan = []
            }

            resUtil.ok(
                res,
                result
            )

        } catch (err) {

            resUtil.error(
                res,
                err
            )

        }

    }
)

router.post(
    "/pause/:baiThiId",
    auth,
    async (req, res) => {

        try {
            const baiThiId = validation.ensureRequiredId(req.params.baiThiId, "Bài thi")
            const reason = req.body?.reason

            if (reason !== "submit") {
                await validation.ensurePauseAllowed(
                    baiThiId
                )
            }

            const data =
                await query.pauseThi(
                    baiThiId
                )

            resUtil.ok(
                res,
                data
            )

        } catch (err) {

            resUtil.error(
                res,
                err
            )

        }

    }
)

router.post("/du-doan/:baiThiId", auth, async (req, res) => {
    try {
        const baiThiId = validation.ensureRequiredId(req.params.baiThiId, "Bài thi");
        const soDuDoan = validation.normalizePredictionValue(req.body?.soDuDoan);

        const data = await query.nopDuDoanKetQuan(baiThiId, soDuDoan);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/export", auth, role(["admin"]), async (req, res) => {
    try {
        const scope = validation.normalizeKetQuaTracNghiemExportScope(req.query);
        const result = await exportService.exportKetQuaTracNghiem(scope);

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${result.fileName}"`
        );

        res.send(Buffer.from(result.buffer));
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/dot-thi/:dotThiId/:top", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.params.dotThiId, "Đợt thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangTracNghiemTheoDotThi(dotThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})


router.get("/ket-qua-trac-nghiem/cuoc-thi/:cuocThiId/:top", async (req, res) => {
    try {
        const cuocThiId = validation.ensureRequiredId(req.params.cuocThiId, "Cuộc thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangTracNghiemTheoCuocThi(cuocThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/bang-vang-don-vi/dot-thi/:dotThiId/:top", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.params.dotThiId, "Đợt thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangDonViTheoDotThi(dotThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/bang-vang-don-vi/dot-thi/:dotThiId", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.params.dotThiId, "Đợt thi");
        const data = await query.xepHangDonViTheoDotThi(dotThiId);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/bang-vang-don-vi/cuoc-thi/:cuocThiId/:top", async (req, res) => {
    try {
        const cuocThiId = validation.ensureRequiredId(req.params.cuocThiId, "Cuộc thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangDonViTheoCuocThi(cuocThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/bang-vang-don-vi/cuoc-thi/:cuocThiId", async (req, res) => {
    try {
        const cuocThiId = validation.ensureRequiredId(req.params.cuocThiId, "Cuộc thi");
        const data = await query.xepHangDonViTheoCuocThi(cuocThiId);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

module.exports = router
