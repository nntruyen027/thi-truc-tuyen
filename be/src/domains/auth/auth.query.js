const { and, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, refreshTokens, users, workspaces } = require("../../db/schema");

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

exports.login = async (user, pass) => {
    return exports.getUserByUsername(user);
};

exports.getUserById = async (id) => {
    return selectUserByCondition(eq(users.id, Number(id)));
};

exports.getUserByUsername = async (username, workspaceId = null) => {
    const scopedCondition = workspaceId
        ? and(eq(users.username, username), eq(users.workspaceId, Number(workspaceId)))
        : eq(users.username, username);

    const scopedUser = await selectUserByCondition(scopedCondition);

    if (scopedUser) {
        return scopedUser;
    }

    return selectUserByCondition(and(
        eq(users.username, username),
        eq(users.role, "super_admin")
    ));
};

exports.taoNguoiDung = async (username, pass, hoTen, donViId, workspaceId) => {
    const existing = await exports.getUserByUsername(username, workspaceId);

    if (existing) {
        throw `Tài khoản ${username} đã tồn tại`;
    }

    const [created] = await db
        .insert(users)
        .values({
            workspaceId,
            username,
            password: pass,
            hoTen,
            donViId,
            role: "user",
        })
        .returning({id: users.id});

    return selectUserByCondition(eq(users.id, created.id));
};

exports.saveRefresh = async (id, user, workspaceId, token, exp) => {
    await db
        .insert(refreshTokens)
        .values({
            id,
            workspaceId,
            userId: user,
            token,
            expireAt: exp,
        });

    return null;
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

exports.capNhatThongTinNguoiDung = async (username, hoTen, donViId, workspaceId = null) => {
    const condition = workspaceId
        ? and(eq(users.username, username), eq(users.workspaceId, Number(workspaceId)))
        : eq(users.username, username);

    await db
        .update(users)
        .set({
            hoTen,
            donViId,
        })
        .where(condition);

    return exports.getUserByUsername(username, workspaceId);
};

