import api from "~/services/api";

const BASE_PATH = "/cuoc-thi";

// Lay ds don vi
export async function layCuocThi({ size = 10,
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

export async function layCuocThiTheoId (id) {
    try {
        const res = await api.get(BASE_PATH + "/" + id)
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function layThoiGianConLaiCuaCuocThi () {
    try {
        const res = await api.get(BASE_PATH + "/con-lai" )
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function layLuotThiHienTai () {
    try {
        const res = await api.get(BASE_PATH + "/luot-thi-hien-tai")
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function themCuocThi(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaCuocThi(id, value) {
    try {
        const res = await api.put(BASE_PATH + '/' + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaCuocThi(id) {
    try {
        const res = await api.delete(BASE_PATH + '/' + id);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
