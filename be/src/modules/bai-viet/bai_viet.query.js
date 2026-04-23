const { and, count, desc, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { baiViet } = require("../../db/schema");
const { buildPagedResult, normalizePagination } = require("../../utils/drizzle");

function mapBaiViet(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        tieuDe: row.tieuDe,
        tomTat: row.tomTat,
        noiDung: row.noiDung,
        anhDaiDien: row.anhDaiDien,
        ngayDang: row.ngayDang,
        trangThai: row.trangThai,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        nguoiTao: row.nguoiTao,
    };
}

function buildWhere({
    search = "",
    chiHienThi = false,
}) {
    const clauses = [];

    if (search?.trim()) {
        clauses.push(ilike(baiViet.tieuDe, `%${search.trim()}%`));
    }

    if (chiHienThi) {
        clauses.push(eq(baiViet.trangThai, true));
    }

    if (!clauses.length) {
        return undefined;
    }

    return clauses.length === 1 ? clauses[0] : and(...clauses);
}

exports.layDanhSachBaiViet = async ({
    page = 1,
    size = 50,
    search = "",
    chiHienThi = false,
}) => {
    const paging = normalizePagination({page, size, defaultSize: 50});
    const where = buildWhere({search, chiHienThi});

    const rowsQuery = db
        .select()
        .from(baiViet)
        .orderBy(desc(baiViet.ngayDang), desc(baiViet.id))
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count()})
        .from(baiViet);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return buildPagedResult({
        data: rows.map(mapBaiViet),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.layBaiVietTheoId = async (id) => {
    const [row] = await db
        .select()
        .from(baiViet)
        .where(eq(baiViet.id, Number(id)))
        .limit(1);

    return mapBaiViet(row);
};

exports.themBaiViet = async (value) => {
    const [created] = await db
        .insert(baiViet)
        .values({
            tieuDe: value.tieuDe,
            tomTat: value.tomTat || "",
            noiDung: value.noiDung,
            anhDaiDien: value.anhDaiDien || "",
            ngayDang: value.ngayDang,
            trangThai: value.trangThai ?? true,
            nguoiTao: value.nguoiTao || null,
        })
        .returning();

    return mapBaiViet(created);
};

exports.suaBaiViet = async (id, value) => {
    const [updated] = await db
        .update(baiViet)
        .set({
            tieuDe: value.tieuDe,
            tomTat: value.tomTat || "",
            noiDung: value.noiDung,
            anhDaiDien: value.anhDaiDien || "",
            ngayDang: value.ngayDang,
            trangThai: value.trangThai ?? true,
            updatedAt: new Date(),
        })
        .where(eq(baiViet.id, Number(id)))
        .returning();

    return mapBaiViet(updated);
};

exports.xoaBaiViet = async (id) => {
    await db
        .delete(baiViet)
        .where(eq(baiViet.id, Number(id)));

    return true;
};

