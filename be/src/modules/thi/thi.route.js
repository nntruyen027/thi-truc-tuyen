const router =
    require("express").Router({mergeParams: true})

const query = require("./thi.query")

const resUtil = require("../../utils/response")
const auth = require("../../middlewares/auth")


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

            const data =
                await query.conDuocThi(
                    dotThiId,
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

            const data =
                await query.layBaiDangLam(
                    thiSinhId,
                    dotThiId,
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

            const thiSinhId =
                req.user.id

            const data =
                await query.taoDeThi(
                    dotThiId,
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

            const thiSinhId =
                req.user.id

            const data =
                await query.batDauThi(
                    deThiId,
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

            const data =
                await query.layCauHoiDeThi(
                    deThiId,
                    baiThiId
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

            const data =
                await query.luuCauTraLoi(
                    baiThiId,
                    cauHoiId,
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

            const data =
                await query.luuCauTraLoiTuLuan(
                    baiThiId,
                    cauHoiId,
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

            const data =
                await query.nopBai(
                    baiThiId,
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

            const data =
                await query.lichSuThi(
                    thiSinhId,
                    dotThiId,
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

            const thiSinhId =
                req.user.id

            const data =
                await query.startThi(
                    dotThiId,
                    thiSinhId,
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

router.post(
    "/pause/:baiThiId",
    auth,
    async (req, res) => {

        try {

            const baiThiId = req.params.baiThiId


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
        const baiThiId = req.params.baiThiId;
        const {soDuDoan} = req.body;

        const data = await query.nopDuDoanKetQuan(baiThiId, soDuDoan);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/dot-thi/:dotThiId/:top", async (req, res) => {
    try {
        const {dotThiId, top} = req.params;
        const data = await query.xepHangTracNghiemTheoDotThi(dotThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})


router.get("/ket-qua-trac-nghiem/cuoc-thi/:cuocThiId/:top", async (req, res) => {
    try {
        const {cuocThiId, top} = req.params;
        const data = await query.xepHangTracNghiemTheoCuocThi(cuocThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

module.exports = router