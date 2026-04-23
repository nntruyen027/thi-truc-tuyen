const { count, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, linhVuc, nhomCauHoi } = require("../../db/schema");
const {
    buildPagedResult,
    normalizePagination,
    resolveSort,
} = require("../../utils/drizzle");

const danhMucMap = {
    don_vi: donVi,
    linh_vuc: linhVuc,
    nhom_cau_hoi: nhomCauHoi,
};

function mapDanhMuc(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        ten: row.ten,
        mo_ta: row.moTa,
    };
}

function getTable(tenDm) {
    const table = danhMucMap[tenDm];

    if (!table) {
        throw new Error("Danh mục không hợp lệ");
    }

    return table;
}

exports.layDsDanhMuc = async (
    tenDm,
    size,
    page,
    search,
    sortField,
    sortType,
) => {
    const table = getTable(tenDm);
    const paging = normalizePagination({page, size});
    const where = search?.trim()
        ? ilike(table.ten, `%${search.trim()}%`)
        : undefined;

    const sort = resolveSort({
        sortField,
        sortType,
        columnMap: {
            id: table.id,
            ten: table.ten,
            mo_ta: table.moTa,
        },
        defaultField: "id",
    });

    const rowsQuery = db
        .select()
        .from(table)
        .orderBy(sort.orderBy)
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count()})
        .from(table);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return buildPagedResult({
        data: rows.map(mapDanhMuc),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.themDanhMuc = async (tenDm, value) => {
    const table = getTable(tenDm);

    const [created] = await db
        .insert(table)
        .values({
            ten: value.ten,
            moTa: value.mo_ta,
        })
        .returning();

    return mapDanhMuc(created);
};

exports.suaDanhMuc = async (tenDm, id, value) => {
    const table = getTable(tenDm);

    const [updated] = await db
        .update(table)
        .set({
            ten: value.ten,
            moTa: value.mo_ta,
        })
        .where(eq(table.id, Number(id)))
        .returning();

    return mapDanhMuc(updated);
};

exports.xoaDanhMuc = async (tenDm, id) => {
    const table = getTable(tenDm);

    await db
        .delete(table)
        .where(eq(table.id, Number(id)));

    return true;
};

