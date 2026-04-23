const { and, count, eq, ilike, lte, gte, asc } = require("drizzle-orm");
const db = require("../../db/client");
const { cuocThi } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../utils/drizzle");

function mapCuocThi(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        ten: row.ten,
        mo_ta: row.moTa,
        thoi_gian_bat_dau: row.thoiGianBatDau,
        thoi_gian_ket_thuc: row.thoiGianKetThuc,
        trang_thai: row.trangThai,
        cho_phep_xem_lich_su: row.choPhepXemLichSu,
        cho_phep_xem_lai_dap_an: row.choPhepXemLaiDapAn,
        co_tu_luan: row.coTuLuan,
        created_at: row.createdAt,
    };
}

exports.layDsCuocThi = async (size, page, search, sortField, sortType) => {
    const paging = normalizePagination({page, size});
    const where = search?.trim()
        ? ilike(cuocThi.ten, `%${search.trim()}%`)
        : undefined;

    const sort = resolveSort({
        sortField,
        sortType,
        columnMap: {
            id: cuocThi.id,
            ten: cuocThi.ten,
            mo_ta: cuocThi.moTa,
            thoi_gian_bat_dau: cuocThi.thoiGianBatDau,
            thoi_gian_ket_thuc: cuocThi.thoiGianKetThuc,
            created_at: cuocThi.createdAt,
        },
        defaultField: "id",
    });

    const rowsQuery = db
        .select()
        .from(cuocThi)
        .orderBy(sort.orderBy)
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count()})
        .from(cuocThi);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return buildPagedResult({
        data: rows.map(mapCuocThi),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.themCuocThi = async (value) => {
    const exists = await db
        .select({id: cuocThi.id})
        .from(cuocThi)
        .where(eq(cuocThi.ten, value.ten))
        .limit(1);

    if (exists.length) {
        throw `Cuộc thi ${value.ten} đã tồn tại`;
    }

    const [created] = await db
        .insert(cuocThi)
        .values({
            ten: value.ten,
            moTa: value.mo_ta,
            thoiGianBatDau: value.thoi_gian_bat_dau,
            thoiGianKetThuc: value.thoi_gian_ket_thuc,
            trangThai: value.trang_thai,
            choPhepXemLichSu: value.cho_phep_xem_lich_su,
            choPhepXemLaiDapAn: value.cho_phep_xem_lai_dap_an,
            coTuLuan: value.co_tu_luan,
        })
        .returning();

    return mapCuocThi(created);
};

exports.suaCuocThi = async (id, value) => {
    const [updated] = await db
        .update(cuocThi)
        .set({
            ten: value.ten,
            moTa: value.mo_ta,
            thoiGianBatDau: value.thoi_gian_bat_dau,
            thoiGianKetThuc: value.thoi_gian_ket_thuc,
            trangThai: value.trang_thai,
            choPhepXemLichSu: value.cho_phep_xem_lich_su,
            choPhepXemLaiDapAn: value.cho_phep_xem_lai_dap_an,
            coTuLuan: value.co_tu_luan,
        })
        .where(eq(cuocThi.id, Number(id)))
        .returning();

    if (!updated) {
        throw "Không tồn tại cuộc thi";
    }

    return mapCuocThi(updated);
};

exports.xoaCuocThi = async (id) => {
    await db
        .delete(cuocThi)
        .where(eq(cuocThi.id, Number(id)));

    return true;
};

exports.layCuocThiTheoId = async (cuocThiId) => {
    const [row] = await db
        .select()
        .from(cuocThi)
        .where(eq(cuocThi.id, Number(cuocThiId)))
        .limit(1);

    return mapCuocThi(row);
};

exports.layThoiGianConLaiCuaCuocThi = async () => {
    const now = new Date();

    const [row] = await db
        .select()
        .from(cuocThi)
        .where(and(
            lte(cuocThi.thoiGianBatDau, now),
            gte(cuocThi.thoiGianKetThuc, now),
        ))
        .orderBy(asc(cuocThi.thoiGianKetThuc))
        .limit(1);

    const active = row || null;

    if (!active?.thoiGianKetThuc) {
        return null;
    }

    let seconds = Math.max(0, Math.floor((active.thoiGianKetThuc.getTime() - now.getTime()) / 1000));

    const thang = Math.floor(seconds / (30 * 24 * 3600));
    seconds %= 30 * 24 * 3600;

    const tuan = Math.floor(seconds / (7 * 24 * 3600));
    seconds %= 7 * 24 * 3600;

    const ngay = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;

    const gio = Math.floor(seconds / 3600);
    seconds %= 3600;

    const phut = Math.floor(seconds / 60);
    const giay = seconds % 60;

    return {
        thang,
        tuan,
        ngay,
        gio,
        phut,
        giay,
    };
};
