const { eq } = require("drizzle-orm");
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
        so_dien_thoai: row.username,
        password: row.password,
        ho_ten: row.ho_ten,
        dia_chi_dong_1: row.dia_chi_dong_1 || null,
        xa_phuong: row.xa_phuong || null,
        tinh_thanh: row.tinh_thanh || null,
        nghe_nghiep: row.nghe_nghiep || null,
        doi_tuong: row.doi_tuong || null,
        don_vi_id: row.don_vi_id,
        role: row.role,
        avatar: null,
        created_at: row.created_at,
        workspace: null,
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
            dia_chi_dong_1: users.diaChiDong1,
            xa_phuong: users.xaPhuong,
            tinh_thanh: users.tinhThanh,
            nghe_nghiep: users.ngheNghiep,
            doi_tuong: users.doiTuong,
            don_vi_id: users.donViId,
            role: users.role,
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

exports.login = async (user) => {
    return exports.getUserByUsername(user);
};

exports.getUserById = async (id) => {
    return selectUserByCondition(eq(users.id, Number(id)));
};

exports.getUserByUsername = async (username) => {
    return selectUserByCondition(eq(users.username, username));
};

exports.taoNguoiDung = async ({
    username,
    pass,
    hoTen,
    diaChiDong1 = null,
    xaPhuong = null,
    tinhThanh = null,
    ngheNghiep = null,
    doiTuong = null,
    donViId = null,
}) => {
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
            diaChiDong1,
            xaPhuong,
            tinhThanh,
            ngheNghiep,
            doiTuong,
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

exports.capNhatThongTinNguoiDung = async (username, profile = {}) => {
    const nextData = {};

    if (profile.hoTen !== undefined) {
        nextData.hoTen = profile.hoTen;
    }

    if (profile.diaChiDong1 !== undefined) {
        nextData.diaChiDong1 = profile.diaChiDong1;
    }

    if (profile.xaPhuong !== undefined) {
        nextData.xaPhuong = profile.xaPhuong;
    }

    if (profile.tinhThanh !== undefined) {
        nextData.tinhThanh = profile.tinhThanh;
    }

    if (profile.ngheNghiep !== undefined) {
        nextData.ngheNghiep = profile.ngheNghiep;
    }

    if (profile.doiTuong !== undefined) {
        nextData.doiTuong = profile.doiTuong;
    }

    if (profile.donViId !== undefined) {
        nextData.donViId = profile.donViId;
    }

    await db
        .update(users)
        .set(nextData)
        .where(eq(users.username, username));

    return exports.getUserByUsername(username);
};
