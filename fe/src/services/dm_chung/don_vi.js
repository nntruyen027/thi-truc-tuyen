import api from "~/services/api";

const BASE_PATH = "/dm-chung/don-vi";

// Lay ds don vi
export async function getDonVi({ size = 10,
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

export async function themDonVi(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaDonVi(id, value) {
    try {
        const res = await api.put(BASE_PATH + '/' + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaDonVi(id) {
    try {
        await api.delete(BASE_PATH + '/' + id);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
