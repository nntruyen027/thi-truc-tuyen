const { and, count, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, users, workspaces } = require("../../db/schema");
const { buildPagedResult, normalizePagination } = require("../../core/utils/drizzle");

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
        workspace_id: row.workspace_id,
        username: row.username,
        password: row.password,
        ho_ten: row.ho_ten,
        don_vi_id: row.don_vi_id,
        role: row.role,
        avatar: null,
        created_at: row.created_at,
        workspace: row.workspace_id ? {
            id: row.workspace_id,
            code: row.workspace_code,
            ten: row.workspace_ten,
            slug: row.workspace_slug,
            status: row.workspace_status,
        } : null,
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
            workspace_id: users.workspaceId,
            username: users.username,
            password: users.password,
            ho_ten: users.hoTen,
            don_vi_id: users.donViId,
            role: users.role,
            created_at: users.createdAt,
            workspace_code: workspaces.code,
            workspace_ten: workspaces.ten,
            workspace_slug: workspaces.slug,
            workspace_status: workspaces.status,
            don_vi_ten: donVi.ten,
            don_vi_mo_ta: donVi.moTa,
        })
        .from(users)
        .leftJoin(workspaces, eq(users.workspaceId, workspaces.id))
        .leftJoin(donVi, eq(users.donViId, donVi.id))
        .where(condition)
        .limit(1);

    return mapUser(row);
}

exports.getUsers = async (search, page, size, scope = {}) => {
    const paging = normalizePagination({page, size});
    const conditions = [];
    const searchCondition = buildSearch(search);

    if (scope.role !== "super_admin") {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    } else if (scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    }

    if (searchCondition) {
        conditions.push(searchCondition);
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rowsQuery = db
        .select({
            id: users.id,
            workspace_id: users.workspaceId,
            username: users.username,
            password: users.password,
            ho_ten: users.hoTen,
            don_vi_id: users.donViId,
            role: users.role,
            created_at: users.createdAt,
            workspace_code: workspaces.code,
            workspace_ten: workspaces.ten,
            workspace_slug: workspaces.slug,
            workspace_status: workspaces.status,
            don_vi_ten: donVi.ten,
            don_vi_mo_ta: donVi.moTa,
        })
        .from(users)
        .leftJoin(workspaces, eq(users.workspaceId, workspaces.id))
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

exports.updatePassword = async (username, password, workspaceId = null) => {
    const condition = workspaceId
        ? and(eq(users.username, username), eq(users.workspaceId, Number(workspaceId)))
        : eq(users.username, username);

    const updated = await db
        .update(users)
        .set({
            password,
        })
        .where(condition)
        .returning({id: users.id});

    return updated.length > 0;
};

exports.getUserById = async (id, scope = {}) => {
    const conditions = [eq(users.id, Number(id))];

    if (scope.role !== "super_admin" && scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    } else if (scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    }

    return selectUserByCondition(and(...conditions));
};

exports.getUserByUsername = async (username, scope = {}) => {
    const conditions = [eq(users.username, username)];

    if (scope.role !== "super_admin" && scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    } else if (scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    }

    return selectUserByCondition(and(...conditions));
};

exports.createUser = async ({
    workspaceId,
    username,
    hoTen,
    password,
    donViId,
    role,
}) => {
    const [created] = await db
        .insert(users)
        .values({
            workspaceId,
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
    workspaceId,
    username,
    hoTen,
    donViId,
    role,
    password = null,
}) => {
    await db
        .update(users)
        .set({
            ...(workspaceId ? {workspaceId} : {}),
            username,
            hoTen,
            donViId,
            role,
            ...(password ? {password} : {}),
        })
        .where(eq(users.id, Number(id)));
};

exports.deleteUser = async (id, scope = {}) => {
    const conditions = [eq(users.id, Number(id))];

    if (scope.role !== "super_admin" && scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    }

    await db
        .delete(users)
        .where(and(...conditions));
};

exports.updateRole = async (id, role, scope = {}) => {
    const conditions = [eq(users.id, Number(id))];

    if (scope.role !== "super_admin" && scope.workspaceId) {
        conditions.push(eq(users.workspaceId, Number(scope.workspaceId)));
    }

    await db
        .update(users)
        .set({role})
        .where(and(...conditions));
};

exports.usernameExists = async (username, excludeId = null, workspaceId = null) => {
    const conditions = [eq(users.username, username)];

    if (workspaceId) {
        conditions.push(eq(users.workspaceId, Number(workspaceId)));
    }

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

