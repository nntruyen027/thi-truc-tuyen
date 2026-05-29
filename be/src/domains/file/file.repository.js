const { and, count, desc, eq, ilike } = require("drizzle-orm");
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
    const clauses = [];
    const searchWhere = buildSearchWhere(search);

    if (searchWhere) {
        clauses.push(searchWhere);
    }

    const where = clauses.length === 1 ? clauses[0] : and(...clauses);

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
        rowsQuery.where(where),
        totalQuery.where(where),
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

