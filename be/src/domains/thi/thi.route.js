const router =
    require("express").Router({mergeParams: true})

const query = require("./thi.query")
const validation = require("./thi.validation")

const resUtil = require("../../core/utils/response")
const auth = require("../../core/middlewares/auth")
const { requireWorkspaceId } = require("../../core/utils/workspace-scope");


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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
                    normalizedBaiThiId
                )

            if (!choPhepTraLoiTuLuan) {
                return resUtil.ok(res, true)
            }

                await validation.ensureTuLuanAnswerAllowed(
                    requireWorkspaceId(req),
                    normalizedBaiThiId
                )

            const data =
                await query.luuCauTraLoiTuLuan(
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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
                    requireWorkspaceId(req),
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

            await validation.ensureDotThiQuestionConfigValid(requireWorkspaceId(req), normalizedDotThiId)

            const result =
                await query.startThi(
                    requireWorkspaceId(req),
                    normalizedDotThiId,
                    thiSinhId,
                )

            const tuLuanInfo =
                await validation.layTrangThaiTuLuanTheoDotThi(requireWorkspaceId(req), normalizedDotThiId)

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
                    requireWorkspaceId(req),
                    baiThiId
                )
            }

            const data =
                await query.pauseThi(
                    requireWorkspaceId(req),
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

        const data = await query.nopDuDoanKetQuan(requireWorkspaceId(req), baiThiId, soDuDoan);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/dot-thi/:dotThiId/:top", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.params.dotThiId, "Đợt thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangTracNghiemTheoDotThi(requireWorkspaceId(req), dotThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})


router.get("/ket-qua-trac-nghiem/cuoc-thi/:cuocThiId/:top", async (req, res) => {
    try {
        const cuocThiId = validation.ensureRequiredId(req.params.cuocThiId, "Cuộc thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangTracNghiemTheoCuocThi(requireWorkspaceId(req), cuocThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

module.exports = router

