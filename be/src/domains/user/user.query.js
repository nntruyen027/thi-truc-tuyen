const { and, count, eq, ilike, or, sql } = require("drizzle-orm");
const db = require("../../db/client");
const { donVi, users } = require("../../db/schema");
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
        don_vi: mapDonVi(row),
    };
}

function buildSearch(search) {
    if (!search?.trim()) {
        return undefined;
    }

    const keyword = `%${search.trim()}%`;

    return or(
        ilike(users.hoTen, keyword),
        ilike(users.username, keyword)
    );
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

exports.getUsers = async (search, page, size, donViId) => {
    const paging = normalizePagination({page, size});
    const conditions = [];
    const searchCondition = buildSearch(search);
    const normalizedDonViId = Number(donViId);

    if (searchCondition) {
        conditions.push(searchCondition);
    }

    if (Number.isInteger(normalizedDonViId) && normalizedDonViId > 0) {
        conditions.push(eq(users.donViId, normalizedDonViId));
    }

    const where = conditions.length ? and(...conditions) : undefined;

    const rowsQuery = db
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
    diaChiDong1,
    xaPhuong,
    tinhThanh,
    ngheNghiep,
    doiTuong,
    password,
    donViId,
    role,
}) => {
    const [created] = await db
        .insert(users)
        .values({
            username,
            hoTen,
            diaChiDong1,
            xaPhuong,
            tinhThanh,
            ngheNghiep,
            doiTuong,
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
    diaChiDong1,
    xaPhuong,
    tinhThanh,
    ngheNghiep,
    doiTuong,
    donViId,
    role,
    password = null,
}) => {
    await db
        .update(users)
        .set({
            username,
            hoTen,
            diaChiDong1,
            xaPhuong,
            tinhThanh,
            ngheNghiep,
            doiTuong,
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
        .set({
            role,
        })
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
