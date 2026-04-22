import api from "~/services/api";

const BASE_PATH = "/cau-hinh";

export async function layCauHinh(khoa){
    try {
        const res = await api.get(BASE_PATH + "/" + khoa);
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaCauHinh(khoa, giaTri){
    try {
        const res = await api.post(BASE_PATH + "/" + khoa, {giaTri});
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}