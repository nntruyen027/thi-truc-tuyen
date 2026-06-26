const { and, asc, eq, inArray, sql } = require("drizzle-orm");
const db = require("../../db/client");
const pool = require("../../core/config/db");
const {
    baiThi,
    baiThiChiTiet,
    baiThiChiTietTuLuan,
    deThi,
    deThiCauHoi,
    donVi,
    dotThi,
    publicRankingSnapshot,
    tracNghiemDotThi,
    tracNghiem,
    tuLuanDotThi,
    users,
} = require("../../db/schema");

const EXAM_FLOW_DEBUG = process.env.EXAM_FLOW_DEBUG === "1";
const EXAM_FLOW_SLOW_MS = Number(process.env.EXAM_FLOW_SLOW_MS || 300);
const RANKING_CACHE_TTL_MS = Number(process.env.RANKING_CACHE_TTL_MS || 60000);
const MAX_RANKING_CACHE_ENTRIES = Number(process.env.MAX_RANKING_CACHE_ENTRIES || 50);
const MIN_EXAM_SUBMIT_SECONDS = Number(process.env.MIN_EXAM_SUBMIT_SECONDS || 25);

const LOAI_CAU_HOI = {
    CHON_MOT: "chon_mot",
    CHON_NHIEU: "chon_nhieu",
    DIEN_TU: "dien_tu",
};

let baiThiChiTietColumnsPromise = null;
const rankingCache = new Map();
const rankingInFlight = new Map();

function createExamTrace(name, meta = {}) {
    const startedAt = process.hrtime.bigint();
    const steps = [];

    function elapsedMs() {
        return Number(process.hrtime.bigint() - startedAt) / 1e6;
    }

    return {
        step(stepName, extra = {}) {
            if (!EXAM_FLOW_DEBUG) {
                return;
            }

            steps.push({
                step: stepName,
                ms: Math.round(elapsedMs()),
                ...extra,
            });
        },
        finish(extra = {}) {
            const totalMs = Math.round(elapsedMs());

            if (!EXAM_FLOW_DEBUG || totalMs < EXAM_FLOW_SLOW_MS) {
                return;
            }

            console.log(
                "[exam-flow]",
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

function getRankingCacheKey(kind, scopeId, top) {
    return [kind, Number(scopeId || 0), Number(top || 0)].join(":");
}

function pruneRankingCache(now = Date.now()) {
    for (const [key, entry] of rankingCache.entries()) {
        if ((now - entry.createdAt) > RANKING_CACHE_TTL_MS) {
            rankingCache.delete(key);
        }
    }

    while (rankingCache.size > MAX_RANKING_CACHE_ENTRIES) {
        const oldestKey = rankingCache.keys().next().value;

        if (!oldestKey) {
            return;
        }

        rankingCache.delete(oldestKey);
    }
}

function readRankingCache(key) {
    pruneRankingCache();
    const entry = rankingCache.get(key);

    if (!entry) {
        return null;
    }

    if ((Date.now() - entry.createdAt) > RANKING_CACHE_TTL_MS) {
        rankingCache.delete(key);
        return null;
    }

    return entry.data;
}

function writeRankingCache(key, data) {
    pruneRankingCache();
    rankingCache.delete(key);
    rankingCache.set(key, {
        createdAt: Date.now(),
        data,
    });
    pruneRankingCache();
}

async function runRankingTask(cacheKey, loader) {
    const cached = readRankingCache(cacheKey);

    if (cached) {
        return cached;
    }

    const existing = rankingInFlight.get(cacheKey);

    if (existing) {
        return existing;
    }

    const task = (async () => {
        try {
            const data = await loader();
            writeRankingCache(cacheKey, data);
            return data;
        } finally {
            rankingInFlight.delete(cacheKey);
        }
    })();

    rankingInFlight.set(cacheKey, task);

    return task;
}

async function loadRankingDetailStatsByExamIds(baiThiIds = []) {
    const normalizedIds = Array.from(
        new Set(
            baiThiIds
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value > 0)
        )
    );

    if (!normalizedIds.length) {
        return [];
    }

    const chunkSize = 500;
    const results = [];

    for (let index = 0; index < normalizedIds.length; index += chunkSize) {
        const currentChunk = normalizedIds.slice(index, index + chunkSize);
        const rows = await db
            .select({
                baiThiId: baiThiChiTiet.baiThiId,
                tong: sql`count(*)::int`,
                dung: sql`coalesce(sum(case when ${baiThiChiTiet.dung} then 1 else 0 end), 0)::int`,
            })
            .from(baiThiChiTiet)
            .where(inArray(baiThiChiTiet.baiThiId, currentChunk))
            .groupBy(baiThiChiTiet.baiThiId);

        results.push(...rows);
    }

    return results;
}

function withLegacyKeys(data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return data;
    }

    return {
        ...data,
        ...(data.deThiId !== undefined ? {de_thi_id: data.deThiId} : {}),
        ...(data.baiThiId !== undefined ? {bai_thi_id: data.baiThiId} : {}),
        ...(data.timeLeft !== undefined ? {time_left: data.timeLeft} : {}),
        ...(data.cauHoi !== undefined ? {cau_hoi: data.cauHoi} : {}),
        ...(data.tuLuan !== undefined ? {tu_luan: data.tuLuan} : {}),
        ...(data.thiSinhId !== undefined ? {thi_sinh_id: data.thiSinhId} : {}),
        ...(data.lanThi !== undefined ? {lan_thi: data.lanThi} : {}),
        ...(data.thoiGianThi !== undefined ? {thoi_gian_thi: data.thoiGianThi} : {}),
        ...(data.thoiGianBatDau !== undefined ? {thoi_gian_bat_dau: data.thoiGianBatDau} : {}),
        ...(data.thoiGianNop !== undefined ? {thoi_gian_nop: data.thoiGianNop} : {}),
        ...(data.trangThai !== undefined ? {trang_thai: data.trangThai} : {}),
        ...(data.tongThoiGianDaLam !== undefined ? {tong_thoi_gian_da_lam: data.tongThoiGianDaLam} : {}),
        ...(data.lanBatDau !== undefined ? {lan_bat_dau: data.lanBatDau} : {}),
        ...(data.dangLam !== undefined ? {dang_lam: data.dangLam} : {}),
        ...(data.soDuDoan !== undefined ? {so_du_doan: data.soDuDoan} : {}),
        ...(data.dapAnChon !== undefined ? {dap_an_chon: data.dapAnChon} : {}),
        ...(data.cauHoiId !== undefined ? {cau_hoi_id: data.cauHoiId} : {}),
        ...(data.dotThiId !== undefined ? {dot_thi_id: data.dotThiId} : {}),
        ...(data.cauHoiText !== undefined ? {cau_hoi: data.cauHoiText} : {}),
        ...(data.goiY !== undefined ? {goi_y: data.goiY} : {}),
        ...(data.luaChon !== undefined ? {lua_chon: data.luaChon} : {}),
        ...(data.loaiCauHoi !== undefined ? {loai_cau_hoi: data.loaiCauHoi} : {}),
        ...(data.dapAnChonNhieu !== undefined ? {dap_an_chon_nhieu: data.dapAnChonNhieu} : {}),
        ...(data.dapAnTuDo !== undefined ? {dap_an_tu_do: data.dapAnTuDo} : {}),
    };
}

function createSeededRandom(seed) {
    let state = Number(seed) || 1;

    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

function shuffleArray(items, seed) {
    const result = [...items];
    const random = createSeededRandom(seed);

    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(random() * (index + 1));
        const current = result[index];
        result[index] = result[swapIndex];
        result[swapIndex] = current;
    }

    return result;
}

function getLoaiCauHoiOrder(value) {
    const normalized = normalizeLoaiCauHoi(value);

    if (normalized === LOAI_CAU_HOI.CHON_MOT) {
        return 0;
    }

    if (normalized === LOAI_CAU_HOI.CHON_NHIEU) {
        return 1;
    }

    return 2;
}

function taoLuaChonDaTron(row, deThiId, shouldShuffleAnswers) {
    if (row.loaiCauHoi === LOAI_CAU_HOI.DIEN_TU) {
        return [];
    }

    const rawOptions = [
        {value: 1, text: row.cauA},
        {value: 2, text: row.cauB},
        {value: 3, text: row.cauC},
        {value: 4, text: row.cauD},
    ].filter((item) => item.text != null);

    const shuffledOptions =
        shouldShuffleAnswers
            ? shuffleArray(rawOptions, (Number(deThiId) * 10007) + (Number(row.id) * 97))
            : rawOptions;

    return shuffledOptions.map((item, index) => ({
        ...item,
        label: ["A", "B", "C", "D"][index] || String(index + 1),
    }));
}

function normalizeLoaiCauHoi(value) {
    const normalized = String(value || LOAI_CAU_HOI.CHON_MOT).trim().toLowerCase();
    return Object.values(LOAI_CAU_HOI).includes(normalized)
        ? normalized
        : LOAI_CAU_HOI.CHON_MOT;
}

function normalizeAnswerList(value) {
    const items =
        Array.isArray(value)
            ? value
            : String(value || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

    return [...new Set(
        items
            .map((item) => Number(item))
            .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)
    )].sort((left, right) => left - right);
}

function serializeAnswerList(value) {
    const normalized = normalizeAnswerList(value);
    return normalized.length ? normalized.join(",") : null;
}

function normalizeTextAnswer(value) {
    return String(value || "").trim().toLocaleLowerCase("vi");
}

async function getBaiThiChiTietColumnSupport() {
    if (!baiThiChiTietColumnsPromise) {
        baiThiChiTietColumnsPromise = pool.query(`
            select column_name
            from information_schema.columns
            where table_schema = 'thi'
              and table_name = 'bai_thi_chi_tiet'
              and column_name in ('dap_an_chon_nhieu', 'dap_an_tu_do')
        `).then((result) => {
            const columns = new Set(result.rows.map((row) => row.column_name));

            return {
                hasDapAnChonNhieu: columns.has("dap_an_chon_nhieu"),
                hasDapAnTuDo: columns.has("dap_an_tu_do"),
            };
        }).catch(() => ({
            hasDapAnChonNhieu: false,
            hasDapAnTuDo: false,
        }));
    }

    return baiThiChiTietColumnsPromise;
}

async function upsertBaiThiChiTietAnswer(values, columnSupport) {
    const columns = ["bai_thi_id", "cau_hoi_id", "dap_an_chon"];
    const params = [
        Number(values.baiThiId),
        Number(values.cauHoiId),
        values.dapAnChon ?? null,
    ];

    if (columnSupport.hasDapAnChonNhieu) {
        columns.push("dap_an_chon_nhieu");
        params.push(values.dapAnChonNhieu ?? null);
    }

    if (columnSupport.hasDapAnTuDo) {
        columns.push("dap_an_tu_do");
        params.push(values.dapAnTuDo ?? null);
    }

    const placeholders = columns.map((_, index) => `$${index + 1}`);
    const updateColumns = columns.filter((column) => !["bai_thi_id", "cau_hoi_id"].includes(column));
    const updateClause = updateColumns
        .map((column) => `"${column}" = excluded."${column}"`)
        .join(", ");

    await pool.query(
        `
            insert into "thi"."bai_thi_chi_tiet" (${columns.map((column) => `"${column}"`).join(", ")})
            values (${placeholders.join(", ")})
            on conflict ("bai_thi_id", "cau_hoi_id")
            do update set ${updateClause}
        `,
        params
    );
}

async function batchUpdateBaiThiChiTietScores(tx, items) {
    if (!items.length) {
        return;
    }

    const dungCaseSql = sql.join(
        items.map((item) => sql`when ${item.id} then ${item.dung}`),
        sql` `
    );
    const diemCaseSql = sql.join(
        items.map((item) => sql`when ${item.id} then ${item.diem}`),
        sql` `
    );
    const idListSql = sql.join(
        items.map((item) => sql`${item.id}`),
        sql`, `
    );

    await tx.execute(sql`
        update "thi"."bai_thi_chi_tiet" as target
        set
            "dung" = case target."id" ${dungCaseSql} else target."dung" end,
            "diem" = case target."id" ${diemCaseSql} else target."diem" end
        where target."id" in (${idListSql})
    `);
}

async function pauseThiWithExecutor(executor, baiThiIdValue) {
    const [row] = await executor
        .select({
            lanBatDau: baiThi.lanBatDau,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
        })
        .from(baiThi)
        .where(eq(baiThi.id, Number(baiThiIdValue)))
        .limit(1);

    if (!row?.lanBatDau) {
        return false;
    }

    const diff = Math.floor((Date.now() - new Date(row.lanBatDau).getTime()) / 1000);

    await executor
        .update(baiThi)
        .set({
            tongThoiGianDaLam: Number(row.tongThoiGianDaLam || 0) + diff,
            dangLam: false,
            lanBatDau: null,
        })
        .where(eq(baiThi.id, Number(baiThiIdValue)));

    return true;
}

function normalizeSubmitTimeFloor(value) {
    const normalized = Number(value);

    if (!Number.isFinite(normalized) || normalized < 0) {
        return 0;
    }

    if (!Number.isFinite(MIN_EXAM_SUBMIT_SECONDS) || MIN_EXAM_SUBMIT_SECONDS <= 0) {
        return normalized;
    }

    return Math.max(normalized, MIN_EXAM_SUBMIT_SECONDS);
}

function randomIntInclusive(min, max) {
    const normalizedMin = Math.ceil(Number(min));
    const normalizedMax = Math.floor(Number(max));

    return Math.floor(Math.random() * (normalizedMax - normalizedMin + 1)) + normalizedMin;
}

function buildScore25TimeAdjustment(tongDiemValue, tongThoiGianDaLamValue) {
    const tongDiem = Number(tongDiemValue || 0);
    const tongThoiGianDaLam = Number(tongThoiGianDaLamValue || 0);

    if (tongDiem !== 25 || tongThoiGianDaLam < 25 || tongThoiGianDaLam >= 50) {
        return {
            applied: false,
            tongThoiGianDaLam,
            giayCong: 0,
        };
    }

    const giayCong = (50 - tongThoiGianDaLam) + randomIntInclusive(20, 50);

    return {
        applied: true,
        tongThoiGianDaLam: tongThoiGianDaLam + giayCong,
        giayCong,
    };
}

async function finalizeBaiThiSubmission(tx, baiThiIdValue, columnSupport, trace = null) {
    const chiTietRows = await tx
        .select({
            chiTietId: baiThiChiTiet.id,
            cauHoiId: tracNghiem.id,
            loaiCauHoi: tracNghiem.loaiCauHoi,
            dapAnChon: baiThiChiTiet.dapAnChon,
            dapAnChonNhieu: columnSupport.hasDapAnChonNhieu
                ? baiThiChiTiet.dapAnChonNhieu
                : sql`null`,
            dapAnTuDo: columnSupport.hasDapAnTuDo
                ? baiThiChiTiet.dapAnTuDo
                : sql`null`,
            dapAn: tracNghiem.dapAn,
            dapAnNhieu: tracNghiem.dapAnNhieu,
            dapAnText: tracNghiem.dapAnText,
            diemCauHoi: tracNghiem.diem,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(deThiCauHoi, eq(deThiCauHoi.deThiId, deThi.id))
        .innerJoin(tracNghiem, eq(tracNghiem.id, deThiCauHoi.cauHoiId))
        .leftJoin(
            baiThiChiTiet,
            and(
                eq(baiThiChiTiet.baiThiId, baiThi.id),
                eq(baiThiChiTiet.cauHoiId, tracNghiem.id)
            )
        )
        .where(eq(baiThi.id, Number(baiThiIdValue)));

    trace?.step("loadAnswers", {
        answerCount: chiTietRows.length,
    });

    let tongDiem = 0;
    const scoreUpdates = chiTietRows.map((item) => {
        const loaiCauHoi = normalizeLoaiCauHoi(item.loaiCauHoi);
        let dung = false;

        if (loaiCauHoi === LOAI_CAU_HOI.CHON_MOT) {
            dung = item.dapAnChon === item.dapAn;
        }

        if (loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU) {
            dung =
                serializeAnswerList(item.dapAnChonNhieu) ===
                serializeAnswerList(item.dapAnNhieu);
        }

        if (loaiCauHoi === LOAI_CAU_HOI.DIEN_TU) {
            dung =
                normalizeTextAnswer(item.dapAnTuDo) !== "" &&
                normalizeTextAnswer(item.dapAnTuDo) === normalizeTextAnswer(item.dapAnText);
        }

        const diem = dung ? Number(item.diemCauHoi || 0) : 0;
        tongDiem += diem;

        return {
            id: Number(item.chiTietId),
            dung,
            diem,
        };
    }).filter((item) => Number.isInteger(item.id) && item.id > 0);

    await batchUpdateBaiThiChiTietScores(tx, scoreUpdates);
    trace?.step("updateAnswerScores");

    const [currentBaiThi] = await tx
        .select({
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
        })
        .from(baiThi)
        .where(eq(baiThi.id, Number(baiThiIdValue)))
        .limit(1);
    const normalizedAnswerCount = scoreUpdates.length;
    const normalizedCurrentTime = Number(currentBaiThi?.tongThoiGianDaLam || 0);
    const effectiveBaseTime =
        normalizedAnswerCount > 0
            ? normalizeSubmitTimeFloor(normalizedCurrentTime)
            : normalizedCurrentTime;
    const timeAdjustment = buildScore25TimeAdjustment(
        tongDiem,
        effectiveBaseTime
    );
    const finalTongThoiGianDaLam =
        timeAdjustment.applied
            ? timeAdjustment.tongThoiGianDaLam
            : effectiveBaseTime;

    await tx
        .update(baiThi)
        .set({
            trangThai: 1,
            thoiGianNop: new Date(),
            diem: tongDiem,
            tongThoiGianDaLam: finalTongThoiGianDaLam,
        })
        .where(eq(baiThi.id, Number(baiThiIdValue)));
    trace?.step("finalizeBaiThi", {
        tongDiem,
        flooredSubmitTime: effectiveBaseTime !== normalizedCurrentTime,
        adjustedScore25Time: timeAdjustment.applied,
        giayCongScore25: timeAdjustment.giayCong,
    });

    return {
        tongDiem,
        answerCount: chiTietRows.length,
        adjustedTongThoiGianDaLam: finalTongThoiGianDaLam,
        giayCongScore25: timeAdjustment.giayCong,
    };
}

async function loadAllowedQuestionsForBaiThi(baiThiIdValue) {
    const tracRows = await db
        .select({
            cauHoiId: deThiCauHoi.cauHoiId,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(deThiCauHoi, eq(deThiCauHoi.deThiId, deThi.id))
        .where(eq(baiThi.id, Number(baiThiIdValue)));

    const [dotThiRow] = await db
        .select({
            dotThiId: deThi.dotThiId,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .where(eq(baiThi.id, Number(baiThiIdValue)))
        .limit(1);

    const tuLuanRows =
        dotThiRow?.dotThiId
            ? await db
                .select({
                    cauHoiId: tuLuanDotThi.id,
                })
                .from(tuLuanDotThi)
                .where(eq(tuLuanDotThi.dotThiId, Number(dotThiRow.dotThiId)))
            : [];

    return {
        tracNghiemIds: new Set(
            tracRows
                .map((item) => Number(item.cauHoiId))
                .filter((item) => Number.isInteger(item) && item > 0)
        ),
        tuLuanIds: new Set(
            tuLuanRows
                .map((item) => Number(item.cauHoiId))
                .filter((item) => Number.isInteger(item) && item > 0)
        ),
    };
}

async function persistAutoSubmitAnswers(baiThiIdValue, answers = []) {
    if (!Array.isArray(answers) || !answers.length) {
        return 0;
    }

    const normalizedBaiThiId = Number(baiThiIdValue);
    const columnSupport = await getBaiThiChiTietColumnSupport();
    const allowedQuestions = await loadAllowedQuestionsForBaiThi(normalizedBaiThiId);
    const tracAnswers = answers.filter((item) => Number(item?.loai) !== 2);
    const tuLuanAnswers = answers.filter((item) => Number(item?.loai) === 2);
    let persistedCount = 0;

    if (tracAnswers.length) {
        const questionIds = [...new Set(
            tracAnswers
                .map((item) => Number(item?.questionId))
                .filter((item) => Number.isInteger(item) && item > 0)
        )];

        if (questionIds.length) {
            const questionRows = await db
                .select({
                    id: tracNghiem.id,
                    loaiCauHoi: tracNghiem.loaiCauHoi,
                })
                .from(tracNghiem)
                .where(inArray(tracNghiem.id, questionIds));

            const questionMap = new Map(
                questionRows.map((item) => [
                    Number(item.id),
                    normalizeLoaiCauHoi(item.loaiCauHoi),
                ])
            );

            for (const answer of tracAnswers) {
                const questionId = Number(answer.questionId);
                const loaiCauHoi = questionMap.get(questionId);

                if (!loaiCauHoi || !allowedQuestions.tracNghiemIds.has(questionId)) {
                    continue;
                }

                const values = {
                    baiThiId: normalizedBaiThiId,
                    cauHoiId: questionId,
                    dapAnChon: null,
                };

                if (columnSupport.hasDapAnChonNhieu) {
                    values.dapAnChonNhieu = null;
                }

                if (columnSupport.hasDapAnTuDo) {
                    values.dapAnTuDo = null;
                }

                if (loaiCauHoi === LOAI_CAU_HOI.CHON_MOT) {
                    values.dapAnChon = answer.dapAnChon ?? null;
                }

                if (loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU && columnSupport.hasDapAnChonNhieu) {
                    values.dapAnChonNhieu = serializeAnswerList(answer.dapAnChonNhieu);
                }

                if (loaiCauHoi === LOAI_CAU_HOI.DIEN_TU && columnSupport.hasDapAnTuDo) {
                    values.dapAnTuDo = String(answer.dapAnTuDo || "").trim() || null;
                }

                await upsertBaiThiChiTietAnswer(values, columnSupport);
                persistedCount += 1;
            }
        }
    }

    if (tuLuanAnswers.length) {
        const questionIds = [...new Set(
            tuLuanAnswers
                .map((item) => Number(item?.questionId))
                .filter((item) => Number.isInteger(item) && item > 0)
        )];

        if (questionIds.length) {
            const questionRows = await db
                .select({
                    id: tuLuanDotThi.id,
                })
                .from(tuLuanDotThi)
                .where(inArray(tuLuanDotThi.id, questionIds));
            const validQuestionIds = new Set(
                questionRows.map((item) => Number(item.id))
            );

            for (const answer of tuLuanAnswers) {
                const questionId = Number(answer.questionId);

                if (!validQuestionIds.has(questionId) || !allowedQuestions.tuLuanIds.has(questionId)) {
                    continue;
                }

                await db
                    .insert(baiThiChiTietTuLuan)
                    .values({
                        baiThiId: normalizedBaiThiId,
                        cauHoiId: questionId,
                        dapAn: String(answer.dapAn || ""),
                    })
                    .onConflictDoUpdate({
                        target: [baiThiChiTietTuLuan.baiThiId, baiThiChiTietTuLuan.cauHoiId],
                        set: {
                            dapAn: String(answer.dapAn || ""),
                        },
                    });
                persistedCount += 1;
            }
        }
    }

    return persistedCount;
}

function mapBaiThi(row) {
    if (!row) {
        return {};
    }

    return withLegacyKeys({
        id: row.id,
        deThiId: row.deThiId,
        thiSinhId: row.thiSinhId,
        lanThi: row.lanThi,
        thoiGianBatDau: row.thoiGianBatDau,
        thoiGianNop: row.thoiGianNop,
        trangThai: row.trangThai,
        diem: row.diem,
        tongThoiGianDaLam: row.tongThoiGianDaLam,
        lanBatDau: row.lanBatDau,
        dangLam: row.dangLam,
        soDuDoan: row.soDuDoan,
    });
}

function mapDotThiInfo(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        cuocThiId: row.cuocThiId,
        ten: row.ten,
        moTa: row.moTa,
        soLanThamGiaToiDa: row.soLanThamGiaToiDa,
        thoiGianThi: row.thoiGianThi,
        tyLeDanhGiaDat: row.tyLeDanhGiaDat,
        thoiGianBatDau: row.thoiGianBatDau,
        thoiGianKetThuc: row.thoiGianKetThuc,
        coTronCauHoi: row.coTronCauHoi,
        choPhepLuuBai: row.choPhepLuuBai,
        duDoan: row.duDoan,
        trangThai: row.trangThai,
        createdAt: row.createdAt,
    };
}

function mapThiSinh(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        hoTen: row.hoTen,
        diaChiDong1: row.diaChiDong1,
        xaPhuong: row.xaPhuong,
        tinhThanh: row.tinhThanh,
        donViId: row.donViId,
        donViTen: row.donViTen,
        don_vi_ten: row.donViTen,
        don_vi: row.donViTen
            ? {
                ten: row.donViTen,
            }
            : null,
        avatar: null,
        createdAt: row.createdAt,
        ho_ten: row.hoTen,
        dia_chi_dong_1: row.diaChiDong1,
        xa_phuong: row.xaPhuong,
        tinh_thanh: row.tinhThanh,
        don_vi_id: row.donViId,
        created_at: row.createdAt,
    };
}

function mapTracNghiemQuestion(row) {
    const luaChon = taoLuaChonDaTron(row, row.deThiId, !!row.coTronDapAn);
    const loaiCauHoi = normalizeLoaiCauHoi(row.loaiCauHoi);

    return withLegacyKeys({
        id: row.id,
        cauHoiText: row.cauHoi,
        loaiCauHoi,
        caua: luaChon[0]?.text ?? null,
        caub: luaChon[1]?.text ?? null,
        cauc: luaChon[2]?.text ?? null,
        caud: luaChon[3]?.text ?? null,
        diem: row.diem,
        thuTu: row.thuTu,
        dapAnChon: row.dapAnChon,
        dapAnChonNhieu: normalizeAnswerList(row.dapAnChonNhieu),
        dapAnTuDo: row.dapAnTuDo ?? "",
        luaChon,
    });
}

function mapTuLuanQuestion(row) {
    return withLegacyKeys({
        id: row.id,
        cauHoiText: row.cauHoi,
        dotThiId: row.dotThiId,
        goiY: row.goiY,
        dapAn: row.dapAn,
        diem: row.diem,
    });
}

async function ensureOwnedDeThiExists(tx, deThiIdValue, thiSinhIdValue, message = "Đề thi không thuộc tài khoản hiện tại.") {
    const [row] = await tx
        .select({
            id: deThi.id,
        })
        .from(deThi)
        .where(and(
            eq(deThi.id, Number(deThiIdValue)),
            eq(deThi.thiSinhId, Number(thiSinhIdValue))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }

    return row;
}

async function ensureOwnedBaiThiExists(tx, baiThiIdValue, thiSinhIdValue, message = "Bài thi không thuộc tài khoản hiện tại.") {
    const [row] = await tx
        .select({
            id: baiThi.id,
            deThiId: baiThi.deThiId,
        })
        .from(baiThi)
        .where(and(
            eq(baiThi.id, Number(baiThiIdValue)),
            eq(baiThi.thiSinhId, Number(thiSinhIdValue))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }

    return row;
}

async function ensureTracNghiemQuestionBelongsToBaiThi(tx, baiThiIdValue, cauHoiIdValue, message = "Câu hỏi không thuộc bài thi hiện tại.") {
    const [row] = await tx
        .select({
            cauHoiId: deThiCauHoi.cauHoiId,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(deThiCauHoi, eq(deThiCauHoi.deThiId, deThi.id))
        .where(and(
            eq(baiThi.id, Number(baiThiIdValue)),
            eq(deThiCauHoi.cauHoiId, Number(cauHoiIdValue))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }

    return row;
}

async function ensureTuLuanQuestionBelongsToBaiThi(tx, baiThiIdValue, cauHoiIdValue, message = "Câu hỏi tự luận không thuộc bài thi hiện tại.") {
    const [row] = await tx
        .select({
            id: tuLuanDotThi.id,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(tuLuanDotThi, eq(tuLuanDotThi.dotThiId, deThi.dotThiId))
        .where(and(
            eq(baiThi.id, Number(baiThiIdValue)),
            eq(tuLuanDotThi.id, Number(cauHoiIdValue))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }

    return row;
}

async function ensureDeThiMatchesBaiThi(tx, deThiIdValue, baiThiIdValue, message = "Đề thi và bài thi không khớp.") {
    const [row] = await tx
        .select({
            id: baiThi.id,
        })
        .from(baiThi)
        .where(and(
            eq(baiThi.id, Number(baiThiIdValue)),
            eq(baiThi.deThiId, Number(deThiIdValue))
        ))
        .limit(1);

    if (!row) {
        throw message;
    }

    return row;
}

function compareNullableDesc(left, right) {
    if (left == null && right == null) {
        return 0;
    }

    if (left == null) {
        return 1;
    }

    if (right == null) {
        return -1;
    }

    return Number(right) - Number(left);
}

function compareNullableAsc(left, right) {
    if (left == null && right == null) {
        return 0;
    }

    if (left == null) {
        return 1;
    }

    if (right == null) {
        return -1;
    }

    return Number(left) - Number(right);
}

function compareRankingRow(left, right) {
    const byDiem = compareNullableDesc(left.diem, right.diem);

    if (byDiem !== 0) {
        return byDiem;
    }

    const bySaiSo = compareNullableAsc(left.saiSo, right.saiSo);

    if (bySaiSo !== 0) {
        return bySaiSo;
    }

    const byThoiGian = compareNullableAsc(left.thoiGian, right.thoiGian);

    if (byThoiGian !== 0) {
        return byThoiGian;
    }

    return Number(left.baiThiId) - Number(right.baiThiId);
}

function compareScoreTimeRow(left, right) {
    const byDiem = compareNullableDesc(left.diem, right.diem);

    if (byDiem !== 0) {
        return byDiem;
    }

    const byThoiGian = compareNullableAsc(left.thoiGian, right.thoiGian);

    if (byThoiGian !== 0) {
        return byThoiGian;
    }

    return Number(left.baiThiId) - Number(right.baiThiId);
}

function comparePredictionWithinBestScoreRow(left, right) {
    const byDiem = compareNullableDesc(left.diem, right.diem);

    if (byDiem !== 0) {
        return byDiem;
    }

    const bySaiSo = compareNullableAsc(left.saiSo, right.saiSo);

    if (bySaiSo !== 0) {
        return bySaiSo;
    }

    const byThoiGian = compareNullableAsc(left.thoiGian, right.thoiGian);

    if (byThoiGian !== 0) {
        return byThoiGian;
    }

    return Number(left.baiThiId) - Number(right.baiThiId);
}

function shouldKeepLegacyRankingForDotThi(dotThiId) {
    return Number(dotThiId) === 1;
}

function mapRankingRow(row) {
    return {
        baiThiId: row.baiThiId,
        bai_thi_id: row.baiThiId,
        dotThiId: row.dotThiId,
        dot_thi_id: row.dotThiId,
        thiSinh: row.thiSinh,
        thi_sinh: row.thiSinh,
        diem: row.diem,
        thoiGian: row.thoiGian,
        thoi_gian: row.thoiGian,
        thoiGianThi: row.thoiGianThi,
        thoi_gian_thi: row.thoiGianThi,
        soDuDoan: row.soDuDoan,
        so_du_doan: row.soDuDoan,
        soNguoi100: row.soNguoi100,
        so_nguoi_100: row.soNguoi100,
        saiSo: row.saiSo,
        sai_so: row.saiSo,
        soLuotThi: row.soLuotThi,
        so_luot_thi: row.soLuotThi,
    };
}

function mapPublicRankingSnapshot(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        dotThiId: Number(row.dotThiId || 0),
        cuocThiId: Number(row.cuocThiId || 0),
        rankingTop: Number(row.rankingTop || 20),
        honorTop: Number(row.honorTop || 200),
        payload: row.payload || null,
        createdAt: row.createdAt || null,
    };
}

function compareDonViRankingRow(left, right) {
    const bySoLuong = Number(right.soLuongThiSinh || 0) - Number(left.soLuongThiSinh || 0);

    if (bySoLuong !== 0) {
        return bySoLuong;
    }

    return String(left.tenDonVi || "").localeCompare(String(right.tenDonVi || ""), "vi", {
        sensitivity: "base",
    });
}

function mapDonViRankingRow(row) {
    return {
        donViId: row.donViId,
        don_vi_id: row.donViId,
        tenDonVi: row.tenDonVi,
        ten_don_vi: row.tenDonVi,
        soLuongThiSinh: row.soLuongThiSinh,
        so_luong_thi_sinh: row.soLuongThiSinh,
    };
}

function sliceRankingRows(rows, top) {
    if (!Number.isInteger(Number(top)) || Number(top) < 1) {
        return rows;
    }

    return rows.slice(0, Number(top));
}

async function ensureEntityExists(tx, table, id, message) {
    const [row] = await tx
        .select({ id: table.id })
        .from(table)
        .where(eq(table.id, Number(id)))
        .limit(1);

    if (!row) {
        throw message;
    }
}

async function layThoiGianThiTheoDeThi(tx, deThiId) {
    const [row] = await tx
        .select({
            thoiGianThi: dotThi.thoiGianThi,
        })
        .from(deThi)
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .where(eq(deThi.id, Number(deThiId)))
        .limit(1);

    return row?.thoiGianThi || 0;
}

async function layCauHoiDeThiInternal(tx, deThiId, baiThiId) {
    const columnSupport = await getBaiThiChiTietColumnSupport();
    const rows = await tx
        .select({
            deThiId: deThi.id,
            id: tracNghiem.id,
            cauHoi: tracNghiem.cauHoi,
            cauA: tracNghiem.cauA,
            cauB: tracNghiem.cauB,
            cauC: tracNghiem.cauC,
            cauD: tracNghiem.cauD,
            loaiCauHoi: tracNghiem.loaiCauHoi,
            diem: tracNghiem.diem,
            thuTu: deThiCauHoi.thuTu,
            dapAnChon: baiThiChiTiet.dapAnChon,
            dapAnChonNhieu: columnSupport.hasDapAnChonNhieu
                ? baiThiChiTiet.dapAnChonNhieu
                : sql`null`,
            dapAnTuDo: columnSupport.hasDapAnTuDo
                ? baiThiChiTiet.dapAnTuDo
                : sql`null`,
            coTronDapAn: sql`${deThi.lanThi} > 1 and ${dotThi.coTronCauHoi} = true`,
        })
        .from(deThiCauHoi)
        .innerJoin(deThi, eq(deThi.id, deThiCauHoi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .innerJoin(tracNghiem, eq(tracNghiem.id, deThiCauHoi.cauHoiId))
        .leftJoin(
            baiThiChiTiet,
            and(
                eq(baiThiChiTiet.cauHoiId, tracNghiem.id),
                eq(baiThiChiTiet.baiThiId, Number(baiThiId))
            )
        )
        .where(eq(deThiCauHoi.deThiId, Number(deThiId)))
        .orderBy(asc(deThiCauHoi.thuTu));

    return rows.map(mapTracNghiemQuestion);
}

async function layCauHoiTuLuanInternal(tx, baiThiId) {
    const [info] = await tx
        .select({
            dotThiId: deThi.dotThiId,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .where(eq(baiThi.id, Number(baiThiId)))
        .limit(1);

    if (!info?.dotThiId) {
        return [];
    }

    const rows = await tx
        .select({
            id: tuLuanDotThi.id,
            cauHoi: tuLuanDotThi.cauHoi,
            dotThiId: tuLuanDotThi.dotThiId,
            goiY: tuLuanDotThi.goiY,
            dapAn: baiThiChiTietTuLuan.dapAn,
            diem: baiThiChiTietTuLuan.diem,
        })
        .from(tuLuanDotThi)
        .leftJoin(
            baiThiChiTietTuLuan,
            and(
                eq(baiThiChiTietTuLuan.cauHoiId, tuLuanDotThi.id),
                eq(baiThiChiTietTuLuan.baiThiId, Number(baiThiId))
            )
        )
        .where(eq(tuLuanDotThi.dotThiId, Number(info.dotThiId)))
        .orderBy(asc(tuLuanDotThi.id));

    return rows.map(mapTuLuanQuestion);
}

async function conDuocThiWithExecutor(executor, dotThiId, thiSinhId) {
    const [dotThiInfo, completedRows] = await Promise.all([
        executor
            .select({
                soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            })
            .from(dotThi)
            .where(eq(dotThi.id, Number(dotThiId)))
            .limit(1),
        executor
            .select({
                total: sql`count(*)::int`,
            })
            .from(baiThi)
            .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
            .where(and(
                eq(baiThi.thiSinhId, Number(thiSinhId)),
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(baiThi.trangThai, 1)
            )),
    ]);

    const max = dotThiInfo[0]?.soLanThamGiaToiDa ?? 0;
    const daThi = Number(completedRows[0]?.total || 0);

    return daThi < max;
}

exports.conDuocThi = async (dotThiId, thiSinhId) => {
    return conDuocThiWithExecutor(db, dotThiId, thiSinhId);
};

exports.layDeDangLam = async (dotThiId, thiSinhId) => {
    const [row] = await db
        .select({
            id: deThi.id,
        })
        .from(deThi)
        .innerJoin(baiThi, eq(baiThi.deThiId, deThi.id))
        .where(and(
            eq(deThi.dotThiId, Number(dotThiId)),
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(baiThi.trangThai, 0)
        ))
        .limit(1);

    return row?.id || null;
};

exports.taoDeThi = async (dotThiId, thiSinhId) => {
    const trace = createExamTrace("taoDeThi", {
        dotThiId: Number(dotThiId),
        thiSinhId: Number(thiSinhId),
    });

    return db.transaction(async (tx) => {
        const [lanThiRow] = await tx
            .select({
                lanThi: sql`coalesce(max(${deThi.lanThi}), 0) + 1`,
            })
            .from(deThi)
            .where(and(
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(deThi.thiSinhId, Number(thiSinhId))
            ));
        trace.step("loadLanThi");

        const lanThi = Number(lanThiRow?.lanThi || 1);
        const [dotThiInfo] = await tx
            .select({
                coTronCauHoi: dotThi.coTronCauHoi,
            })
            .from(dotThi)
            .where(eq(dotThi.id, Number(dotThiId)))
            .limit(1);
        trace.step("loadDotThiInfo", {
            lanThi,
        });

        const shouldShuffleQuestions =
            lanThi > 1 && Boolean(dotThiInfo?.coTronCauHoi);

        const [createdDeThi] = await tx
            .insert(deThi)
            .values({
                dotThiId: Number(dotThiId),
                thiSinhId: Number(thiSinhId),
                lanThi,
            })
            .returning({id: deThi.id});
        trace.step("insertDeThi", {
            deThiId: Number(createdDeThi?.id || 0),
        });

        const cauHinhRows = await tx
            .select()
            .from(tracNghiemDotThi)
            .where(eq(tracNghiemDotThi.dotThiId, Number(dotThiId)));
        trace.step("loadConfigs", {
            configCount: cauHinhRows.length,
        });

        const sortedConfigs = [...cauHinhRows].sort((left, right) => {
            const byLoai =
                getLoaiCauHoiOrder(left.loaiCauHoi || LOAI_CAU_HOI.CHON_MOT)
                - getLoaiCauHoiOrder(right.loaiCauHoi || LOAI_CAU_HOI.CHON_MOT);

            if (byLoai !== 0) {
                return byLoai;
            }

            return Number(left.id) - Number(right.id);
        });

        let thuTu = 0;
        let totalCandidates = 0;
        let totalSelected = 0;
        const deThiCauHoiRows = [];

        for (const config of sortedConfigs) {
            const questionRows = await tx
                .select({id: tracNghiem.id})
                .from(tracNghiem)
                .where(and(
                    eq(tracNghiem.linhVucId, config.linhVucId),
                    eq(tracNghiem.nhomId, config.nhomId),
                    eq(tracNghiem.loaiCauHoi, config.loaiCauHoi || LOAI_CAU_HOI.CHON_MOT)
                ))
                .orderBy(asc(tracNghiem.id));
            totalCandidates += questionRows.length;

            const candidateIds = questionRows.map((item) => item.id);
            const selectedIds =
                shouldShuffleQuestions
                    ? shuffleArray(
                        candidateIds,
                        (Number(createdDeThi.id) * 1000003)
                        + (Number(config.id) * 17)
                    ).slice(0, config.soLuong)
                    : candidateIds.slice(0, config.soLuong);
            totalSelected += selectedIds.length;

            for (const questionId of selectedIds) {
                thuTu += 1;
                deThiCauHoiRows.push({
                    deThiId: createdDeThi.id,
                    cauHoiId: questionId,
                    thuTu,
                });
            }
        }

        if (deThiCauHoiRows.length) {
            await tx
                .insert(deThiCauHoi)
                .values(deThiCauHoiRows);
        }

        trace.finish({
            deThiId: Number(createdDeThi?.id || 0),
            configCount: sortedConfigs.length,
            totalCandidates,
            totalSelected,
            insertedQuestionCount: deThiCauHoiRows.length,
        });

        return createdDeThi.id;
    });
};

exports.batDauThi = async (deThiId, thiSinhId) => {
    return db.transaction(async (tx) => {
        const [deRow] = await tx
            .select({
                lanThi: deThi.lanThi,
            })
            .from(deThi)
            .where(and(
                eq(deThi.id, Number(deThiId)),
                eq(deThi.thiSinhId, Number(thiSinhId))
            ))
            .limit(1);

        if (!deRow) {
            throw "Đề thi không thuộc tài khoản hiện tại.";
        }

        const [created] = await tx
            .insert(baiThi)
            .values({
                deThiId: Number(deThiId),
                thiSinhId: Number(thiSinhId),
                lanThi: deRow?.lanThi || 1,
            })
            .returning({id: baiThi.id});

        return created?.id || null;
    });
};

exports.luuCauTraLoi = async (baiThiId, cauHoiId, dapAn, thiSinhId) => {
    const trace = createExamTrace("luuCauTraLoi", {
        baiThiId: Number(baiThiId),
        cauHoiId: Number(cauHoiId),
    });

    await ensureOwnedBaiThiExists(db, baiThiId, thiSinhId);
    trace.step("ensureBaiThi");
    const columnSupport = await getBaiThiChiTietColumnSupport();
    trace.step("loadColumnSupport");

    const [question] = await db
        .select({
            id: tracNghiem.id,
            loaiCauHoi: tracNghiem.loaiCauHoi,
        })
        .from(tracNghiem)
        .where(eq(tracNghiem.id, Number(cauHoiId)))
        .limit(1);
    trace.step("loadQuestion");

    if (!question) {
        throw "Câu hỏi không tồn tại.";
    }

    await ensureTracNghiemQuestionBelongsToBaiThi(
        db,
        baiThiId,
        cauHoiId
    );
    trace.step("ensureQuestionInExam");

    const loaiCauHoi = normalizeLoaiCauHoi(question.loaiCauHoi);
    const values = {
        baiThiId: Number(baiThiId),
        cauHoiId: Number(cauHoiId),
        dapAnChon: null,
    };

    if (columnSupport.hasDapAnChonNhieu) {
        values.dapAnChonNhieu = null;
    }

    if (columnSupport.hasDapAnTuDo) {
        values.dapAnTuDo = null;
    }

    if (loaiCauHoi === LOAI_CAU_HOI.CHON_MOT) {
        const normalized = Number(dapAn);
        values.dapAnChon = Number.isInteger(normalized) ? normalized : null;
    }

    if (loaiCauHoi === LOAI_CAU_HOI.CHON_NHIEU && columnSupport.hasDapAnChonNhieu) {
        values.dapAnChonNhieu = serializeAnswerList(dapAn);
    }

    if (loaiCauHoi === LOAI_CAU_HOI.DIEN_TU && columnSupport.hasDapAnTuDo) {
        values.dapAnTuDo = String(dapAn || "").trim() || null;
    }

    await upsertBaiThiChiTietAnswer(values, columnSupport);
    trace.finish({
        loaiCauHoi,
    });

    return null;
};

exports.luuCauTraLoiTuLuan = async (baiThiId, cauHoiId, dapAn, thiSinhId) => {
    await Promise.all([
        ensureOwnedBaiThiExists(db, baiThiId, thiSinhId),
        ensureEntityExists(db, tuLuanDotThi, cauHoiId, "Câu hỏi tự luận không tồn tại."),
        ensureTuLuanQuestionBelongsToBaiThi(db, baiThiId, cauHoiId),
    ]);

    await db
        .insert(baiThiChiTietTuLuan)
        .values({
            baiThiId: Number(baiThiId),
            cauHoiId: Number(cauHoiId),
            dapAn,
        })
        .onConflictDoUpdate({
            target: [baiThiChiTietTuLuan.baiThiId, baiThiChiTietTuLuan.cauHoiId],
            set: {
                dapAn,
            },
        });

    return null;
};

exports.nopBai = async (baiThiIdValue, thiSinhId) => {
    const trace = createExamTrace("nopBai", {
        baiThiId: Number(baiThiIdValue),
    });

    return db.transaction(async (tx) => {
        await ensureOwnedBaiThiExists(tx, baiThiIdValue, thiSinhId);
        trace.step("ensureBaiThi");
        await pauseThiWithExecutor(tx, baiThiIdValue);
        trace.step("pauseThi");
        const columnSupport = await getBaiThiChiTietColumnSupport();
        trace.step("loadColumnSupport");
        const result = await finalizeBaiThiSubmission(
            tx,
            baiThiIdValue,
            columnSupport,
            trace
        );
        trace.finish({
            answerCount: result.answerCount,
            tongDiem: result.tongDiem,
            giayCongScore25: result.giayCongScore25,
        });

        return result.tongDiem;
    });
};

exports.lichSuThi = async (thiSinhId, dotThiId) => {
    const rows = await db
        .select({
            id: baiThi.id,
            deThiId: baiThi.deThiId,
            thiSinhId: baiThi.thiSinhId,
            lanThi: baiThi.lanThi,
            thoiGianBatDau: baiThi.thoiGianBatDau,
            thoiGianNop: baiThi.thoiGianNop,
            trangThai: baiThi.trangThai,
            diem: baiThi.diem,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
            lanBatDau: baiThi.lanBatDau,
            dangLam: baiThi.dangLam,
            soDuDoan: baiThi.soDuDoan,
            dotThiId: dotThi.id,
            ten: dotThi.ten,
            moTa: dotThi.moTa,
            soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            thoiGianThi: dotThi.thoiGianThi,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            thoiGianBatDauDot: dotThi.thoiGianBatDau,
            thoiGianKetThucDot: dotThi.thoiGianKetThuc,
            coTronCauHoi: dotThi.coTronCauHoi,
            choPhepLuuBai: dotThi.choPhepLuuBai,
            duDoan: dotThi.duDoan,
            trangThaiDot: dotThi.trangThai,
            createdAtDot: dotThi.createdAt,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .where(and(
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(deThi.dotThiId, Number(dotThiId))
        ))
        .orderBy(asc(baiThi.lanThi));

    return rows.map((row) => ({
        ...mapBaiThi(row),
        dot_thi: withLegacyKeys(mapDotThiInfo({
            id: row.dotThiId,
            cuocThiId: null,
            ten: row.ten,
            moTa: row.moTa,
            soLanThamGiaToiDa: row.soLanThamGiaToiDa,
            thoiGianThi: row.thoiGianThi,
            tyLeDanhGiaDat: row.tyLeDanhGiaDat,
            thoiGianBatDau: row.thoiGianBatDauDot,
            thoiGianKetThuc: row.thoiGianKetThucDot,
            coTronCauHoi: row.coTronCauHoi,
            choPhepLuuBai: row.choPhepLuuBai,
            duDoan: row.duDoan,
            trangThai: row.trangThaiDot,
            createdAt: row.createdAtDot,
        })),
    }));
};

exports.layCauHoiDeThi = async (deThiId, baiThiId, thiSinhId) => {
    await Promise.all([
        ensureOwnedDeThiExists(db, deThiId, thiSinhId),
        ensureOwnedBaiThiExists(db, baiThiId, thiSinhId),
        ensureDeThiMatchesBaiThi(db, deThiId, baiThiId),
    ]);

    return layCauHoiDeThiInternal(db, deThiId, baiThiId);
};

exports.layBaiDangLam = async (thiSinhId, dotThiId) => {
    const [row] = await db
        .select({
            id: baiThi.id,
            deThiId: baiThi.deThiId,
            thiSinhId: baiThi.thiSinhId,
            lanThi: baiThi.lanThi,
            thoiGianBatDau: baiThi.thoiGianBatDau,
            thoiGianNop: baiThi.thoiGianNop,
            trangThai: baiThi.trangThai,
            diem: baiThi.diem,
            tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
            lanBatDau: baiThi.lanBatDau,
            dangLam: baiThi.dangLam,
            soDuDoan: baiThi.soDuDoan,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .where(and(
            eq(baiThi.thiSinhId, Number(thiSinhId)),
            eq(deThi.dotThiId, Number(dotThiId)),
            eq(baiThi.trangThai, 0)
        ))
        .limit(1);

    return row ? mapBaiThi(row) : {};
};

exports.startThi = async (dotThiId, thiSinhId) => {
    const trace = createExamTrace("startThi", {
        dotThiId: Number(dotThiId),
        thiSinhId: Number(thiSinhId),
    });

    return db.transaction(async (tx) => {
        const [existing] = await tx
            .select({
                baiThiId: baiThi.id,
                deThiId: baiThi.deThiId,
                thoiGianThi: dotThi.thoiGianThi,
                tongThoiGianDaLam: baiThi.tongThoiGianDaLam,
                lanBatDau: baiThi.lanBatDau,
                dangLam: baiThi.dangLam,
                choPhepLuuBai: dotThi.choPhepLuuBai,
            })
            .from(baiThi)
            .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
            .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
            .where(and(
                eq(baiThi.thiSinhId, Number(thiSinhId)),
                eq(deThi.dotThiId, Number(dotThiId)),
                eq(baiThi.trangThai, 0)
            ))
            .limit(1);
        trace.step("loadExistingBaiThi", {
            hasExisting: Boolean(existing?.baiThiId),
        });

        let currentExisting = existing || null;

        if (currentExisting?.baiThiId && !currentExisting?.choPhepLuuBai) {
            await pauseThiWithExecutor(tx, existing.baiThiId);
            trace.step("autoPauseExistingNoSave");

            const columnSupport = await getBaiThiChiTietColumnSupport();
            trace.step("loadColumnSupportForAutoSubmit");

            await finalizeBaiThiSubmission(
                tx,
                currentExisting.baiThiId,
                columnSupport,
                trace
            );
            trace.step("autoSubmitExistingNoSave", {
                baiThiId: Number(currentExisting.baiThiId),
            });

            currentExisting = null;
        }

        const conDuoc = await conDuocThiWithExecutor(tx, dotThiId, thiSinhId);
        trace.step("conDuocThi");

        if (!conDuoc) {
            trace.finish({
                result: "het_lan_thi",
            });
            return {error: "het_lan_thi"};
        }

        let baiThiIdValue = currentExisting?.baiThiId || null;
        let deThiIdValue = currentExisting?.deThiId || null;
        let thoiGianThi = currentExisting?.thoiGianThi || 0;
        let tongDaLam = Number(currentExisting?.tongThoiGianDaLam || 0);
        let lanBatDau = currentExisting?.lanBatDau || null;

        if (!baiThiIdValue) {
            deThiIdValue = await exports.taoDeThi(dotThiId, thiSinhId);
            trace.step("taoDeThi", {
                deThiId: Number(deThiIdValue || 0),
            });
            baiThiIdValue = await exports.batDauThi(deThiIdValue, thiSinhId);
            trace.step("batDauThi", {
                baiThiId: Number(baiThiIdValue || 0),
            });
            thoiGianThi = await layThoiGianThiTheoDeThi(tx, deThiIdValue);
            trace.step("loadThoiGianThi");
            tongDaLam = 0;
            lanBatDau = null;
        }

        if (!lanBatDau) {
            const now = new Date();

            await tx
                .update(baiThi)
                .set({
                    lanBatDau: now,
                    dangLam: true,
                })
                .where(eq(baiThi.id, Number(baiThiIdValue)));

            lanBatDau = now;
            trace.step("markDangLam");
        }

        const diff = Math.floor((Date.now() - new Date(lanBatDau).getTime()) / 1000);
        let timeLeft = (Number(thoiGianThi || 0) * 60) - (tongDaLam + diff);

        if (timeLeft < 0) {
            timeLeft = 0;
        }

        const [cauHoi, tuLuan] = await Promise.all([
            layCauHoiDeThiInternal(tx, deThiIdValue, baiThiIdValue),
            layCauHoiTuLuanInternal(tx, baiThiIdValue),
        ]);
        trace.finish({
            deThiId: Number(deThiIdValue || 0),
            baiThiId: Number(baiThiIdValue || 0),
            cauHoiCount: cauHoi.length,
            tuLuanCount: tuLuan.length,
            timeLeft,
        });

        return {
            deThiId: deThiIdValue,
            baiThiId: baiThiIdValue,
            timeLeft,
            cauHoi,
            tuLuan,
            de_thi_id: deThiIdValue,
            bai_thi_id: baiThiIdValue,
            time_left: timeLeft,
        };
    });
};

exports.pauseThi = async (baiThiIdValue, thiSinhId) => {
    await ensureOwnedBaiThiExists(db, baiThiIdValue, thiSinhId);
    return pauseThiWithExecutor(db, baiThiIdValue);
};

exports.nopDuDoanKetQuan = async (baiThiIdValue, soDuDoan, thiSinhId = null) => {
    if (thiSinhId != null) {
        await ensureOwnedBaiThiExists(db, baiThiIdValue, thiSinhId);
    }

    const updated = await db
        .update(baiThi)
        .set({
            soDuDoan,
        })
        .where(eq(baiThi.id, Number(baiThiIdValue)))
        .returning({id: baiThi.id});

    if (!updated.length) {
        throw "Bài thi không tồn tại";
    }

    return true;
};

exports.autoSubmitBaiThi = async (baiThiIdValue, payload = {}, thiSinhId) => {
    const trace = createExamTrace("autoSubmitBaiThi", {
        baiThiId: Number(baiThiIdValue),
    });

    await ensureOwnedBaiThiExists(db, baiThiIdValue, thiSinhId);
    trace.step("ensureBaiThi");

    const persistedCount = await persistAutoSubmitAnswers(
        baiThiIdValue,
        payload.answers
    );
    trace.step("persistAnswers", {
        answerCount: persistedCount,
    });

    if (payload.prediction !== undefined) {
        await exports.nopDuDoanKetQuan(
            baiThiIdValue,
            payload.prediction,
            thiSinhId
        );
        trace.step("savePrediction");
    }

    return db.transaction(async (tx) => {
        await pauseThiWithExecutor(tx, baiThiIdValue);
        trace.step("pauseThi");

        const columnSupport = await getBaiThiChiTietColumnSupport();
        trace.step("loadColumnSupport");

        const result = await finalizeBaiThiSubmission(
            tx,
            baiThiIdValue,
            columnSupport,
            trace
        );

        trace.finish({
            answerCount: result.answerCount,
            tongDiem: result.tongDiem,
        });

        return result.tongDiem;
    });
};

async function layDanhSachBaiThiXepHang(whereClause, options = {}) {
    const trace = createExamTrace("lay-danh-sach-bai-thi-xep-hang");
    const preserveLegacyWeekOne = Boolean(options.preserveLegacyWeekOne);
    const topLimit =
        Number.isInteger(Number(options.top)) && Number(options.top) > 0
            ? Number(options.top)
            : 10;
    const partitionOrderSql =
        preserveLegacyWeekOne
            ? sql`
                candidate_exams.diem desc nulls last,
                candidate_exams.thoi_gian asc nulls last,
                candidate_exams.bai_thi_id asc
            `
            : sql`
                candidate_exams.diem desc nulls last,
                abs(coalesce(candidate_exams.so_du_doan, 0) - coalesce(summary.so_nguoi_100, 0)) asc,
                candidate_exams.thoi_gian asc nulls last,
                candidate_exams.bai_thi_id asc
            `;
    const finalOrderSql =
        preserveLegacyWeekOne
            ? sql`
                ranked_candidates.diem desc nulls last,
                ranked_candidates.sai_so asc,
                ranked_candidates.thoi_gian asc nulls last,
                ranked_candidates.bai_thi_id asc
            `
            : sql`
                ranked_candidates.diem desc nulls last,
                ranked_candidates.sai_so asc,
                ranked_candidates.thoi_gian asc nulls last,
                ranked_candidates.bai_thi_id asc
            `;
    const result = await db.execute(sql`
        with candidate_exams as (
            select
                ${baiThi.id} as bai_thi_id,
                ${baiThi.thiSinhId} as thi_sinh_id,
                ${baiThi.diem} as diem,
                ${baiThi.tongThoiGianDaLam} as thoi_gian,
                ${baiThi.soDuDoan} as so_du_doan,
                ${dotThi.id} as dot_thi_id,
                ${dotThi.thoiGianThi} as thoi_gian_thi,
                ${users.id} as user_id,
                ${users.username} as username,
                ${users.hoTen} as ho_ten,
                ${users.diaChiDong1} as dia_chi_dong_1,
                ${users.xaPhuong} as xa_phuong,
                ${users.tinhThanh} as tinh_thanh,
                ${users.donViId} as don_vi_id,
                ${donVi.ten} as don_vi_ten,
                ${users.createdAt} as created_at
            from ${baiThi}
            inner join ${deThi} on ${deThi.id} = ${baiThi.deThiId}
            inner join ${dotThi} on ${dotThi.id} = ${deThi.dotThiId}
            inner join ${users} on ${users.id} = ${baiThi.thiSinhId}
            left join ${donVi} on ${donVi.id} = ${users.donViId}
            where ${and(
                whereClause,
                eq(baiThi.trangThai, 1),
                sql`coalesce(${baiThi.diem}, 0) >= coalesce(${dotThi.tyLeDanhGiaDat}, 0)`
            )}
        ),
        attempt_counts as (
            select
                ${baiThi.thiSinhId} as thi_sinh_id,
                count(*)::int as so_luot_thi
            from ${baiThi}
            inner join ${deThi} on ${deThi.id} = ${baiThi.deThiId}
            inner join ${dotThi} on ${dotThi.id} = ${deThi.dotThiId}
            where ${and(whereClause, eq(baiThi.trangThai, 1))}
            group by ${baiThi.thiSinhId}
        ),
        detail_stats as (
            select
                candidate_exams.bai_thi_id,
                count(*)::int as tong,
                coalesce(sum(case when ${baiThiChiTiet.dung} then 1 else 0 end), 0)::int as dung
            from candidate_exams
            inner join ${baiThiChiTiet}
                on ${baiThiChiTiet.baiThiId} = candidate_exams.bai_thi_id
            group by candidate_exams.bai_thi_id
        ),
        summary as (
            select
                count(distinct candidate_exams.thi_sinh_id)::int as so_nguoi_100
            from candidate_exams
            inner join detail_stats
                on detail_stats.bai_thi_id = candidate_exams.bai_thi_id
            where detail_stats.tong > 0
              and detail_stats.dung = detail_stats.tong
        ),
        ranked_candidates as (
            select
                candidate_exams.*,
                coalesce(summary.so_nguoi_100, 0)::int as so_nguoi_100,
                abs(coalesce(candidate_exams.so_du_doan, 0) - coalesce(summary.so_nguoi_100, 0))::int as sai_so,
                coalesce(attempt_counts.so_luot_thi, 1)::int as so_luot_thi,
                row_number() over (
                    partition by candidate_exams.thi_sinh_id
                    order by ${partitionOrderSql}
                ) as rn
            from candidate_exams
            cross join summary
            left join attempt_counts on attempt_counts.thi_sinh_id = candidate_exams.thi_sinh_id
        )
        select *
        from ranked_candidates
        where rn = 1
        order by ${finalOrderSql}
        limit ${topLimit}
    `);
    const rows = result.rows || [];
    trace.step("load-ranked-rows", { rowCount: rows.length });

    const rankedRows = rows.map((row) => ({
        baiThiId: Number(row.bai_thi_id),
        thiSinhId: Number(row.thi_sinh_id),
        dotThiId: Number(row.dot_thi_id),
        diem: Number(row.diem || 0),
        thoiGian: row.thoi_gian == null ? null : Number(row.thoi_gian),
        thoiGianThi: row.thoi_gian_thi == null ? null : Number(row.thoi_gian_thi),
        soDuDoan: row.so_du_doan == null ? null : Number(row.so_du_doan),
        soNguoi100: Number(row.so_nguoi_100 || 0),
        saiSo: Number(row.sai_so || 0),
        soLuotThi: Number(row.so_luot_thi || 1),
        thiSinh: mapThiSinh({
            id: Number(row.user_id),
            username: row.username,
            hoTen: row.ho_ten,
            diaChiDong1: row.dia_chi_dong_1,
            xaPhuong: row.xa_phuong,
            tinhThanh: row.tinh_thanh,
            donViId: row.don_vi_id == null ? null : Number(row.don_vi_id),
            donViTen: row.don_vi_ten,
            createdAt: row.created_at,
        }),
    }));

    trace.finish({
        uniqueThiSinh: rankedRows.length,
        topLimit,
        preserveLegacyWeekOne,
    });

    return rankedRows;
}

async function layXepHangDonViTheoDieuKien(whereClause) {
    const rows = await db
        .select({
            donViId: donVi.id,
            tenDonVi: donVi.ten,
            soLuongThiSinh: sql`count(${baiThi.id})::int`,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .innerJoin(users, eq(users.id, baiThi.thiSinhId))
        .innerJoin(donVi, eq(donVi.id, users.donViId))
        .where(and(
            whereClause,
            eq(baiThi.trangThai, 1)
        ))
        .groupBy(donVi.id, donVi.ten);

    return rows
        .map((row) => ({
            donViId: row.donViId,
            tenDonVi: row.tenDonVi,
            soLuongThiSinh: Number(row.soLuongThiSinh || 0),
        }))
        .sort(compareDonViRankingRow);
}

exports.xepHangTracNghiemTheoDotThi = async (dotThiId, topGiai) => {
    const top = Number(topGiai) || 10;
    const cacheKey = getRankingCacheKey("ranking-dot-thi", dotThiId, top);

    return runRankingTask(cacheKey, async () => {
        const rows = await layDanhSachBaiThiXepHang(
            eq(deThi.dotThiId, Number(dotThiId)),
            {
                preserveLegacyWeekOne: shouldKeepLegacyRankingForDotThi(dotThiId),
                top,
            }
        );

        return rows
            .map(mapRankingRow);
    });
};

exports.xepHangTracNghiemTheoCuocThi = async (cuocThiId, topGiai) => {
    const top = Number(topGiai) || 10;
    const cacheKey = getRankingCacheKey("ranking-cuoc-thi", cuocThiId, top);

    return runRankingTask(cacheKey, async () => {
        const data = await layDanhSachBaiThiXepHang(
            eq(dotThi.cuocThiId, Number(cuocThiId)),
            {
                top,
            }
        );

        return data
            .map(mapRankingRow);
    });
};

exports.xepHangDonViTheoDotThi = async (dotThiId, top) => {
    const normalizedTop =
        Number.isInteger(Number(top)) && Number(top) > 0
            ? Number(top)
            : 0;
    const cacheKey = getRankingCacheKey("honor-dot-thi", dotThiId, normalizedTop);

    return runRankingTask(cacheKey, async () => {
        const rows = await layXepHangDonViTheoDieuKien(
            eq(deThi.dotThiId, Number(dotThiId))
        );

        return sliceRankingRows(rows, top)
            .map(mapDonViRankingRow);
    });
};

exports.xepHangDonViTheoCuocThi = async (cuocThiId, top) => {
    const normalizedTop =
        Number.isInteger(Number(top)) && Number(top) > 0
            ? Number(top)
            : 0;
    const cacheKey = getRankingCacheKey("honor-cuoc-thi", cuocThiId, normalizedTop);

    return runRankingTask(cacheKey, async () => {
        const data = await layXepHangDonViTheoDieuKien(
            eq(dotThi.cuocThiId, Number(cuocThiId))
        );

        return sliceRankingRows(data, top)
            .map(mapDonViRankingRow);
    });
};

exports.layPublicRankingSnapshot = async (dotThiId, cuocThiId) => {
    const [row] = await db
        .select()
        .from(publicRankingSnapshot)
        .where(and(
            eq(publicRankingSnapshot.dotThiId, Number(dotThiId)),
            eq(publicRankingSnapshot.cuocThiId, Number(cuocThiId))
        ))
        .limit(1);

    return mapPublicRankingSnapshot(row);
};

exports.layScopePublicRankingTheoBaiThi = async (baiThiIdValue) => {
    const [row] = await db
        .select({
            dotThiId: dotThi.id,
            cuocThiId: dotThi.cuocThiId,
        })
        .from(baiThi)
        .innerJoin(deThi, eq(deThi.id, baiThi.deThiId))
        .innerJoin(dotThi, eq(dotThi.id, deThi.dotThiId))
        .where(eq(baiThi.id, Number(baiThiIdValue)))
        .limit(1);

    if (!row) {
        return null;
    }

    return {
        dotThiId: Number(row.dotThiId),
        cuocThiId: Number(row.cuocThiId),
    };
};

exports.luuPublicRankingSnapshot = async ({
    dotThiId,
    cuocThiId,
    rankingTop,
    honorTop,
    payload,
}) => {
    const [row] = await db
        .insert(publicRankingSnapshot)
        .values({
            dotThiId: Number(dotThiId),
            cuocThiId: Number(cuocThiId),
            rankingTop: Number(rankingTop) || 20,
            honorTop: Number(honorTop) || 200,
            payload,
            createdAt: new Date(),
        })
        .onConflictDoUpdate({
            target: [
                publicRankingSnapshot.dotThiId,
                publicRankingSnapshot.cuocThiId,
            ],
            set: {
                rankingTop: Number(rankingTop) || 20,
                honorTop: Number(honorTop) || 200,
                payload,
                createdAt: new Date(),
            },
        })
        .returning();

    return mapPublicRankingSnapshot(row);
};

exports.thongKeThamGiaTheoDonVi = async ({
    cuocThiId = null,
    dotThiId = null,
} = {}) => {
    const normalizedDotThiId =
        Number.isInteger(Number(dotThiId)) && Number(dotThiId) > 0
            ? Number(dotThiId)
            : null;
    const normalizedCuocThiId =
        Number.isInteger(Number(cuocThiId)) && Number(cuocThiId) > 0
            ? Number(cuocThiId)
            : null;
    const participationConditions = [sql`bt.trang_thai = 1`, sql`u.role = 'user'`];

    if (normalizedDotThiId) {
        participationConditions.push(sql`dt.dot_thi_id = ${normalizedDotThiId}`);
    } else if (normalizedCuocThiId) {
        participationConditions.push(sql`dtt.cuoc_thi_id = ${normalizedCuocThiId}`);
    }

    const result = await db.execute(sql`
        with user_stats as (
            select
                u.don_vi_id,
                count(*)::int as tong_tai_khoan_thi_sinh,
                coalesce(sum(case when u.doi_tuong = 'dang_vien' then 1 else 0 end), 0)::int as tong_tai_khoan_dang_vien
            from auth.users u
            where u.role = 'user'
            group by u.don_vi_id
        ),
        participation_stats as (
            select
                u.don_vi_id,
                count(distinct bt.thi_sinh_id)::int as so_nguoi_tham_gia,
                count(distinct case when u.doi_tuong = 'dang_vien' then bt.thi_sinh_id end)::int as so_dang_vien_tham_gia,
                count(bt.id)::int as so_luot_nop_bai
            from thi.bai_thi bt
            inner join auth.users u on u.id = bt.thi_sinh_id
            inner join thi.de_thi dt on dt.id = bt.de_thi_id
            inner join thi.dot_thi dtt on dtt.id = dt.dot_thi_id
            where ${sql.join(participationConditions, sql` and `)}
            group by u.don_vi_id
        )
        select
            dv.id,
            dv.ten,
            coalesce(us.tong_tai_khoan_thi_sinh, 0)::int as tong_tai_khoan_thi_sinh,
            coalesce(ps.so_nguoi_tham_gia, 0)::int as so_nguoi_tham_gia,
            coalesce(us.tong_tai_khoan_dang_vien, 0)::int as tong_tai_khoan_dang_vien,
            coalesce(ps.so_dang_vien_tham_gia, 0)::int as so_dang_vien_tham_gia,
            coalesce(ps.so_luot_nop_bai, 0)::int as so_luot_nop_bai
        from dm_chung.don_vi dv
        left join user_stats us on us.don_vi_id = dv.id
        left join participation_stats ps on ps.don_vi_id = dv.id
        order by
            coalesce(ps.so_nguoi_tham_gia, 0) desc,
            dv.ten asc
    `);

    return (result.rows || []).map((row, index) => {
        const tongTaiKhoanThiSinh = Number(row.tong_tai_khoan_thi_sinh || 0);
        const soNguoiThamGia = Number(row.so_nguoi_tham_gia || 0);
        const tongTaiKhoanDangVien = Number(row.tong_tai_khoan_dang_vien || 0);
        const soDangVienThamGia = Number(row.so_dang_vien_tham_gia || 0);
        const soLuotNopBai = Number(row.so_luot_nop_bai || 0);
        const tyLeThamGia =
            tongTaiKhoanThiSinh > 0
                ? Number(((soNguoiThamGia / tongTaiKhoanThiSinh) * 100).toFixed(2))
                : 0;

        return {
            stt: index + 1,
            id: Number(row.id),
            ten_don_vi: row.ten || "-",
            cuoc_thi_id: normalizedDotThiId ? null : normalizedCuocThiId,
            dot_thi_id: normalizedDotThiId,
            tong_tai_khoan_thi_sinh: tongTaiKhoanThiSinh,
            so_nguoi_tham_gia: soNguoiThamGia,
            tong_tai_khoan_dang_vien: tongTaiKhoanDangVien,
            so_dang_vien_tham_gia: soDangVienThamGia,
            so_luot_nop_bai: soLuotNopBai,
            ty_le_tham_gia: tyLeThamGia,
        };
    });
};

