import api from "~/services/api";

const BASE_PATH = "/bai-viet";

function normalizeBaiViet(item = {}) {
    return {
        id: item.id,
        tieuDe: item.tieuDe || "",
        tomTat: item.tomTat || "",
        anhDaiDien: item.anhDaiDien || "",
        noiDung: item.noiDung || "",
        ngayDang: item.ngayDang || new Date().toISOString(),
        trangThai: item.trangThai ?? true,
        createdAt: item.createdAt || item.ngayDang || new Date().toISOString(),
        updatedAt: item.updatedAt || item.ngayDang || new Date().toISOString(),
    };
}

export async function layDanhSachBaiViet(params = {}) {
    try {
        const res = await api.get(BASE_PATH, {
            params: {
                size: params.size || 50,
                page: params.page || 1,
                search: params.search || "",
                chiHienThi: params.chiHienThi ?? true,
            }
        });

        return {
            ...(res.data?.data || {}),
            data: (res.data?.data?.data || []).map(normalizeBaiViet),
        };
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function taoBaiViet(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return normalizeBaiViet(res.data?.data);
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaBaiViet(id, value) {
    try {
        const res = await api.put(`${BASE_PATH}/${id}`, value);
        return normalizeBaiViet(res.data?.data);
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaBaiViet(id) {
    try {
        const res = await api.delete(`${BASE_PATH}/${id}`);
        return res.data?.data;
    } catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

