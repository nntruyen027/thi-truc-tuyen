const { and, count, desc, eq, gte, ilike, lte } = require("drizzle-orm");
const db = require("../../db/client");
const { cuocThi, dotThi, tracNghiemDotThi, tuLuanDotThi } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../utils/drizzle");

function mapCuocThi(row) {
    if (!row?.cuoc_thi_id) {
        return null;
    }

    return {
        id: row.cuoc_thi_id,
        ten: row.cuoc_thi_ten,
        mo_ta: row.cuoc_thi_mo_ta,
        thoi_gian_bat_dau: row.cuoc_thi_thoi_gian_bat_dau,
        thoi_gian_ket_thuc: row.cuoc_thi_thoi_gian_ket_thuc,
        trang_thai: row.cuoc_thi_trang_thai,
        cho_phep_xem_lich_su: row.cuoc_thi_cho_phep_xem_lich_su,
        cho_phep_xem_lai_dap_an: row.cuoc_thi_cho_phep_xem_lai_dap_an,
        co_tu_luan: row.cuoc_thi_co_tu_luan,
        created_at: row.cuoc_thi_created_at,
    };
}

function mapDotThi(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        cuoc_thi_id: row.cuocThiId,
        ten: row.ten,
        mo_ta: row.moTa,
        so_lan_tham_gia_toi_da: row.soLanThamGiaToiDa,
        thoi_gian_thi: row.thoiGianThi,
        ty_le_danh_gia_dat: row.tyLeDanhGiaDat,
        thoi_gian_bat_dau: row.thoiGianBatDau,
        thoi_gian_ket_thuc: row.thoiGianKetThuc,
        co_tron_cau_hoi: row.coTronCauHoi,
        cho_phep_luu_bai: row.choPhepLuuBai,
        du_doan: row.duDoan,
        trang_thai: row.trangThai,
        created_at: row.createdAt,
    };
}

function mapTracNghiemDotThi(row) {
    return {
        id: row.id,
        dot_thi_id: row.dotThiId,
        linh_vuc_id: row.linhVucId,
        nhom_id: row.nhomId,
        so_luong: row.soLuong,
    };
}

function mapTuLuanDotThi(row) {
    return {
        id: row.id,
        dot_thi_id: row.dotThiId,
        cau_hoi: row.cauHoi,
        goi_y: row.goiY,
    };
}

async function getDotThiWithCuocThi(id) {
    const [row] = await db
        .select({
            id: dotThi.id,
            cuocThiId: dotThi.cuocThiId,
            ten: dotThi.ten,
            moTa: dotThi.moTa,
            soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            thoiGianThi: dotThi.thoiGianThi,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            thoiGianBatDau: dotThi.thoiGianBatDau,
            thoiGianKetThuc: dotThi.thoiGianKetThuc,
            coTronCauHoi: dotThi.coTronCauHoi,
            choPhepLuuBai: dotThi.choPhepLuuBai,
            duDoan: dotThi.duDoan,
            trangThai: dotThi.trangThai,
            createdAt: dotThi.createdAt,
            cuoc_thi_id: cuocThi.id,
            cuoc_thi_ten: cuocThi.ten,
            cuoc_thi_mo_ta: cuocThi.moTa,
            cuoc_thi_thoi_gian_bat_dau: cuocThi.thoiGianBatDau,
            cuoc_thi_thoi_gian_ket_thuc: cuocThi.thoiGianKetThuc,
            cuoc_thi_trang_thai: cuocThi.trangThai,
            cuoc_thi_cho_phep_xem_lich_su: cuocThi.choPhepXemLichSu,
            cuoc_thi_cho_phep_xem_lai_dap_an: cuocThi.choPhepXemLaiDapAn,
            cuoc_thi_co_tu_luan: cuocThi.coTuLuan,
            cuoc_thi_created_at: cuocThi.createdAt,
        })
        .from(dotThi)
        .leftJoin(cuocThi, eq(dotThi.cuocThiId, cuocThi.id))
        .where(eq(dotThi.id, Number(id)))
        .limit(1);

    if (!row) {
        return null;
    }

    return {
        ...mapDotThi(row),
        cuoc_thi: mapCuocThi(row),
    };
}

exports.layDsDotThi = async (
    cuocThiId,
    size,
    page,
    search,
    sortField,
    sortType,
) => {
    const paging = normalizePagination({page, size});
    const where = [
        eq(dotThi.cuocThiId, Number(cuocThiId)),
    ];

    if (search?.trim()) {
        where.push(ilike(dotThi.ten, `%${search.trim()}%`));
    }

    const sort = resolveSort({
        sortField,
        sortType,
        columnMap: {
            id: dotThi.id,
            ten: dotThi.ten,
            mo_ta: dotThi.moTa,
            thoi_gian_bat_dau: dotThi.thoiGianBatDau,
            thoi_gian_ket_thuc: dotThi.thoiGianKetThuc,
            created_at: dotThi.createdAt,
        },
        defaultField: "id",
    });

    const condition = and(...where);

    const rows = await db
        .select({
            id: dotThi.id,
            cuocThiId: dotThi.cuocThiId,
            ten: dotThi.ten,
            moTa: dotThi.moTa,
            soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            thoiGianThi: dotThi.thoiGianThi,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            thoiGianBatDau: dotThi.thoiGianBatDau,
            thoiGianKetThuc: dotThi.thoiGianKetThuc,
            coTronCauHoi: dotThi.coTronCauHoi,
            choPhepLuuBai: dotThi.choPhepLuuBai,
            duDoan: dotThi.duDoan,
            trangThai: dotThi.trangThai,
            createdAt: dotThi.createdAt,
            cuoc_thi_id: cuocThi.id,
            cuoc_thi_ten: cuocThi.ten,
            cuoc_thi_mo_ta: cuocThi.moTa,
            cuoc_thi_thoi_gian_bat_dau: cuocThi.thoiGianBatDau,
            cuoc_thi_thoi_gian_ket_thuc: cuocThi.thoiGianKetThuc,
            cuoc_thi_trang_thai: cuocThi.trangThai,
            cuoc_thi_cho_phep_xem_lich_su: cuocThi.choPhepXemLichSu,
            cuoc_thi_cho_phep_xem_lai_dap_an: cuocThi.choPhepXemLaiDapAn,
            cuoc_thi_co_tu_luan: cuocThi.coTuLuan,
            cuoc_thi_created_at: cuocThi.createdAt,
        })
        .from(dotThi)
        .leftJoin(cuocThi, eq(dotThi.cuocThiId, cuocThi.id))
        .where(condition)
        .orderBy(sort.orderBy)
        .limit(paging.size)
        .offset(paging.offset);

    const [totalRow] = await db
        .select({total: count()})
        .from(dotThi)
        .where(condition);

    return buildPagedResult({
        data: rows.map((row) => ({
            ...mapDotThi(row),
            cuoc_thi: mapCuocThi(row),
        })),
        total: totalRow?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.layDotThiTheoId = async (dotThiId) => {
    const info = await getDotThiWithCuocThi(dotThiId);

    if (!info) {
        return null;
    }

    const [tracNghiemRows, tuLuanRows] = await Promise.all([
        db.select().from(tracNghiemDotThi).where(eq(tracNghiemDotThi.dotThiId, Number(dotThiId))),
        db.select().from(tuLuanDotThi).where(eq(tuLuanDotThi.dotThiId, Number(dotThiId))),
    ]);

    return {
        ...info,
        trac_nghiem: tracNghiemRows.map(mapTracNghiemDotThi),
        tu_luan: tuLuanRows.map(mapTuLuanDotThi),
    };
};

exports.layDotThiHienTai = async () => {
    const now = new Date();

    const [row] = await db
        .select({
            id: dotThi.id,
            cuocThiId: dotThi.cuocThiId,
            ten: dotThi.ten,
            moTa: dotThi.moTa,
            soLanThamGiaToiDa: dotThi.soLanThamGiaToiDa,
            thoiGianThi: dotThi.thoiGianThi,
            tyLeDanhGiaDat: dotThi.tyLeDanhGiaDat,
            thoiGianBatDau: dotThi.thoiGianBatDau,
            thoiGianKetThuc: dotThi.thoiGianKetThuc,
            coTronCauHoi: dotThi.coTronCauHoi,
            choPhepLuuBai: dotThi.choPhepLuuBai,
            duDoan: dotThi.duDoan,
            trangThai: dotThi.trangThai,
            createdAt: dotThi.createdAt,
            cuoc_thi_id: cuocThi.id,
            cuoc_thi_ten: cuocThi.ten,
            cuoc_thi_mo_ta: cuocThi.moTa,
            cuoc_thi_thoi_gian_bat_dau: cuocThi.thoiGianBatDau,
            cuoc_thi_thoi_gian_ket_thuc: cuocThi.thoiGianKetThuc,
            cuoc_thi_trang_thai: cuocThi.trangThai,
            cuoc_thi_cho_phep_xem_lich_su: cuocThi.choPhepXemLichSu,
            cuoc_thi_cho_phep_xem_lai_dap_an: cuocThi.choPhepXemLaiDapAn,
            cuoc_thi_co_tu_luan: cuocThi.coTuLuan,
            cuoc_thi_created_at: cuocThi.createdAt,
        })
        .from(dotThi)
        .leftJoin(cuocThi, eq(dotThi.cuocThiId, cuocThi.id))
        .where(and(lte(dotThi.thoiGianBatDau, now), gte(dotThi.thoiGianKetThuc, now)))
        .orderBy(desc(dotThi.thoiGianBatDau))
        .limit(1);

    if (!row) {
        return null;
    }

    return {
        ...mapDotThi(row),
        cuoc_thi: mapCuocThi(row),
    };
};

exports.themDotThi = async (
    cuocThiId,
    ten,
    mota,
    so_lan_tham_gia_toi_da,
    thoi_gian_thi,
    ty_le_danh_gia_dat,
    thoi_gian_bat_dau,
    thoi_gian_ket_thuc,
    co_tron_cau_hoi,
    cho_phep_luu_bai,
    du_doan,
    trang_thai
) => {
    const existing = await db
        .select({id: dotThi.id})
        .from(dotThi)
        .where(eq(dotThi.ten, ten))
        .limit(1);

    if (existing.length) {
        throw `Đợt thi ${ten} đã tồn tại`;
    }

    const foundContest = await db
        .select({id: cuocThi.id})
        .from(cuocThi)
        .where(eq(cuocThi.id, Number(cuocThiId)))
        .limit(1);

    if (!foundContest.length) {
        throw "Cuộc thi không tồn tại";
    }

    const [created] = await db
        .insert(dotThi)
        .values({
            cuocThiId: Number(cuocThiId),
            ten,
            moTa: mota,
            soLanThamGiaToiDa: so_lan_tham_gia_toi_da,
            thoiGianThi: thoi_gian_thi,
            tyLeDanhGiaDat: ty_le_danh_gia_dat,
            thoiGianBatDau: thoi_gian_bat_dau,
            thoiGianKetThuc: thoi_gian_ket_thuc,
            coTronCauHoi: co_tron_cau_hoi,
            choPhepLuuBai: cho_phep_luu_bai,
            duDoan: du_doan,
            trangThai: trang_thai,
        })
        .returning({id: dotThi.id});

    return getDotThiWithCuocThi(created.id);
};

exports.suaDotThi = async (
    id,
    ten,
    mota,
    so_lan_tham_gia_toi_da,
    thoi_gian_thi,
    ty_le_danh_gia_dat,
    thoi_gian_bat_dau,
    thoi_gian_ket_thuc,
    co_tron_cau_hoi,
    cho_phep_luu_bai,
    du_doan,
    trang_thai
) => {
    const [updated] = await db
        .update(dotThi)
        .set({
            ten,
            moTa: mota,
            soLanThamGiaToiDa: so_lan_tham_gia_toi_da,
            thoiGianThi: thoi_gian_thi,
            tyLeDanhGiaDat: ty_le_danh_gia_dat,
            thoiGianBatDau: thoi_gian_bat_dau,
            thoiGianKetThuc: thoi_gian_ket_thuc,
            coTronCauHoi: co_tron_cau_hoi,
            choPhepLuuBai: cho_phep_luu_bai,
            duDoan: du_doan,
            trangThai: trang_thai,
        })
        .where(eq(dotThi.id, Number(id)))
        .returning({id: dotThi.id});

    if (!updated) {
        throw "Đợt thi không tồn tại";
    }

    return getDotThiWithCuocThi(updated.id);
};

exports.xoaDotThi = async (id) => {
    await db
        .delete(dotThi)
        .where(eq(dotThi.id, Number(id)));

    return true;
};

