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
    workspaceId,
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
            workspaceId: Number(workspaceId),
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
    workspaceId,
    page = 1,
    size = 10,
    search = "",
}) => {
    const currentPage = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(size) || 10, 1);
    const clauses = [eq(files.workspaceId, Number(workspaceId))];
    const searchWhere = buildSearchWhere(search);

    if (searchWhere) {
        clauses.push(searchWhere);
    }

    const where = and(...clauses);

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

exports.findById = async (workspaceId, id) => {
    const [row] = await db
        .select()
        .from(files)
        .where(and(
            eq(files.workspaceId, Number(workspaceId)),
            eq(files.id, Number(id))
        ))
        .limit(1);

    return row || null;
};

exports.removeById = async (workspaceId, id) => {
    await db
        .delete(files)
        .where(and(
            eq(files.workspaceId, Number(workspaceId)),
            eq(files.id, Number(id))
        ));

    return {
        ok: true,
    };
};
