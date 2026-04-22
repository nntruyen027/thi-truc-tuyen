import api from "~/services/api";

const BASE_PATH = "/users";

// Lay ds don vi
export async function layDsNguoiDung({ size = 10,
                                   page = 1,
                                   search = "",
                                   }){
    try {
        const res = await api.get(BASE_PATH, {
            params: {
                size,
                page,
                search,
            }
        });
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function capNhatMatKhau(username) {
    try {
        const res = await api.post(BASE_PATH + "/" + username + "/password")
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themNguoiDung(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaNguoiDung(id, value) {
    try {
        const res = await api.put(BASE_PATH + "/" + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaNguoiDung(id) {
    try {
        const res = await api.delete(BASE_PATH + "/" + id);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function capNhatQuyenNguoiDung(id, role) {
    try {
        const res = await api.patch(BASE_PATH + "/" + id + "/role", {role});
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

