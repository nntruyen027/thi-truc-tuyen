import api from "~/services/api";

const BASE_PATH = "/cau-hinh";

export async function layCauHinh(khoa, options = {}){
    try {
        const res = await api.get(BASE_PATH + "/" + khoa, {
            params: {
                ...(options.workspaceId ? {workspaceId: options.workspaceId} : {}),
            },
        });
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}

export async function suaCauHinh(khoa, giaTri, options = {}){
    try {
        const res = await api.post(BASE_PATH + "/" + khoa, {
            giaTri,
            ...(options.workspaceId ? {workspaceId: options.workspaceId} : {}),
        });
        return res.data;
    }
    catch (e) {
        throw new Error(e?.response?.data?.message);
    }
}
