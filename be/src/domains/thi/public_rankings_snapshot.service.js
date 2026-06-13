const query = require("./thi.query");
const dotThiQuery = require("../dot-thi/dot_thi.query");

const PUBLIC_RANKING_TOP = 20;
const PUBLIC_HONOR_TOP = 200;
const PUBLIC_RANKINGS_SNAPSHOT_TTL_MS = Number(
    process.env.PUBLIC_RANKINGS_SNAPSHOT_TTL_MS || 120000
);

function isFreshSnapshot(snapshot, now = Date.now()) {
    if (!snapshot?.createdAt) {
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
    }));
}

function sliceHonorBoardRows(rows = [], top) {
    return rows.slice(0, Number(top) || PUBLIC_HONOR_TOP);
}

async function buildPublicRankingsPayload(dotThiId, cuocThiId) {
    const [
        rankingsDotThi,
        rankingsCuocThi,
        honorDotThiByAttempts,
        honorCuocThiByAttempts,
        honorDotThiByParticipants,
        honorCuocThiByParticipants,
    ] = await Promise.all([
        query.xepHangTracNghiemTheoDotThi(dotThiId, PUBLIC_RANKING_TOP),
        query.xepHangTracNghiemTheoCuocThi(cuocThiId, PUBLIC_RANKING_TOP),
        query.xepHangDonViTheoDotThi(dotThiId, PUBLIC_HONOR_TOP),
        query.xepHangDonViTheoCuocThi(cuocThiId, PUBLIC_HONOR_TOP),
        query.thongKeThamGiaTheoDonVi({dotThiId}),
        query.thongKeThamGiaTheoDonVi({cuocThiId}),
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
    const payload = await buildPublicRankingsPayload(dotThiId, cuocThiId);
    await writePublicRankingsSnapshot(dotThiId, cuocThiId, payload);
    return payload;
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

module.exports = {
    PUBLIC_RANKING_TOP,
    PUBLIC_HONOR_TOP,
    PUBLIC_RANKINGS_SNAPSHOT_TTL_MS,
    buildPublicRankingsPayload,
    refreshPublicRankingsSnapshot,
    refreshNearestPublicRankingsSnapshot,
    getPublicRankingsSnapshotOrRefresh,
};
