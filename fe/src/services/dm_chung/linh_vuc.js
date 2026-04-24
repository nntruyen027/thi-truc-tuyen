import api from "~/services/api";

const BASE_PATH = "/dm-chung/linh-vuc";

// Lay ds don vi
export async function layLinhVuc({ size = 10,
                                   page = 1,
                                   search = "",
                                   sortField = "id",
                                   sortType = "asc"}){
    try {
        const res = await api.get(BASE_PATH, {
            params: {
                size,
                page,
                search,
                sortField,
                sortType
            }
        });
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themLinhVuc(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaLinhVuc(id, value) {
    try {
        const res = await api.put(BASE_PATH + '/' + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaLinhVuc(id) {
    try {
        await api.delete(BASE_PATH + '/' + id);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
