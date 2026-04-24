import api from "~/services/api";

const BASE_PATH = "/workspaces";

export async function layWorkspaceHienTai() {
    const res = await api.get(`${BASE_PATH}/current`);
    return res.data.data;
}

export async function layDanhSachWorkspace() {
    const res = await api.get(BASE_PATH);
    return res.data.data;
}

export async function taoWorkspace(payload) {
    const res = await api.post(BASE_PATH, payload);
    return res.data.data;
}

export async function capNhatWorkspace(id, payload) {
    const res = await api.put(`${BASE_PATH}/${id}`, payload);
    return res.data.data;
}
