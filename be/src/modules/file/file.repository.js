const { count, desc, eq, ilike } = require("drizzle-orm");
const db = require("../../db/client");
const { files } = require("../../db/schema");

const buildSearchWhere = (search) => {
    if (!search?.trim()) {
        return undefined;
    }

    return ilike(files.ten, `%${search.trim()}%`);
};

exports.create = async ({
    ten,
    tenGoc,
    duongDan,
    loai,
    kichThuoc,
    nguoiTao,
}) => {
    const [created] = await db
        .insert(files)
        .values({
            ten,
            tenGoc,
            duongDan,
            loai,
            kichThuoc,
            nguoiTao,
        })
        .returning();

    return created;
};

exports.findMany = async ({
    page = 1,
    size = 10,
    search = "",
}) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(size) || 10, 1);
    const where = buildSearchWhere(search);

    const rowsQuery = db
            .select()
            .from(files)
            .orderBy(desc(files.id))
            .limit(pageSize)
            .offset((currentPage - 1) * pageSize);

    const totalQuery = db
            .select({
                total: count(),
            })
            .from(files);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return {
        data: rows,
        total: totalRows[0]?.total || 0,
    };
};

exports.findById = async (id) => {
    const [row] = await db
        .select()
        .from(files)
        .where(eq(files.id, Number(id)))
        .limit(1);

    return row || null;
};

exports.removeById = async (id) => {
    await db
        .delete(files)
        .where(eq(files.id, Number(id)));

    return {
        ok: true,
    };
};
