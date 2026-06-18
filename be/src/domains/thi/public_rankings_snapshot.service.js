const query = require("./thi.query");
const dotThiQuery = require("../dot-thi/dot_thi.query");

const PUBLIC_RANKING_TOP = 20;
const PUBLIC_HONOR_TOP = 200;
const PUBLIC_RESULTS_DOT_THI_FETCH_LIMIT = Number(
    process.env.PUBLIC_RESULTS_DOT_THI_FETCH_LIMIT || 200
);
const PUBLIC_RANKINGS_SNAPSHOT_TTL_MS = Number(
    process.env.PUBLIC_RANKINGS_SNAPSHOT_TTL_MS || 120000
);
const snapshotRefreshInFlight = new Map();

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

function isFreshSnapshot(snapshot, now = Date.now()) {
    if (!snapshot?.createdAt) {
        return false;
    }

    if (!hasPublicRankingsPayload(snapshot?.payload)) {
        return false;
    }

    const createdAtMs = new Date(snapshot.createdAt).getTime();

    if (!Number.isFinite(createdAtMs)) {
        return false;
    }

    return (now - createdAtMs) <= PUBLIC_RANKINGS_SNAPSHOT_TTL_MS;
}

function mapParticipationHonorBoardRows(rows = []) {
    return rows.map((row) => ({
        donViId: Number(row?.id || 0),
        don_vi_id: Number(row?.id || 0),
        tenDonVi: row?.ten_don_vi || "-",
        ten_don_vi: row?.ten_don_vi || "-",
        soLuongThiSinh: Number(row?.so_luot_nop_bai || 0),
        so_luong_thi_sinh: Number(row?.so_luot_nop_bai || 0),
        soLuotNopBai: Number(row?.so_luot_nop_bai || 0),
        so_luot_nop_bai: Number(row?.so_luot_nop_bai || 0),
        soNguoiThamGia: Number(row?.so_nguoi_tham_gia || 0),
        so_nguoi_tham_gia: Number(row?.so_nguoi_tham_gia || 0),
        soDangVienThamGia: Number(row?.so_dang_vien_tham_gia || 0),
        so_dang_vien_tham_gia: Number(row?.so_dang_vien_tham_gia || 0),
    }));
}

function sliceHonorBoardRows(rows = [], top) {
    return rows.slice(0, Number(top) || PUBLIC_HONOR_TOP);
}

function isPastDate(value, nowMs = Date.now()) {
    const timeMs = new Date(value).getTime();

    if (!Number.isFinite(timeMs)) {
        return false;
    }

    return timeMs <= nowMs;
}

async function buildDotThiResultsPayload(cuocThiId) {
    if (!cuocThiId) {
        return {};
    }

    const dsDotThi = await dotThiQuery.layDsDotThi(
        cuocThiId,
        PUBLIC_RESULTS_DOT_THI_FETCH_LIMIT,
        1,
        "",
        "thoi_gian_bat_dau",
        "asc"
    );
    const nowMs = Date.now();
    const dsDotThiDaKetThuc =
        (dsDotThi?.data || [])
            .filter((item) => isPastDate(item?.thoi_gian_ket_thuc, nowMs))
            .sort((left, right) =>
                new Date(right?.thoi_gian_ket_thuc || 0).getTime()
                - new Date(left?.thoi_gian_ket_thuc || 0).getTime()
            );

    if (!dsDotThiDaKetThuc.length) {
        return {};
    }

    const dsKetQua = await Promise.all(
        dsDotThiDaKetThuc.map(async (item) => ([
            String(item.id),
            await query.xepHangTracNghiemTheoDotThi(item.id, PUBLIC_RANKING_TOP),
        ]))
    );

    return Object.fromEntries(dsKetQua);
}

async function buildPublicRankingsPayload(dotThiId, cuocThiId) {
    const [
        rankingsDotThi,
        rankingsCuocThi,
        honorDotThiByAttempts,
        honorCuocThiByAttempts,
        honorDotThiByParticipants,
        honorCuocThiByParticipants,
        dotThiResults,
    ] = await Promise.all([
        query.xepHangTracNghiemTheoDotThi(dotThiId, PUBLIC_RANKING_TOP),
        query.xepHangTracNghiemTheoCuocThi(cuocThiId, PUBLIC_RANKING_TOP),
        query.xepHangDonViTheoDotThi(dotThiId, PUBLIC_HONOR_TOP),
        query.xepHangDonViTheoCuocThi(cuocThiId, PUBLIC_HONOR_TOP),
        query.thongKeThamGiaTheoDonVi({dotThiId}),
        query.thongKeThamGiaTheoDonVi({cuocThiId}),
        buildDotThiResultsPayload(cuocThiId),
    ]);

    return {
        rankings: {
            "dot-thi": rankingsDotThi,
            "cuoc-thi": rankingsCuocThi,
        },
        honorBoard: {
            "dot-thi": {
                "luot-thi": honorDotThiByAttempts,
                "nguoi-tham-gia": sliceHonorBoardRows(
                    mapParticipationHonorBoardRows(honorDotThiByParticipants),
                    PUBLIC_HONOR_TOP
                ),
            },
            "cuoc-thi": {
                "luot-thi": honorCuocThiByAttempts,
                "nguoi-tham-gia": sliceHonorBoardRows(
                    mapParticipationHonorBoardRows(honorCuocThiByParticipants),
                    PUBLIC_HONOR_TOP
                ),
            },
        },
        dotThiResults,
    };
}

async function writePublicRankingsSnapshot(dotThiId, cuocThiId, payload) {
    await query.luuPublicRankingSnapshot({
        dotThiId,
        cuocThiId,
        rankingTop: PUBLIC_RANKING_TOP,
        honorTop: PUBLIC_HONOR_TOP,
        payload,
    });

    return payload;
}

async function refreshPublicRankingsSnapshot(dotThiId, cuocThiId) {
    const key = `${Number(dotThiId || 0)}:${Number(cuocThiId || 0)}`;
    const existing = snapshotRefreshInFlight.get(key);

    if (existing) {
        return existing;
    }

    const task = (async () => {
        const payload = await buildPublicRankingsPayload(dotThiId, cuocThiId);
        await writePublicRankingsSnapshot(dotThiId, cuocThiId, payload);
        return payload;
    })();

    snapshotRefreshInFlight.set(key, task);

    try {
        return await task;
    } finally {
        snapshotRefreshInFlight.delete(key);
    }
}

async function getPublicRankingsSnapshot(dotThiId, cuocThiId, options = {}) {
    const allowStale = options?.allowStale !== false;
    const snapshot =
        await query.layPublicRankingSnapshot(dotThiId, cuocThiId);

    if (!snapshot?.payload || !hasPublicRankingsPayload(snapshot.payload)) {
        return null;
    }

    if (isFreshSnapshot(snapshot)) {
        return snapshot.payload;
    }

    return allowStale ? snapshot.payload : null;
}

async function getPublicRankingDotThiResults(dotThiId, cuocThiId, options = {}) {
    const snapshot = await getPublicRankingsSnapshot(dotThiId, cuocThiId, options);

    if (!snapshot || !hasDotThiResultsPayload(snapshot)) {
        return {};
    }

    return snapshot.dotThiResults;
}

async function getPublicRankingsSnapshotOrRefresh(dotThiId, cuocThiId) {
    const snapshot =
        await query.layPublicRankingSnapshot(dotThiId, cuocThiId);

    if (isFreshSnapshot(snapshot)) {
        return snapshot.payload;
    }

    try {
        return await refreshPublicRankingsSnapshot(dotThiId, cuocThiId);
    } catch (error) {
        if (snapshot?.payload) {
            return snapshot.payload;
        }

        throw error;
    }
}

async function refreshNearestPublicRankingsSnapshot() {
    const dotThi = await dotThiQuery.layDotThiDaiDienChoBangVang();

    if (!dotThi?.id || !dotThi?.cuoc_thi_id) {
        return {
            updated: false,
            reason: "Không có đợt thi phù hợp để làm bảng vàng công khai",
        };
    }

    await refreshPublicRankingsSnapshot(dotThi.id, dotThi.cuoc_thi_id);

    return {
        updated: true,
        dotThiId: Number(dotThi.id),
        cuocThiId: Number(dotThi.cuoc_thi_id),
        laSapDienRa: Boolean(dotThi.la_sap_dien_ra),
    };
}

async function refreshPublicRankingsSnapshotByBaiThiId(baiThiId) {
    const scope = await query.layScopePublicRankingTheoBaiThi(baiThiId);

    if (!scope?.dotThiId || !scope?.cuocThiId) {
        return {
            updated: false,
            reason: "Không xác định được phạm vi snapshot cho bài thi.",
        };
    }

    await refreshPublicRankingsSnapshot(scope.dotThiId, scope.cuocThiId);

    return {
        updated: true,
        dotThiId: Number(scope.dotThiId),
        cuocThiId: Number(scope.cuocThiId),
    };
}

module.exports = {
    PUBLIC_RANKING_TOP,
    PUBLIC_HONOR_TOP,
    PUBLIC_RANKINGS_SNAPSHOT_TTL_MS,
    buildPublicRankingsPayload,
    getPublicRankingDotThiResults,
    getPublicRankingsSnapshot,
    refreshPublicRankingsSnapshot,
    refreshPublicRankingsSnapshotByBaiThiId,
    refreshNearestPublicRankingsSnapshot,
    getPublicRankingsSnapshotOrRefresh,
};
