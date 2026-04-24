import api from "~/services/api";
import { ensureUploadableFile } from "~/services/file";

const BASE_PATH = "/trac-nghiem";

// Lay ds don vi
export async function layTracNghiem({ size = 10,
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

export async function themTracNghiem(value) {
    try {
        const res = await api.post(BASE_PATH, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaTracNghiem(id, value) {
    try {
        const res = await api.put(BASE_PATH + '/' + id, value);
        return res.data.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function xoaTracNghiem(id) {
    try {
        await api.delete(BASE_PATH + '/' + id);
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function taiTemplate() {
    try {
        const res = await api.get(BASE_PATH + "/template");
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function importTracNghiem(file) {
    ensureUploadableFile(file);

    const form =
        new FormData()

    form.append(
        "file",
        file
    )

    const res =
        await api.post(
            "/trac-nghiem/import",
            form,
            {
                timeout: 10 * 60 * 1000,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            }
        )

    return res.data

}
