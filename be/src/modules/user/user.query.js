const { and, count, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, users } = require("../../db/schema");
const { buildPagedResult, normalizePagination } = require("../../utils/drizzle");

function mapDonVi(row) {
    if (!row?.don_vi_id) {
        return null;
    }

    return {
        id: row.don_vi_id,
        ten: row.don_vi_ten,
        mo_ta: row.don_vi_mo_ta,
    };
}

function mapUser(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        password: row.password,
        ho_ten: row.ho_ten,
        don_vi_id: row.don_vi_id,
        role: row.role,
        avatar: row.avatar,
        created_at: row.created_at,
        don_vi: mapDonVi(row),
    };
}

function buildSearch(search) {
    if (!search?.trim()) {
        return undefined;
    }

    return sql`unaccent(lower(${users.hoTen})) like ${`%${search.trim().toLowerCase()}%`}`;
}

async function selectUserByCondition(condition) {
    const [row] = await db
        .select({
            id: users.id,
            username: users.username,
            password: users.password,
            ho_ten: users.hoTen,
            don_vi_id: users.donViId,
            role: users.role,
            avatar: users.avatar,
            created_at: users.createdAt,
            don_vi_ten: donVi.ten,
            don_vi_mo_ta: donVi.moTa,
        })
        .from(users)
        .leftJoin(donVi, eq(users.donViId, donVi.id))
        .where(condition)
        .limit(1);

    return mapUser(row);
}

exports.getUsers = async (search, page, size) => {
    const paging = normalizePagination({page, size});
    const where = buildSearch(search);

    const rowsQuery = db
        .select({
            id: users.id,
            username: users.username,
            password: users.password,
            ho_ten: users.hoTen,
            don_vi_id: users.donViId,
            role: users.role,
            avatar: users.avatar,
            created_at: users.createdAt,
            don_vi_ten: donVi.ten,
            don_vi_mo_ta: donVi.moTa,
        })
        .from(users)
        .leftJoin(donVi, eq(users.donViId, donVi.id))
        .limit(paging.size)
        .offset(paging.offset);

    const totalQuery = db
        .select({total: count(users.id)})
        .from(users);

    const [rows, totalRows] = await Promise.all([
        where ? rowsQuery.where(where) : rowsQuery,
        where ? totalQuery.where(where) : totalQuery,
    ]);

    return buildPagedResult({
        data: rows.map(mapUser),
        total: totalRows[0]?.total || 0,
        page: paging.page,
        size: paging.size,
    });
};

exports.updatePassword = async (username, password) => {
    const updated = await db
        .update(users)
        .set({
            password,
        })
        .where(eq(users.username, username))
        .returning({id: users.id});

    return updated.length > 0;
};

exports.getUserById = async (id) => {
    return selectUserByCondition(eq(users.id, Number(id)));
};

exports.getUserByUsername = async (username) => {
    return selectUserByCondition(eq(users.username, username));
};

exports.createUser = async ({
    username,
    hoTen,
    password,
    donViId,
    role,
}) => {
    const [created] = await db
        .insert(users)
        .values({
            username,
            hoTen,
            password,
            donViId,
            role,
        })
        .returning({id: users.id});

    return created?.id;
};

exports.updateUser = async ({
    id,
    username,
    hoTen,
    donViId,
    role,
    password = null,
}) => {
    await db
        .update(users)
        .set({
            username,
            hoTen,
            donViId,
            role,
            ...(password ? {password} : {}),
        })
        .where(eq(users.id, Number(id)));
};

exports.deleteUser = async (id) => {
    await db
        .delete(users)
        .where(eq(users.id, Number(id)));
};

exports.updateRole = async (id, role) => {
    await db
        .update(users)
        .set({role})
        .where(eq(users.id, Number(id)));
};

exports.usernameExists = async (username, excludeId = null) => {
    const conditions = [eq(users.username, username)];

    if (excludeId !== null && excludeId !== undefined) {
        conditions.push(sql`${users.id} <> ${Number(excludeId)}`);
    }

    const [row] = await db
        .select({id: users.id})
        .from(users)
        .where(and(...conditions))
        .limit(1);

    return Boolean(row);
};

