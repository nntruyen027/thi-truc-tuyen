import api from "~/services/api";


const BASE_PATH = "/file";

export async function uploadFile(file) {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post(`${BASE_PATH}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if(!res.data.success) {
            throw new Error(res.data.message)
        }
        return res.data.data;
    }
    catch (error) {
        throw new Error(error?.response?.data?.message);
    }

}


export function getPublicFileUrl(duongDan) {
    return `http://localhost:3000/${duongDan}`;
}
