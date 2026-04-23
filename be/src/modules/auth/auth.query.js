const { and, eq, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, refreshTokens, users } = require("../../db/schema");

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

exports.login = async (user, pass) => {
    return exports.getUserByUsername(user);
};

exports.getUserByUsername = async (username) => {
    return selectUserByCondition(eq(users.username, username));
};

exports.taoNguoiDung = async (username, pass, hoTen, donViId) => {
    const existing = await exports.getUserByUsername(username);

    if (existing) {
        throw `Tài khoản ${username} đã tồn tại`;
    }

    const [created] = await db
        .insert(users)
        .values({
            username,
            password: pass,
            hoTen,
            donViId,
            role: "user",
        })
        .returning({id: users.id});

    return selectUserByCondition(eq(users.id, created.id));
};

exports.saveRefresh = async (id, user, token, exp) => {
    await db
        .insert(refreshTokens)
        .values({
            id,
            userId: user,
            token,
            expireAt: exp,
        });

    return null;
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

exports.capNhatThongTinNguoiDung = async (username, hoTen, donViId) => {
    await db
        .update(users)
        .set({
            hoTen,
            donViId,
        })
        .where(eq(users.username, username));

    return exports.getUserByUsername(username);
};

