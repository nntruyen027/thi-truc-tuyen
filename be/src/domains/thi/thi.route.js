const router =
    require("express").Router({mergeParams: true})

const query = require("./thi.query")
const validation = require("./thi.validation")
const publicRankingsSnapshotService = require("./public_rankings_snapshot.service");

const resUtil = require("../../core/utils/response")
const auth = require("../../core/middlewares/auth")
const role = require("../../core/middlewares/role")
const csrfUtil = require("../../core/utils/csrf")

const EXAM_FLOW_DEBUG = process.env.EXAM_FLOW_DEBUG === "1";
const EXAM_FLOW_SLOW_MS = Number(process.env.EXAM_FLOW_SLOW_MS || 300);
const PUBLIC_RANKINGS_CACHE_TTL_MS = Number(process.env.PUBLIC_RANKINGS_CACHE_TTL_MS || 120000);
const MAX_PUBLIC_RANKINGS_CACHE_ENTRIES = Number(process.env.MAX_PUBLIC_RANKINGS_CACHE_ENTRIES || 20);
const publicRankingsCache = new Map();
const publicRankingsInFlight = new Map();

function hasDotThiResultsPayload(payload) {
    return Boolean(payload)
        && Object.prototype.hasOwnProperty.call(payload, "dotThiResults")
        && payload.dotThiResults
        && typeof payload.dotThiResults === "object";
}

function hasPublicRankingsPayload(payload) {
    return Boolean(payload)
        && payload.rankings
        && typeof payload.rankings === "object"
        && payload.honorBoard
        && typeof payload.honorBoard === "object";
}

function getExportService() {
    return require("./thi_export.service");
}

function createRouteTrace(name, meta = {}) {
    const startedAt = Date.now();
    const steps = [];

    return {
        step(stepName, extra = {}) {
            if (!EXAM_FLOW_DEBUG) {
                return;
            }

            steps.push({
                step: stepName,
                ms: Date.now() - startedAt,
                ...extra,
            });
        },
        finish(extra = {}) {
            const totalMs = Date.now() - startedAt;

            if (!EXAM_FLOW_DEBUG || totalMs < EXAM_FLOW_SLOW_MS) {
                return;
            }

            console.log(
                "[exam-route]",
                JSON.stringify({
                    name,
                    totalMs,
                    ...meta,
                    ...extra,
                    steps,
                })
            );
        },
    };
}

function getPublicRankingsCacheKey(dotThiId, cuocThiId, rankingTop, honorTop) {
    return [
        Number(dotThiId || 0),
        Number(cuocThiId || 0),
        Number(rankingTop || 0),
        Number(honorTop || 0),
    ].join(":");
}

function prunePublicRankingsCache(now = Date.now()) {
    for (const [key, entry] of publicRankingsCache.entries()) {
        if ((now - entry.createdAt) > PUBLIC_RANKINGS_CACHE_TTL_MS) {
            publicRankingsCache.delete(key);
        }
    }

    while (publicRankingsCache.size > MAX_PUBLIC_RANKINGS_CACHE_ENTRIES) {
        const oldestKey = publicRankingsCache.keys().next().value;

        if (!oldestKey) {
            return;
        }

        publicRankingsCache.delete(oldestKey);
    }
}

function readPublicRankingsCache(key) {
    prunePublicRankingsCache();
    const entry = publicRankingsCache.get(key);

    if (!entry) {
        return null;
    }

    if ((Date.now() - entry.createdAt) > PUBLIC_RANKINGS_CACHE_TTL_MS) {
        publicRankingsCache.delete(key);
        return null;
    }

    if (!hasPublicRankingsPayload(entry.data)) {
        publicRankingsCache.delete(key);
        return null;
    }

    return entry.data;
}

function writePublicRankingsCache(key, data) {
    prunePublicRankingsCache();
    publicRankingsCache.delete(key);
    publicRankingsCache.set(key, {
        createdAt: Date.now(),
        data,
    });
    prunePublicRankingsCache();
}

function stripDotThiResults(payload) {
    if (!payload || typeof payload !== "object") {
        return payload;
    }

    if (!Object.prototype.hasOwnProperty.call(payload, "dotThiResults")) {
        return payload;
    }

    const { dotThiResults, ...rest } = payload;
    return rest;
}

function logPublicRankingsRefreshError(label, error, meta = {}) {
    const cause = error?.cause || error?.originalError || null;

    console.error(label, JSON.stringify({
        message: error?.message || String(error),
        errorName: error?.name || null,
        errorCode: error?.code || cause?.code || null,
        causeMessage: cause?.message || null,
        detail: cause?.detail || null,
        hint: cause?.hint || null,
        table: cause?.table || null,
        column: cause?.column || null,
        constraint: cause?.constraint || null,
        ...meta,
    }));
}

async function runPublicRankingsTask(cacheKey, loader) {
    const cached = readPublicRankingsCache(cacheKey);

    if (cached) {
        return cached;
    }

    const existing = publicRankingsInFlight.get(cacheKey);

    if (existing) {
        return existing;
    }

    const task = (async () => {
        try {
            const data = await loader();
            writePublicRankingsCache(cacheKey, data);
            return data;
        } finally {
            publicRankingsInFlight.delete(cacheKey);
        }
    })();

    publicRankingsInFlight.set(cacheKey, task);

    return task;
}


/**
 * lấy CSRF token cho nộp bài
 */
router.get(
    "/csrf-token",
    auth,
    (req, res) => {
        try {
            const userId = req.user.id;
            const csrfToken = csrfUtil.generateCsrfToken(userId);

            resUtil.ok(res, { csrfToken });
        } catch (err) {
            resUtil.error(res, err);
        }
    }
)


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
                    normalizedBaiThiId,
                    req.user.id
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
        const trace = createRouteTrace("POST /thi/tra-loi", {
            userId: Number(req.user?.id || 0),
        });

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
            trace.step("validated", {
                baiThiId: normalizedBaiThiId,
                cauHoiId: normalizedCauHoiId,
            });

            const data =
                await query.luuCauTraLoi(
                    normalizedBaiThiId,
                    normalizedCauHoiId,
                    dapAn,
                    req.user.id
                )
            trace.finish({
                baiThiId: normalizedBaiThiId,
                cauHoiId: normalizedCauHoiId,
            });

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
                    req.user.id
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
        const trace = createRouteTrace("POST /thi/nop-bai", {
            userId: Number(req.user?.id || 0),
        });

        try {
            const {
                baiThiId,
                csrfToken,
            } = req.body
            const normalizedBaiThiId =
                validation.ensureRequiredId(baiThiId, "Bài thi")
            
            // Validate CSRF token
            if (!csrfToken) {
                throw new Error("CSRF token không được cung cấp");
            }
            
            csrfUtil.verifyCsrfToken(csrfToken, req.user.id);
            
            trace.step("validated", {
                baiThiId: normalizedBaiThiId,
                csrfTokenValid: true,
            });

            const data =
                await query.nopBai(
                    normalizedBaiThiId,
                    req.user.id
                )
            void publicRankingsSnapshotService
                .schedulePublicRankingsSnapshotRefreshByBaiThiId(
                    normalizedBaiThiId,
                    {
                        onError: (error) => {
                            logPublicRankingsRefreshError(
                                "[public-rankings] Post-submit refresh failed:",
                                error,
                                {
                                    baiThiId: normalizedBaiThiId,
                                    userId: Number(req.user?.id || 0),
                                }
                            );
                        },
                    }
                )
                .catch((error) => {
                    logPublicRankingsRefreshError(
                        "[public-rankings] Post-submit refresh failed:",
                        error,
                        {
                            baiThiId: normalizedBaiThiId,
                            userId: Number(req.user?.id || 0),
                        }
                    );
                });
            trace.finish({
                baiThiId: normalizedBaiThiId,
            });

            resUtil.ok(res, data)

        } catch (err) {

            resUtil.error(res, err)

        }

    }
)

router.post(
    "/auto-submit/:baiThiId",
    auth,
    async (req, res) => {
        const trace = createRouteTrace("POST /thi/auto-submit/:baiThiId", {
            userId: Number(req.user?.id || 0),
        });

        try {
            const baiThiId =
                validation.ensureRequiredId(req.params.baiThiId, "Bài thi");
            const csrfToken = req.body?.csrfToken;
            const payload =
                validation.normalizeAutoSubmitPayload(req.body);

            if (!csrfToken) {
                throw new Error("CSRF token không được cung cấp");
            }

            csrfUtil.verifyCsrfToken(csrfToken, req.user.id);
            trace.step("validated", {
                baiThiId,
                answerCount: payload.answers.length,
                csrfTokenValid: true,
            });

            const data = await query.autoSubmitBaiThi(
                baiThiId,
                payload,
                req.user.id
            );
            void publicRankingsSnapshotService
                .schedulePublicRankingsSnapshotRefreshByBaiThiId(
                    baiThiId,
                    {
                        onError: (error) => {
                            logPublicRankingsRefreshError(
                                "[public-rankings] Post-auto-submit refresh failed:",
                                error,
                                {
                                    baiThiId,
                                    userId: Number(req.user?.id || 0),
                                    answerCount: payload.answers.length,
                                }
                            );
                        },
                    }
                )
                .catch((error) => {
                    logPublicRankingsRefreshError(
                        "[public-rankings] Post-auto-submit refresh failed:",
                        error,
                        {
                            baiThiId,
                            userId: Number(req.user?.id || 0),
                            answerCount: payload.answers.length,
                        }
                    );
                });
            trace.finish({
                baiThiId,
            });

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
        const trace = createRouteTrace("POST /thi/start", {
            userId: Number(req.user?.id || 0),
        });

        try {
            const {dotThiId} =
                req.body
            const normalizedDotThiId =
                validation.ensureRequiredId(dotThiId, "Đợt thi")
            trace.step("validated", {
                dotThiId: normalizedDotThiId,
            });

            const thiSinhId =
                req.user.id

            await validation.ensureDotThiQuestionConfigValid(normalizedDotThiId)
            trace.step("ensureDotThiQuestionConfigValid");

            const result =
                await query.startThi(
                    normalizedDotThiId,
                    thiSinhId,
                )
            trace.step("query.startThi");

            const tuLuanInfo =
                await validation.layTrangThaiTuLuanTheoDotThi(normalizedDotThiId)
            trace.step("layTrangThaiTuLuanTheoDotThi");

            if (!tuLuanInfo.coTuLuan) {
                result.tuLuan = []
            }
            trace.finish({
                dotThiId: normalizedDotThiId,
                baiThiId: Number(result?.baiThiId || result?.bai_thi_id || 0),
                cauHoiCount: Array.isArray(result?.cauHoi) ? result.cauHoi.length : 0,
                tuLuanCount: Array.isArray(result?.tuLuan) ? result.tuLuan.length : 0,
            });

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
                    baiThiId,
                    req.user.id
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

        const data = await query.nopDuDoanKetQuan(baiThiId, soDuDoan, req.user.id);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/public-rankings/dot-thi-results", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.query?.dotThiId, "Đợt thi");
        const cuocThiId = validation.ensureRequiredId(req.query?.cuocThiId, "Cuộc thi");
        const data = await publicRankingsSnapshotService.getPublicRankingDotThiResults(
            dotThiId,
            cuocThiId
        );

        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/export", auth, role(["admin"]), async (req, res) => {
    try {
        const scope = validation.normalizeKetQuaTracNghiemExportScope(req.query);
        const result = await getExportService().exportKetQuaTracNghiem(scope);

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

router.get("/public-rankings", async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.query?.dotThiId, "Đợt thi");
        const cuocThiId = validation.ensureRequiredId(req.query?.cuocThiId, "Cuộc thi");
        const rankingTop = publicRankingsSnapshotService.PUBLIC_RANKING_TOP;
        const honorTop = publicRankingsSnapshotService.PUBLIC_HONOR_TOP;
        const cacheKey = getPublicRankingsCacheKey(dotThiId, cuocThiId, rankingTop, honorTop);
        const data = await runPublicRankingsTask(cacheKey, async () => {
            const snapshot = await publicRankingsSnapshotService.getPublicRankingsSnapshot(
                dotThiId,
                cuocThiId
            );

            if (!snapshot) {
                throw {
                    status: 503,
                    message: "Bảng xếp hạng công khai đang được cập nhật. Vui lòng thử lại sau ít phút.",
                };
            }

            return stripDotThiResults(snapshot);
        });

        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})

router.get("/ket-qua-trac-nghiem/dot-thi/:dotThiId/:top", auth, role(["admin"]), async (req, res) => {
    try {
        const dotThiId = validation.ensureRequiredId(req.params.dotThiId, "Đợt thi");
        const top = validation.normalizeTopParam(req.params.top);
        const data = await query.xepHangTracNghiemTheoDotThi(dotThiId, top);
        resUtil.ok(res, data)
    } catch (err) {
        resUtil.error(res, err)
    }
})


router.get("/ket-qua-trac-nghiem/cuoc-thi/:cuocThiId/:top", auth, role(["admin"]), async (req, res) => {
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

router.get(
    "/thong-ke-tham-gia-theo-don-vi",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const dotThiId =
                Number.isInteger(Number(req.query?.dotThiId)) && Number(req.query.dotThiId) > 0
                    ? Number(req.query.dotThiId)
                    : null;
            const cuocThiId =
                Number.isInteger(Number(req.query?.cuocThiId)) && Number(req.query.cuocThiId) > 0
                    ? Number(req.query.cuocThiId)
                    : null;
            const data = await query.thongKeThamGiaTheoDonVi({
                cuocThiId,
                dotThiId,
            });
            resUtil.ok(res, data);
        } catch (err) {
            resUtil.error(res, err);
        }
    }
)

router.get(
    "/thong-ke-tham-gia-theo-don-vi/export",
    auth,
    role(["admin"]),
    async (req, res) => {
        try {
            const dotThiId =
                Number.isInteger(Number(req.query?.dotThiId)) && Number(req.query.dotThiId) > 0
                    ? Number(req.query.dotThiId)
                    : null;
            const cuocThiId =
                Number.isInteger(Number(req.query?.cuocThiId)) && Number(req.query.cuocThiId) > 0
                    ? Number(req.query.cuocThiId)
                    : null;
            const result = await getExportService().exportThongKeThamGiaTheoDonVi({
                cuocThiId,
                dotThiId,
            });

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
    }
)

module.exports = router
